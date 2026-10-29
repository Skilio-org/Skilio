# 🎓 DevOps Defense & Preparation Plan

> **Role:** DevOps Lead  
> **Project:** Freelancer Platform (*Skilio*) — `ft_transcendence`  
> **Live Domain:** [https://skilio.works](https://skilio.works) (AWS EC2 • Elastic IP: `16.192.59.166`)  
> **Modules Covered:**  
> • **IV.10 Major (2 Pts):** Production Cloud Deployment & Automated CI/CD  
> • **IV.7 Minor (1 Pt):** Health Check, Public Status Page & Disaster Recovery  
> • **IV.7 Major (2 Pts):** Observability Suite (Prometheus & Grafana)  
> • **Section III:** Single-Command Containerization & Mandatory HTTPS

---

## 📑 Contents
1. [Part 1: The Learning & Mastery Roadmap (7 Stages)](#part-1-the-learning--mastery-roadmap)
2. [Part 2: Master Presentation Order Flow (6 Phases)](#part-2-master-presentation-order-flow)

---

# Part 1: The Learning & Mastery Roadmap

Study these 7 stages in order to master every file, script, and architecture under your DevOps responsibility:

```text
Stage 1: Docker Core ──▶ Stage 2: Server & OS ──▶ Stage 3: Traefik & SSL
           │
           ▼
Stage 4: CI/CD Pipeline ──▶ Stage 5: Backups & DR ──▶ Stage 6: Observability
           │
           ▼
Stage 7: Developer Tooling & Team CLI (Makefile)
```

### 1. Docker & Multi-File Compose (The Foundation)
* **Files:** [`compose.yml`](../../compose.yml), [`compose.override.yml`](../../compose.override.yml), [`compose.deploy.yml`](../../compose.deploy.yml), [`backend/Dockerfile`](../../backend/Dockerfile), [`.dockerignore`](../../.dockerignore)
* **Core Concepts:**
  * **Multi-Stage Build**: Stage 1 uses Bun to compile the React SPA bundle; Stage 2 bundles it directly into the Python 3.14 FastAPI image.
  * **Bridge Network**: Containers communicate privately using service names (`db`, `redis`, `backend`) via Docker internal DNS.
  * **Named Volumes**: Persistent storage (`app-db-data`, `traefik-certificates`) surviving container rebuilds.
  * **Environment Isolation**: Local dev automatically uses `compose.override.yml` (debug ports, Mailpit); production locks them out with `COMPOSE_FILE=compose.yml:compose.deploy.yml`.

### 2. Linux OS Hardening & Bootstrap (The Server)
* **Documentation Mapping:** Covers [Learning Plan: Level 1](deployment/learning_plan.md#level-1-cloud--linux-infrastructure-iaas--aws) & [Deployment Plan: Phases 1 & 2](deployment/deployment_plan.md#phase-1-cloud-server--network-provisioning-iaas-completed-)
* **Files & Tools:** [`devops/scripts/server-init.sh`](../scripts/server-init.sh), `make server-init`, `skilio-key.pem`
* **Core Concepts:**
  * **IaaS & Cloud Networking (Phase 1)**: AWS EC2 (`t3.small`), static Elastic IP (`16.192.59.166`), and Security Group firewall (ports 22, 80, 443 open; DB/Redis strictly blocked).
  * **Asymmetric SSH Security**: Challenge-response authentication using `skilio-key.pem` (`chmod 400`); password authentication permanently disabled.
  * **2 GB Swap & OOM Prevention**: `fallocate -l 2G /swapfile` (`chmod 600`) prevents Linux Exit 137 OOM kills during frontend builds; `vm.swappiness=10` prioritizes physical RAM.
  * **Idempotent Automated Bootstrap (Phase 2)**: `server-init.sh` (`set -euo pipefail`, auto-sudo) safely re-runs without side effects, installs native Docker with `overlay2`, provisions `/opt/skilio`, and grants non-root Docker access.

### 3. Ingress, Reverse Proxy & HTTPS (The Gateway)
* **Files:** [`compose.deploy.yml`](../../compose.deploy.yml) (Traefik service)
* **Core Concepts:**
  * **Traefik Ingress**: Listens to `/var/run/docker.sock` to dynamically discover container routes and ports.
  * **Automated TLS**: Solves ACME HTTP/TLS-ALPN challenge with Let's Encrypt, auto-renewing certificates.
  * **HTTPS Enforcement**: Port 80 unconditionally redirects to encrypted Port 443 via HTTP 308.
  * **Health Routing**: Traefik probes `/api/v1/health` and stops routing to the backend container if checks fail.

### 4. Zero-Touch CI/CD Pipeline (The Delivery - IV.10 Major)
* **Files:** [`.github/workflows/ci-cd.yml`](../../.github/workflows/ci-cd.yml), [`DEPLOYMENT.md`](./DEPLOYMENT.md)
* **Core Concepts:**
  * **3-Tier CI Gate**: PRs must pass Ruff linting, TypeScript type-check, 173 backend pytest tests (83% coverage), and a Docker smoke test.
  * **Safe `rsync` over SSH**: Pushes code to EC2 without storing GitHub Personal Access Tokens on AWS (strictly least-privilege). Excludes `.env*` (secrets), `.git*`, and `devops/backup/dumps/`.
  * **Zero-Downtime Rolling Swap**: Builds images in background $\rightarrow$ runs migrations in ephemeral container (`run --rm prestart.sh`) $\rightarrow$ swaps live containers (`up -d --remove-orphans`) $\rightarrow$ prunes dangling layers.

### 5. High Availability & Disaster Recovery (IV.7 Minor)
* **Files:** [`devops/backup/backup.sh`](../backup/backup.sh), [`restore.sh`](../backup/restore.sh), [`dr-test.sh`](../backup/dr-test.sh), [`entrypoint.sh`](../backup/entrypoint.sh), [`BACKUP.md`](../backup/BACKUP.md), [`backend/app/api/routes/health.py`](../../backend/app/api/routes/health.py), [`frontend/src/routes/status.tsx`](../../frontend/src/routes/status.tsx)
* **Core Concepts:**
  * **RTO Target**: Recovery Time Objective `< 60s` (our actual drill runs in `< 5s`).
  * **Rolling Retention**: Automated `pg_dump` with `.sql.gz` compression via `entrypoint.sh` cron, keeping the last 7 daily archives.
  * **Sandbox DR Drill**: Ephemeral test database validates complete restore and schema integrity without touching production data.
  * **Diagnostic Probes**: `/api/v1/health` checks DB query latency (`SELECT 1`), Redis ping, and disk capacity; rendered on `/status`.

### 6. Observability & Telemetry (IV.7 Major)
* **Files:** [`devops/monitoring/MONITORING.md`](../monitoring/MONITORING.md), [`prometheus.yml`](../monitoring/prometheus.yml), `devops/monitoring/grafana/`
* **Core Concepts:**
  * **Prometheus Scraping**: Pulls metrics from backend and node exporters every 15s.
  * **Grafana Dashboards**: Real-time visualization of container CPU, RAM, HTTP throughput, and error rates at `https://grafana.skilio.works`.
  * **Alerting**: Pre-configured rules alerting on sustained high memory or container restarts.

### 7. Developer Tooling & Team CLI (The Developer Experience)
* **Files:** [`Makefile`](../../Makefile), [`devops/scripts/setup.sh`](../scripts/setup.sh), [`devops/scripts/dev.sh`](../scripts/dev.sh), [`docs/git-workflow.md`](../../docs/git-workflow.md)
* **Core Concepts:**
  * **Unified Control Panel**: Single-word commands for the whole team (`make setup`, `make dev`, `make test`, `make seed`).
  * **Cloud Management CLI**: Direct operations on AWS without memorizing commands (`make deploy-ssh`, `make deploy-status`, `make deploy-logs`, `make deploy-restart`, `make deploy-db-clean`).
  * **Team Standards**: Enforces standardized Git branch flow and commit conventions across all 4 team members.


---

# Part 2: Master Presentation Order Flow

Present your modules in this exact logical order during your evaluation defense:

```text
Phase 1: Live Cloud SaaS ──▶ Phase 2: Docker Core ──▶ Phase 3: CI/CD Pipeline
        (The Hook)                  (The Base)              (IV.10 Major)
            │
            ▼
Phase 4: Observability   ──▶ Phase 5: Disaster Recovery ──▶ Phase 6: Tooling
        (IV.7 Major)                (IV.7 Minor)               (Developer CLI)
```

---

### 🌐 Phase 1: Live Cloud Production SaaS (The Hook)
* **Requirement:** Mandatory Section III (Containerized Deployment & HTTPS).
* **Objective:** Prove the platform runs 24/7 on AWS cloud infrastructure, not just `localhost`.
* **Show & Demo:**
  * Open `https://skilio.works` in browser / mobile.
  * Inspect the green padlock (TLS 1.3 certificate issued by Let's Encrypt).
  * Show automatic redirection: `curl -sI http://skilio.works` $\rightarrow$ `HTTP/1.1 308 Permanent Redirect`.
* **Key Takeaway:** Zero-configuration HTTPS managed dynamically by Traefik 3.6.

---

### 🧱 Phase 2: Container Orchestration & Security Isolation (The Foundation)
* **Requirement:** Mandatory Section III.2 (Single-Command Run) & Security Isolation.
* **Objective:** Demonstrate full microservice lifecycle management and dev vs. prod isolation.
* **Show & Demo:**
  * Inspect [`compose.yml`](../../compose.yml) and [`compose.deploy.yml`](../../compose.deploy.yml).
  * Run `make status` to show all running containers and health states.
* **Key Takeaway:** PostgreSQL (5432) and Redis (6379) are isolated on Docker's private bridge network. Debug overrides (like Mailpit) are excluded in production via `COMPOSE_FILE=compose.yml:compose.deploy.yml`.

---

### 🚀 Phase 3: Zero-Touch CI/CD Pipeline (IV.10 Major Module)
* **Requirement:** Section IV.10 Module of Choice (Major — 2 Points).
* **Objective:** Prove continuous automated testing and zero-downtime production delivery.
* **Show & Demo:**
  * Show GitHub Actions test history (173 passing tests, 83% coverage).
  * Walk through [`.github/workflows/ci-cd.yml`](../../.github/workflows/ci-cd.yml): safe `rsync`, background image build, prestart migration gate, rolling swap (`up -d`), and layer prune.
* **Key Takeaway:** Ephemeral migration checks guarantee that broken schemas never restart live containers, ensuring true zero-downtime releases.

---

### 📊 Phase 4: Production Observability Suite (IV.7 Major Module)
* **Requirement:** Section IV.7 DevOps (Major — 2 Points): Prometheus & Grafana Monitoring.
* **Objective:** Demonstrate continuous automated metrics collection and real-time visualization.
* **Show & Demo:**
  * Open `https://grafana.skilio.works`.
  * Show real-time container CPU, memory utilization, and HTTP request rates updating as you browse the platform.
* **Key Takeaway:** Prometheus scrapes metrics every 15s; Grafana provides real-time infrastructure visibility and alert triggers.

---

### 💾 Phase 5: Deep Health Diagnostics & Disaster Recovery (IV.7 Minor Module)
* **Requirement:** Section IV.7 DevOps (Minor — 1 Point): Health Check & Disaster Recovery.
* **Objective:** Prove data resilience, automated retention, and catastrophic recovery in `< 60s`.
* **Show & Demo:**
  * Open `/status` on the web app: show live DB query latency (< 2ms) and Redis latency (< 1ms).
  * Run the live Disaster Recovery drill in terminal:
    ```bash
    make dr-test
    ```
* **Key Takeaway:** Automated rolling backups protect data with 7-day retention; the automated recovery drill restores the database in `< 5 seconds` (beating the `< 60s` RTO target).

---

### 🛠️ Phase 6: Developer CLI & Team Tooling (The Developer Experience)
* **Requirement:** Operational efficiency and developer ergonomics.
* **Objective:** Show how the DevOps role established a standardized interface for all 4 team members.
* **Show & Demo:**
  * Run `make help` to show the categorized developer command menu (`make up`, `make test`, `make dr-test`, `make deploy-status`, `make deploy-logs`).
* **Key Takeaway:** Standardized interface abstracting complex Docker and cloud SSH operations into intuitive 1-command targets.
