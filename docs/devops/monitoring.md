# 📊 Production Observability Suite (Prometheus & Grafana)
### 42 Evaluation Module: **IV.7 DevOps (Major — 2 Points)**

---

## 1. 42 Subject Compliance & Justification

In Section **IV.7 DevOps**, the 42 curriculum defines this major module as:

> **"Major: Monitoring system with Prometheus and Grafana." (2 Points)**

We implement all 5 mandatory subject requirements across our 3-tier containerized stack:

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Set up Prometheus to collect metrics** | Standalone Prometheus TSDB scraping telemetry every 10s–15s using the reliable Pull Model, storing data efficiently with Gorilla chunk compression. | [`prometheus.yml`](../../devops/monitoring/prometheus/prometheus.yml) |
| **2. Configure exporters and integrations** | 3-tier multi-source telemetry: FastAPI ASGI instrumentator (app), `postgres-exporter` (database), and Google `cAdvisor` (hardware & cgroups). | [`main.py`](../../backend/app/main.py#L90) • [`compose.yml`](../../compose.yml#L114) |
| **3. Create custom Grafana dashboards** | 3 pre-provisioned Dashboards-as-Code in the "Skilio" folder: FastAPI application performance, PostgreSQL database health, and Docker container hardware stats. | [`dashboards/definitions/`](../../devops/monitoring/grafana/provisioning/dashboards/definitions/) |
| **4. Set up alerting rules** | 4 human-explainable Prometheus alert rules (`BackendDown`, `PostgresDown`, `HttpServerErrors`, `ContainerHighMemory`) with anti-flapping evaluation timers. | [`alert_rules.yml`](../../devops/monitoring/prometheus/alert_rules.yml) |
| **5. Secure access to Grafana** | Enforced credentials, anonymous access disabled (`GF_AUTH_ANONYMOUS_ENABLED=false`), self-registration disabled, read-only config mounts, and TLS 1.3 HTTPS ingress. | [`compose.yml`](../../compose.yml#L137) • [`compose.deploy.yml`](../../compose.deploy.yml#L55) |

---

## 2. Master Observability Architecture

Rather than basic server uptime pings, Skilio implements **3-Tier Multi-Source Observability** capturing application, database, and container kernel telemetry in real time:

```text
       [ Evaluator / Admin Browser ]
                     │
          Port :3000 / HTTPS (grafana.skilio.works)
                     ▼
      ┌─────────────────────────────┐
      │     Grafana UI (:3000)      │ ──▶ Provisioned Dashboards in "Skilio" Folder
      └──────────────┬──────────────┘
                     │ PromQL Queries (Docker Internal Network)
                     ▼
      ┌─────────────────────────────┐
      │   Prometheus TSDB (:9090)   │ ──▶ Scrapes every 15s • Evaluates alerts every 15s
      └──────────────┬──────────────┘
                     │
       ┌─────────────┼─────────────────────────┐
       │ Scrape 10s  │ Scrape 15s              │ Scrape 15s
       ▼             ▼                         ▼
┌──────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│   Tier 1:    │ │       Tier 2:        │ │       Tier 3:        │
│   FastAPI    │ │  postgres-exporter   │ │   Google cAdvisor    │
│   Backend    │ │       (:9187)        │ │       (:8080)        │
│   (:8000)    │ └──────────┬───────────┘ └──────────┬───────────┘
└──────────────┘            │ SQL queries            │ Reads /sys/fs/cgroup
                     ┌──────┴───────────┐ ┌──────────┴───────────┐
                     │  PostgreSQL 18   │ │  Linux Host Kernel   │
                     │    Database      │ │   Container Stats    │
                     └──────────────────┘ └──────────────────────┘
```

---

## 3. Pillar 1: 3-Tier Multi-Source Exporters & Metric Collection

### Key Architecture Features
* **Tier 1 (Application - FastAPI):** `prometheus-fastapi-instrumentator` intercepts all ASGI traffic to record request throughput, error codes (2xx, 4xx, 5xx), and route execution duration at `http://backend:8000/metrics`.
* **Tier 2 (Database - PostgreSQL):** `postgres-exporter:v0.16.0` connects to Postgres via SQL, collecting connection pool saturation, cache efficiency, and row throughput at `http://postgres-exporter:9187/metrics`.
* **Tier 3 (Host & Infrastructure - cAdvisor):** Google `cAdvisor:v0.51.0` mounts Linux kernel control groups (`/sys/fs/cgroup`) to track raw CPU%, memory bytes, and network I/O per container.
* **Controlled Pull Architecture:** Prometheus controls the scrape pace (10s for API, 15s for DB/Host), preventing application crashes from spamming or knocking down the monitoring system.

---

## 4. Pillar 2: Custom Grafana Dashboards as Code

All dashboards are version-controlled in Git and automatically provisioned into the **"Skilio"** folder on startup (`editable: false`):

| Dashboard Name | Key Metrics Visualized | Production Purpose |
| :--- | :--- | :--- |
| **FastAPI Backend** (`skilio-fastapi`) | Request throughput, 5xx error rate, status code distribution (2xx/4xx/5xx), p50/p90/p99 latency curves, top 10 endpoints. | Detect API bottlenecks, slow endpoints, and application regressions. |
| **PostgreSQL DB** (`skilio-postgres`) | Database size on disk, active SQL connections, transaction commit rate, query throughput, row activity (reads vs. writes). | Prevent database connection pool exhaustion and monitor write loads. |
| **Containers & Host** (`skilio-containers`) | Total stack RAM & CPU, active container count, ranked memory usage per container, CPU timeline, historical memory trends. | Detect memory leaks and verify AWS 2GB swap compliance without OOM crashes. |

---

## 5. Pillar 3: Alerting Engine & Security Hardening

### Real-Time Alert State Machine
Alerts transition from `INACTIVE (Green)` $\rightarrow$ `PENDING (Yellow)` $\rightarrow$ `FIRING (Red)` across 4 targeted rules:

1. **`BackendDown` (Critical):** `up{job="fastapi-backend"} == 0` for 1m $\rightarrow$ Triggers when FastAPI is unreachable.
2. **`PostgresDown` (Critical):** `pg_up == 0 or up{job="postgres"} == 0` for 1m $\rightarrow$ Triggers when the database is stopped or refusing connections.
3. **`HttpServerErrors` (Warning):** `rate(5xx[1m]) > 0` for 1m $\rightarrow$ Triggers when API returns server errors.
4. **`ContainerHighMemory` (Warning):** `container_memory_usage_bytes > 700MB` for 2m $\rightarrow$ Triggers before memory pressure causes kernel OOM kills.
* **Anti-Flapping Protection (`for: 1m`):** Temporary 2-second spikes or container reboots do not cause false alarms.

### Security Hardening Matrix
* **Mandatory Authentication:** `GF_AUTH_ANONYMOUS_ENABLED=false` blocks unauthorized visitors.
* **Zero Public Signup:** `GF_USERS_ALLOW_SIGN_UP=false` disables registration.
* **Network Isolation:** Ports 9090 (Prometheus), 9187 (Postgres Exporter), and 8080 (cAdvisor) are locked inside the private Docker network and never exposed to the public internet on AWS.
* **HTTPS Edge Ingress:** Traefik terminates TLS 1.3 at `https://grafana.skilio.works`.

---

## 6. Quick Defense Script & Chaos Testing Drill

Demonstrate this module to the evaluator in 4 simple steps:

| Step | Action | What to Explain to Evaluator |
| :---: | :--- | :--- |
| **1** | Open `http://localhost:9090/targets` | Show all 4 targets are in **UP (1/1)** state with 0 scrape errors. |
| **2** | Open `http://localhost:3000` (or `https://grafana.skilio.works`) | Demonstrate authentication barrier; log in and tour the 3 provisioned dashboards in the **"Skilio"** folder. |
| **3** | Open `http://localhost:9090/alerts` | Show all 4 alert rules are loaded, active, and currently **INACTIVE (Green)**. |
| **4** | Run `docker compose stop backend` | Watch `BackendDown` turn **PENDING (Yellow)** within 15s, then **FIRING (Red)** after 1m. Run `docker compose start backend` to watch it automatically self-heal back to **INACTIVE (Green)**. |

---

> 📖 **Deep Dive Technical Guide & SRE Defense Playbook:**  
> For detailed SRE theory (Pull vs. Push, p50/p90/p99 math, Gorilla TSDB compression), PromQL queries, and the Top 5 evaluator Q&As, read:  
> 👉 **[guides/06_observability_and_monitoring.md](guides/06_observability_and_monitoring.md)**
