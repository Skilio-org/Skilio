# 🐳 Stage 1: Docker & Multi-File Compose Architecture
### Comprehensive Presentation & Technical Reference Guide

---

## 1. Architectural Overview & The Multi-File Philosophy

Our containerization strategy is structured around **three core principles**:
1. **Separation of Concerns:** Separate base service definitions from environment-specific configurations.
2. **Security by Default:** Zero host port exposure for private datastores in production.
3. **Single-Command Developer Experience:** Zero manual flags required for local development.

```text
                             ┌──────────────────────────────────┐
                             │           compose.yml            │
                             │  • Canonical Service Definitions │
                             │  • Private Bridge Networking     │
                             │  • Healthchecks & Dependencies   │
                             │  • Volumes & Restart Policies    │
                             └─────────────────┬────────────────┘
                                               │
                    ┌──────────────────────────┴──────────────────────────┐
                    ▼                                                     ▼
      [ Local Development Mode ]                            [ Production Deployment Mode ]
        `docker compose up -d`                       `docker compose -f compose.yml -f compose.deploy.yml up -d`
                    │                                                     │
  ┌─────────────────┴─────────────────┐                 ┌─────────────────┴─────────────────┐
  │       compose.override.yml        │                 │        compose.deploy.yml         │
  │ • Host port bindings (5432, 6379) │                 │ • TLS 1.3 / Let's Encrypt (ACME)  │
  │ • Mailpit mock SMTP service       │                 │ • HTTP 80 ──▶ HTTPS 443 Redirect  │
  │ • Traefik debug API (:8090)       │                 │ • Host port lockdown (No DB ports)│
  │ • Live code reload (fastapi dev)  │                 │ • Deep healthcheck routing        │
  │ • Traefik log level: DEBUG        │                 │ • Restart policy: `always`        │
  └───────────────────────────────────┘                 └───────────────────────────────────┘
```

---

## 2. Container Build Pipeline: `backend/Dockerfile` & `.dockerignore`

The entire application (FastAPI backend + React SPA frontend) is packaged into a single, highly-optimized container using a **two-stage multi-stage build**.

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STAGE 1: Frontend Asset Compilation (`oven/bun:1 AS frontend-build`)                   │
 │                                                                                        │
 │  package.json + bun.lock ──▶ bun install ──▶ COPY ./frontend ──▶ bun run build        │
 │                                                                   │                    │
 │                                            Outputs: /app/frontend/dist                 │
 └───────────────────────────────────────────────────────────┬────────────────────────────┘
                                                             │ (Transfers only compiled static HTML/JS/CSS)
                                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STAGE 2: Production Python Runtime (`python:3.14`)                                     │
 │                                                                                        │
 │  1. Install Astral `uv` binary from official image                                     │
 │  2. COPY pyproject.toml uv.lock ──▶ uv sync (Layer Cached Dependencies)                │
 │  3. COPY backend source code + Alembic migrations                                      │
 │  4. COPY --from=frontend-build static assets into /app/backend/app/frontend            │
 │  5. CMD: ["fastapi", "run", "--workers", "4"]                                          │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Line-by-Line Technical Analysis (`backend/Dockerfile`)

#### Stage 1: Frontend Build (`oven/bun:1`)
* `FROM oven/bun:1 AS frontend-build`: Uses Bun on Alpine Linux. Bun installs dependencies and bundles our Vite React application in under 3 seconds, significantly faster than Node.js/npm.
* `COPY package.json bun.lock /app/` & `COPY frontend/package.json /app/frontend/`: Isolates package manifests first so Docker can cache the dependency layer if source files haven't changed.
* `RUN bun run build`: Emits optimized production static assets into `/app/backend/app/frontend`.

#### Stage 2: Production Python Runtime (`python:3.14`)
* `ENV PYTHONUNBUFFERED=1`: Ensures stdout/stderr are flushed immediately to Docker logs without buffer delays.
* `ENV UV_COMPILE_BYTECODE=1`: Pre-compiles Python `.py` to `.pyc` during build, speeding up application startup.
* `ENV UV_LINK_MODE=copy`: Tells `uv` to use file copying instead of hardlinks, compatible with all container volume storage drivers.
* `ENV PATH="/app/.venv/bin:$PATH"`: Injects the virtual environment's binary path globally so tools execute directly.
* `COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /bin/`: Copies the compiled `uv` Rust binary directly without needing `pip` or system build tools.
* `COPY pyproject.toml uv.lock ./` followed by `RUN uv sync --frozen --no-install-workspace --package app`:
  * **Critical Layer Caching:** Downloads and installs all external Python libraries before copying application code. If you edit Python code, Docker reuses this cached layer in milliseconds.
* `COPY --from=frontend-build /app/backend/app/frontend /app/backend/app/frontend`: Copies only the final compiled frontend assets from Stage 1. No Node.js runtime, Bun binaries, or 200 MB of `node_modules` exist in this production image.
* `CMD ["fastapi", "run", "--workers", "4"]`: Starts the production ASGI server with 4 concurrent worker processes to utilize multi-core instances.

---

### Build Context Minimization: `.dockerignore`

The `.dockerignore` file prevents unnecessary host files from entering the Docker build context:
* **Excludes `.git`:** Prevents repository history from inflating build context.
* **Excludes `**/__pycache__`, `**/.venv`, `**/node_modules`:** Eliminates architecture-specific host binaries and stale caches.
* **Excludes `.env`, `.env.*` (while whitelisting `!.env.example`): **Strict Security Control:** Guarantees production secrets and credentials are never baked into image layers.
* **Excludes `devops/backup/dumps/`:** Prevents massive SQL database dumps from bloating the image.

---

## 3. The Core Blueprint: `compose.yml`

`compose.yml` establishes the shared services, the internal network mesh, volumes, and health contracts.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      DOCKER INTERNAL BRIDGE NETWORK                    │
 │                                                                        │
 │   ┌──────────────┐         HTTP:8000          ┌────────────────────┐   │
 │   │    proxy     │ ─────────────────────────▶ │      backend       │   │
 │   │  (Traefik)   │ ◀───────────────────────── │     (FastAPI)      │   │
 │   └──────┬───────┘      Reverse Proxy         └─────┬────────┬─────┘   │
 │          │                                          │        │         │
 │          │ (Docker Socket / Events)      PostgreSQL │        │ Redis   │
 │          ▼                                   :5432  │        │ :6379   │
 │   /var/run/docker.sock                              ▼        ▼         │
 │                                              ┌────────┐  ┌─────────┐   │
 │   ┌───────────────────────────────────┐      │   db   │  │  redis  │   │
 │   │        Observability Stack        │      └────┬───┘  └─────────┘   │
 │   │ • prometheus     • grafana        │           │                    │
 │   │ • cadvisor       • db-backup      │           ▼ Volume             │
 │   │ • postgres-exporter               │    [app-db-data]               │
 │   └───────────────────────────────────┘    (/var/lib/postgresql/data)  │
 └────────────────────────────────────────────────────────────────────────┘
```

### Key Service Roles & Technical Details

1. **`proxy` (Traefik v3.6)**:
   * Acts as the unified ingress controller and edge router.
   * Connects to `${DOCKER_SOCKET:-/var/run/docker.sock}:ro` to dynamically discover backend services via container labels without manual Nginx configuration reloads.
   * `--providers.docker.exposedbydefault=false`: Secure by default; services must explicitly declare `traefik.enable=true` to be routed.

2. **`db` (PostgreSQL 18)**:
   * `image: postgres:18` provides the primary relational database.
   * `volumes: - app-db-data:/var/lib/postgresql/data`: Maps data to a persistent named volume that survives container restarts and upgrades.
   * `healthcheck`: Tests responsiveness every 10s using `pg_isready -U postgres -d app`.

3. **`redis` (Redis 7-Alpine)**:
   * Provides ultra-fast in-memory caching and session state.
   * `healthcheck`: Pings the engine via `redis-cli ping` with a 10s interval.

4. **`backend` (FastAPI Application)**:
   * **Self-Healing Startup Dependencies:**
     ```yaml
     depends_on:
       db:
         condition: service_healthy
         restart: true
       redis:
         condition: service_healthy
         restart: true
     ```
     FastAPI will not start until PostgreSQL and Redis report `healthy`, preventing crash loops. `restart: true` ensures that if DB restarts, backend automatically follows.
   * **Internal Network Addressing:**
     Connects directly through Docker DNS names:
     `DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/app`
     `REDIS_URL: redis://redis:6379/0`
   * **Strict Variable Enforcement:** `${POSTGRES_PASSWORD:?Variable not set}` guarantees that Compose immediately aborts if required secrets are missing.
   * **Internal Healthcheck:** Probes `/api/v1/utils/health-check/` via `curl` to confirm HTTP responsiveness.

5. **Observability & Auxiliary Services**:
   * **`db-backup`**: Runs scheduled automated database dumps (`pg_dump`) to compressed `.sql.gz` files on a configurable cron.
   * **`prometheus`**: Scrapes application and container metrics every 15s.
   * **`postgres-exporter`**: Exports PostgreSQL internal metrics (connection pools, query duration) to Prometheus.
   * **`cadvisor`**: Collects resource metrics directly from cgroups (CPU, RAM, network I/O).
   * **`grafana`**: Pre-configured dashboards for monitoring infrastructure and application health.

6. **Restart Policy:**
   * All baseline services are marked with `restart: unless-stopped`, ensuring automatic recovery from crashes while respecting manual `docker compose stop/down` commands.

---

## 4. Local Development: `compose.override.yml`

Docker Compose automatically detects and merges `compose.override.yml` when running `docker compose up` without `-f` flags. This file transforms the isolated container stack into an interactive development workspace.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      LOCAL DEVELOPMENT OVERRIDES                       │
 │                                                                        │
 │   HOST MACHINE                                CONTAINERS               │
 │                                                                        │
 │   DBeaver / DataGrip        ────────▶   db (Port 5432 published)       │
 │   Redis GUI / CLI           ────────▶   redis (Port 6379 published)    │
 │   Local Web Browser / Curl  ────────▶   backend (Port 8000 published)  │
 │   Traefik Web Dashboard     ────────▶   proxy (Port 8090 published)    │
 │   Prometheus UI             ────────▶   prometheus (Port 9090)         │
 │   Grafana Dashboard         ────────▶   grafana (Port 3000)            │
 │   Mailpit Web UI            ────────▶   mailpit (Port 8025 / 1025)     │
 │                                                                        │
 │   • backend command overridden with: `fastapi dev --host 0.0.0.0`      │
 │   • Traefik log level set to: `DEBUG`                                  │
 └────────────────────────────────────────────────────────────────────────┘
```

### Architectural Decisions in Development:
* **Host Port Exposure:** Ports `5432` (DB), `6379` (Redis), and `8000` (FastAPI) are published to `localhost` so developers can use native IDEs, debuggers, and database clients.
* **Mock Email Testing with Mailpit:**
  * Runs `axllent/mailpit` locally on ports `1025` (SMTP) and `8025` (Web UI).
  * Backend points `SMTP_HOST: mailpit`. All verification emails and password resets are captured locally in a web inbox without sending real emails or requiring external SMTP credentials.
* **Live Hot-Reloading:**
  * Backend command is overridden with `fastapi dev --host 0.0.0.0`, enabling automatic server reloads whenever code files are modified.

---

## 5. Production Hardening: `compose.deploy.yml`

In production, deployment scripts explicitly merge this file:
`docker compose -f compose.yml -f compose.deploy.yml up -d`

This overlay strips away development tools and hardens the infrastructure for public internet deployment.

```text
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │                      PRODUCTION HARDENED ARCHITECTURE                          │
 │                                                                                │
 │   PUBLIC INTERNET                                                              │
 │         │                                                                      │
 │         ├─────── HTTP Port 80 ────▶ [ Traefik HTTP 308 Permanent Redirect ]    │
 │         │                                         │                            │
 │         ▼                                         ▼                            │
 │   HTTPS Port 443 ─────────────────────▶ [ Traefik Reverse Proxy ]              │
 │   (Encrypted TLS 1.3)                             │                            │
 │                                                   │ Let's Encrypt (ACME TLS)   │
 │                                                   ▼ Automated Certificate      │
 │                                            [traefik-certificates]              │
 │                                                                                │
 │   PRIVATE DOCKER NETWORK (Zero Host Port Bindings)                             │
 │         │                                                                      │
 │         ├──────────── Host: skilio.works ───────────▶ backend:8000             │
 │         │             (Deep Healthcheck Routed)                                │
 │         │                                                                      │
 │         ├──────────── Host: grafana.skilio.works ───▶ grafana:3000             │
 │         │                                                                      │
 │         ├──X── PostgreSQL (5432): Closed to Host Internet (Zero public port)   │
 │         └──X── Redis (6379):      Closed to Host Internet (Zero public port)   │
 │                                                                                │
 │   • Restart policy: `always` on all production services                        │
 └────────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Decisions in Production:
1. **Zero-Trust Network Perimeter:**
   * Removes all published ports for `db`, `redis`, and internal tools. Only ports `80` (HTTP) and `443` (HTTPS) are exposed to the public internet on the AWS host.
2. **Automated ACME TLS (Let's Encrypt):**
   * Configured via Traefik command flags:
     `--certificatesresolvers.le.acme.email=${ACME_EMAIL}`
     `--certificatesresolvers.le.acme.storage=/certificates/acme.json`
     `--certificatesresolvers.le.acme.tlschallenge=true`
   * Automatically requests, validates, and renews SSL/TLS certificates before expiry.
   * Stores certificates in a persistent named volume (`traefik-certificates`).
3. **Mandatory HTTPS Enforcement:**
   * Traefik unconditionally redirects HTTP (80) requests to HTTPS (443) using an HTTP 308 Permanent Redirect.
4. **Dynamic Healthcheck Routing:**
   * Traefik actively probes `backend` via:
     `traefik.http.services.backend.loadbalancer.healthCheck.path=/api/v1/health`
   * If PostgreSQL or Redis fails and the health check responds with an error, Traefik automatically suspends routing to the container instead of delivering broken pages to users.
5. **High-Availability Restart Policy:**
   * Sets `restart: always` on critical production containers (`proxy`, `db`, `redis`, `backend`, `grafana`), ensuring immediate recovery upon container crash or full host reboot.

---

## 6. Architecture Comparison Matrix

| Dimension | `compose.yml` (Base) | `compose.override.yml` (Dev) | `compose.deploy.yml` (Prod) |
| :--- | :--- | :--- | :--- |
| **Target Audience** | Shared blueprint | Local developer laptop | AWS EC2 Cloud Server |
| **Invocation** | Included in all modes | Auto-loaded (`docker compose up`) | Explicit (`-f compose.deploy.yml`) |
| **Ingress Protocols** | HTTP Port 80 | HTTP 80 + Traefik API (8090) | Strict HTTPS (443) + HTTP (80) redirect |
| **SSL / TLS** | None (Plain HTTP) | None | Automated Let's Encrypt (TLS 1.3) |
| **Datastore Ports** | Internal network only | Published (`5432`, `6379`) | **Strictly blocked** from host |
| **Backend Execution** | `fastapi run --workers 4` | `fastapi dev --host 0.0.0.0` | `fastapi run --workers 4` |
| **Email Subsystem** | Configured via env | Local Mailpit UI (:8025) | Production SMTP Relay |
| **Restart Policy** | `unless-stopped` | Default / Inherited | `always` |
| **Logging Level** | Standard INFO | DEBUG | Structured INFO / Access Logs |
