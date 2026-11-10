# 🌐 Stage 3: Ingress, Reverse Proxy & Mandatory HTTPS
### Comprehensive Presentation & Technical Reference Guide

---

## Architectural Overview & The Ingress Gateway

In a production microservice architecture, internal application containers are never exposed directly to the public internet. Instead, all incoming web traffic enters through a single, hardened point of entry known as the **Ingress Gateway**.

For the Skilio platform, **Traefik 3.6** serves as our edge reverse proxy and ingress controller.

```text
 [ Web Browser / Mobile / Evaluator ]
                 │
                 │ Resolves skilio.works / grafana.skilio.works
                 ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      AWS EC2 HOST (16.192.59.166)                      │
 │                                                                        │
 │  Port 80 (HTTP)  ────────▶ [ Automatic HTTP 308 Redirect ] ──┐         │
 │                                                              │         │
 │  Port 443 (HTTPS) ───────▶ [ TRAEFIK 3.6 REVERSE PROXY ]  ◀──┘         │
 │   (TLS 1.3 Encryption)     │ • Reads Docker Socket (/var/run/docker)   │
 │                            │ • Auto-resolves ACME Let's Encrypt TLS    │
 │                            │ • Deep Healthcheck Probing (/health)      │
 └────────────────────────────┼───────────────────────────────────────────┘
                              │
               DOCKER INTERNAL BRIDGE NETWORK
                              │
              ┌───────────────┴───────────────┐
              │                               │
    Host: skilio.works              Host: grafana.skilio.works
              │                               │
              ▼                               ▼
     ┌─────────────────┐             ┌─────────────────┐
     │  backend:8000   │             │  grafana:3000   │
     │  (FastAPI + UI) │             │  (Monitoring)   │
     └────────┬────────┘             └─────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
  ┌───────────┐   ┌────────────┐
  │ db:5432   │   │redis:6379  │
  └───────────┘   └────────────┘
 (Completely isolated; zero public ports)
```

---

## 1. Reverse Proxy & Traefik Core (Why Traefik over NGINX)

### Forward Proxy vs. Reverse Proxy
The word *Proxy* means an authorized intermediary. In computer networking, they serve opposite purposes:

```text
[ CLIENT-FACING ]                                                          [ SERVER-FACING ]
  Forward Proxy                                                               Reverse Proxy

 Client A ──┐                                                            ┌──▶ backend:8000 (App)
 Client B ──┼──▶ [ Forward Proxy ] ──▶ Global Internet ──▶ [ Traefik ] ──┼──▶ grafana:3000 (Metrics)
 Client C ──┘    (Protects Clients)                         (Proxy)      └──▶ Closed DBs   (Hidden)
                                                          (Protects Servers)
```

| Dimension | Forward Proxy (Client-Facing) | Reverse Proxy (Traefik Ingress) |
| :--- | :--- | :--- |
| **Position** | Sits in front of **users / clients**. | Sits in front of **internal containers / servers**. |
| **Who it protects** | Protects the client's identity and privacy. | Protects application servers, databases, and internal networks. |
| **What it hides** | The client's real IP address from websites. | The backend's internal architecture, topology, and ports. |
| **Examples** | School/Corporate VPN, Tor browser proxy. | **Traefik**, NGINX, HAProxy, AWS ALB. |

### The 4 Core Building Blocks of Traefik
Traefik processes every incoming network packet through four modular layers:

```text
 [ External Request ] ──▶ 1. EntryPoints ──▶ 2. Routers ──▶ 3. Middlewares ──▶ 4. Services ──▶ [ Container ]
```

1. **EntryPoints:** Network listeners bound to host ports (`:80` for `http`, `:443` for `https`).
2. **Routers:** The decision-makers. They analyze request properties (such as `Host(`skilio.works`)`) and match them against defined rules.
3. **Middlewares:** Interceptors that transform or secure requests (e.g., redirecting HTTP to HTTPS or setting security headers) before delivery.
4. **Services:** The forwarders that route traffic across Docker's private bridge network to target container ports (`:8000` or `:3000`).

---

### Why Traefik instead of NGINX?

NGINX is the standard web server, but in modern containerized microservice architectures, Traefik offers critical advantages:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      TRADITIONAL NGINX WORKFLOW                        │
 │                                                                        │
 │  Developer ──▶ Writes static `nginx.conf` ──▶ Copies file to container │
 │  New Container Added? ──▶ Edit config file ──▶ Run `nginx -s reload`   │
 │  (Risk: Stale container IPs, reload drops active WebSockets/streams)  │
 └────────────────────────────────────────────────────────────────────────┘

 ┌────────────────────────────────────────────────────────────────────────┐
 │                      TRAEFIK DYNAMIC WORKFLOW                          │
 │                                                                        │
 │  Traefik ──▶ Listens to `/var/run/docker.sock` (Docker API)            │
 │  New Container Added? ──▶ Attach Docker labels directly in Compose    │
 │  (Traefik dynamically detects containers in memory with ZERO downtime) │
 └────────────────────────────────────────────────────────────────────────┘
```

1. **Dynamic Service Discovery via the Docker Socket (`/var/run/docker.sock`):**
   * In containerized environments, containers constantly stop, start, and change internal IP addresses.
   * NGINX requires static configuration files. When container IPs change, NGINX routes to stale IPs unless complex custom DNS resolver workarounds are written.
   * Traefik mounts `/var/run/docker.sock:ro`. It subscribes directly to the Docker engine's event stream. The moment a container spins up, Traefik reads its labels and establishes routes in memory instantly.
2. **Built-in ACME Engine (Let's Encrypt Automation):**
   * NGINX has no native SSL certificate generation; it requires an external `certbot` container, webroot volume sharing, and cron reload scripts.
   * Traefik has an ACME client embedded directly into its Go binary. It requests, verifies, installs, and auto-renews TLS certificates with zero external tools.
3. **Zero-Downtime Hot Reconfiguration:**
   * Modifying NGINX requires an OS signal (`nginx -s reload`), which can disrupt active WebSocket connections.
   * Traefik hot-reloads routing tables in memory with zero connection drops.
4. **Zero-Trust Security via `exposedbydefault=false`:**
   * By passing `--providers.docker.exposedbydefault=false`, Traefik ignores every container by default.
   * Only containers explicitly labeled with `traefik.enable=true` are routed. This guarantees internal datastores like PostgreSQL (`5432`) and Redis (`6379`) are completely unreachable from the internet.

---

## 2. DNS & Host-Based Routing

### The 1 IP, 1 Port Dilemma
Our production environment operates with:
* **One** public IPv4 address: `16.192.59.166` (AWS Elastic IP).
* **One** secure ingress port: `443` (HTTPS).
* **Multiple** web services: The Skilio Web App and the Grafana Monitoring Dashboard.

To solve this, we use **DNS Records** combined with **Host-Based Routing**.

---

### DNS Architecture & Records

DNS (Domain Name System) translates human-readable hostnames into numerical IP addresses:

```text
 skilio.works          ──▶ DNS Lookup ──▶ 16.192.59.166
 grafana.skilio.works  ──▶ DNS Lookup ──▶ 16.192.59.166
```

In our domain registrar (Name.com), we configured three DNS records:

| Record Type | Host | Target Value | Purpose in Skilio Platform |
| :---: | :---: | :---: | :--- |
| **`A`** | `@` (Apex) | `16.192.59.166` | Maps root domain `https://skilio.works` directly to our AWS Elastic IP. |
| **`A` (Wildcard)** | `*` | `16.192.59.166` | Directs **all subdomains** (`grafana.skilio.works`, `api.skilio.works`, `status.skilio.works`) to our server without creating separate records. |


---

### Host-Based Routing: How Traefik Distinguishes Traffic

Once both domain names arrive at `16.192.59.166:443`, Traefik determines the destination container using two mechanisms:

1. **SNI (Server Name Indication) in TLS Handshake:**
   * Before the request is decrypted, the client's browser sends the target hostname in the cleartext `Client Hello` packet (SNI).
   * Traefik reads this hostname and immediately presents the correct SSL certificate.
2. **The HTTP `Host` Header:**
   * Once the TLS tunnel is encrypted, Traefik inspects the HTTP request header:
     * Request with `Host: skilio.works` $\rightarrow$ Forwarded to `backend:8000`.
     * Request with `Host: grafana.skilio.works` $\rightarrow$ Forwarded to `grafana:3000`.

```yaml
# backend in compose.deploy.yml
labels:
  - "traefik.http.routers.backend-https.rule=Host(`skilio.works`)"
  - "traefik.http.services.backend.loadbalancer.server.port=8000"

# grafana in compose.deploy.yml
labels:
  - "traefik.http.routers.grafana-https.rule=Host(`grafana.skilio.works`)"
  - "traefik.http.services.grafana.loadbalancer.server.port=3000"
```

## 3. Automated SSL/TLS Certificates (Let's Encrypt)

To serve HTTPS, our server needs an SSL/TLS certificate proving to browsers that `skilio.works` is authentic and trusted. Instead of buying certificates manually, we use **Let's Encrypt** automated through Traefik.

### The 3 Key Concepts for Evaluation:

1. **Automatic Certificate Issuance:**
   * **Let's Encrypt** is a free, automated Certificate Authority (CA).
   * When Traefik sees the label `tls.certresolver=le`, it automatically contacts Let's Encrypt to request a certificate for the domain (`skilio.works` or `grafana.skilio.works`).
   * Let's Encrypt verifies that our server controls the domain, then immediately issues a valid certificate.

2. **Zero-Maintenance Automatic Renewal:**
   * Let's Encrypt certificates are valid for 90 days.
   * Traefik runs an internal check daily and automatically renews any certificate that is within 30 days of expiring. No external `certbot` cron jobs or manual commands are required.

3. **Certificate Persistence Across Rebuilds:**
   * Let's Encrypt enforces a rate limit (50 certificate requests per domain per week).
   * If certificates were stored inside the container, every deployment or restart would request a new certificate, quickly hitting the rate limit and locking the domain out.
   * **Solution:** We mount a persistent Docker volume in [`compose.deploy.yml`]:
     ```yaml
     volumes:
       - traefik-certificates:/certificates
     ```
     Traefik stores the active certificates and private keys in `/certificates/acme.json` inside this volume. Even when the proxy container is updated or recreated, the certificates persist.

---

## 4. Mandatory HTTPS Enforcement (Section III Compliance)

### 42 Subject Section III Mandatory Requirement:
> **"Any connection to the backend, from a browser, from a script, from an external API, etc., must use HTTPS."**

To guarantee 100% compliance, cleartext HTTP on Port 80 cannot serve content under any circumstance.

In [`compose.deploy.yml`], Traefik enforces entrypoint redirection:
```yaml
command:
  - --entrypoints.http.address=:80
  - --entrypoints.http.http.redirections.entrypoint.to=https
  - --entrypoints.http.http.redirections.entrypoint.scheme=https
  - --entrypoints.https.address=:443
```


> [!NOTE]
> **Why HTTP 308 instead of 301?**
> When testing with `curl -sI http://skilio.works`, Traefik responds with `HTTP 308 Permanent Redirect`. Unlike legacy `301`, `308` guarantees that HTTP methods (`POST`, `PUT`, etc.) and request bodies are preserved without being stripped or converted to `GET` during the HTTPS redirect.

---

## 5. Traefik Configuration in Compose (Labels & Deep Health Routing)

### Line-by-Line Technical Analysis [`compose.deploy.yml`]

#### 1. Ingress Proxy Service (`proxy`):
```yaml
services:
  proxy:
    restart: always
    command:
      # 1. Enable dynamic Docker socket discovery
      - --providers.docker
      # 2. Enforce zero-trust isolation (no auto-exposure)
      - --providers.docker.exposedbydefault=false
      # 3. HTTP entrypoint on Port 80
      - --entrypoints.http.address=:80
      # 4. Global redirect rule: All HTTP traffic forced to HTTPS
      - --entrypoints.http.http.redirections.entrypoint.to=https
      - --entrypoints.http.http.redirections.entrypoint.scheme=https
      # 5. HTTPS entrypoint on Port 443
      - --entrypoints.https.address=:443
      # 6. Automated Let's Encrypt ACME Configuration
      - --certificatesresolvers.le.acme.email=${ACME_EMAIL:?Variable not set}
      - --certificatesresolvers.le.acme.storage=/certificates/acme.json
      - --certificatesresolvers.le.acme.tlschallenge=true
      # 7. Enable structured access and runtime logging
      - --accesslog
      - --log
    volumes:
      # Persistent storage for SSL certificates
      - traefik-certificates:/certificates
    ports:
      - "80:80"
      - "443:443"
```

---

#### 2. Deep Diagnostic Health Routing (`backend`):
```yaml
backend:
  restart: always
  labels:
    - traefik.enable=true
    - traefik.http.routers.backend-https.rule=Host(`${DOMAIN:?Variable not set}`)
    - traefik.http.routers.backend-https.entrypoints=https
    - traefik.http.routers.backend-https.tls=true
    - traefik.http.routers.backend-https.tls.certresolver=le
    - traefik.http.services.backend.loadbalancer.server.port=8000

    # Deep diagnostic health check — pauses routing if DB/Redis fails
    - traefik.http.services.backend.loadbalancer.healthCheck.path=/api/v1/health
    - traefik.http.services.backend.loadbalancer.healthCheck.interval=10s
    - traefik.http.services.backend.loadbalancer.healthCheck.timeout=5s
```

#### Why Deep Healthcheck Routing is an Architectural Superpower:
* Traefik does not simply check if the container process is running. Every 10 seconds, it issues an HTTP probe to `/api/v1/health`.
* That endpoint executes active diagnostic checks:
  1. Executes `SELECT 1` on PostgreSQL 18.
  2. Sends a `PING` to Redis 8.
  3. Validates host storage capacity.
* **Circuit Breaker Behavior:** If PostgreSQL crashes or locks up, `/api/v1/health` returns `HTTP 503 Service Unavailable`. Traefik immediately flags the container as unhealthy and **stops routing external traffic to it**, preventing broken transactions and data corruption.

---

## 6. Master Configuration & Command Cheat Sheet

### CLI Verification Commands
| Action | Command | Expected Output / Purpose |
| :--- | :--- | :--- |
| **Verify Root DNS** | `dig +short skilio.works` | `16.192.59.166` (Returns AWS Elastic IP). |
| **Verify Wildcard DNS** | `dig +short grafana.skilio.works` | `16.192.59.166` (Proves wildcard routing). |
| **Inspect HTTP 308 Redirect**| `curl -sI http://skilio.works` | `HTTP/1.1 308 Permanent Redirect` $\rightarrow$ `Location: https://skilio.works/`. |
| **Inspect TLS 1.3 Certificate**| `curl -vI https://skilio.works 2>&1 \| grep -i "SSL connection"` | Confirms TLS 1.3 handshake with Let's Encrypt certificate. |
| **Check Traefik Logs** | `docker compose logs -f proxy` | Shows real-time dynamic routing and ACME challenge activity. |

---

### The 30-Second Defense Elevator Pitch
Our ingress layer is powered by Traefik 3.6 acting as our edge reverse proxy. It listens on ports 80 and 443, dynamically discovering backend services via the read-only Docker socket. Cleartext HTTP requests are unconditionally redirected to HTTPS via HTTP 308, guaranteeing method and body preservation in compliance with 42 mandatory requirements. TLS 1.3 certificates are generated and auto-renewed natively via Let's Encrypt using TLS-ALPN-01 challenges and persisted on a named volume. Finally, Traefik routes traffic between `skilio.works` and `grafana.skilio.works` based on HTTP Host headers and actively protects user experience by pausing routing if our `/api/v1/health` diagnostics detect an internal database failure.
