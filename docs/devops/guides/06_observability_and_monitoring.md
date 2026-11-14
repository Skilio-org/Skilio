# 📊 Stage 6: Observability Suite (Prometheus & Grafana)
### Comprehensive Technical Architecture & Operations Guide

---

## 1. Core Concepts & Observability Philosophy (In Simple English)

### What is Observability vs. Monitoring?
* **Monitoring:** Tells you **WHEN** something is broken (e.g. *"FastAPI is returning 500 errors"*). It checks known symptoms.
* **Observability:** Tells you **WHY** something is broken by looking at the system's external outputs (metrics) without needing to attach a debugger to production.

### The Three Pillars of Telemetry:
1. **Metrics (Numbers):** Timestamped numeric values aggregated over time (e.g. CPU %, requests/sec). Cheap to store, fast to query, and drives automated alerts. **(What this module implements)**.
2. **Logs (Text):** Discrete text records of specific events (e.g. *"User 4 logged in"*). Expensive to store.
3. **Traces (Journeys):** End-to-end timing of a single request across multiple services (Frontend $\rightarrow$ Traefik $\rightarrow$ FastAPI $\rightarrow$ PostgreSQL).

### Why Prometheus Uses the "Pull Model" Instead of "Push":
* **Push Model:** Applications spam metrics to a central monitoring server. If an app gets a traffic spike, it can overload and crash the monitoring database.
* **Pull Model (Prometheus):** Prometheus reaches out and scrapes `/metrics` on a controlled timer (every 15s).
  * **Overload Protection:** Prometheus controls the rate.
  * **Instant Death Detection:** If a container crashes, the HTTP scrape fails immediately, and Prometheus sets `up = 0`.

### Understanding Percentiles (p50, p90, p99) vs. Average:
* **The Average Trap:** If 99 users experience a fast response of **10ms**, but 1 user freezes for **10,000ms (10s)**:
  $$\text{Average Latency} = \frac{(99 \times 10) + 10,000}{100} = 110\text{ ms}$$
  The average looks healthy (~110ms), completely hiding the fact that 1 user experienced a broken app!
* **Percentiles:** Line up 100 requests from fastest to slowest:
  * **`p50` (Median):** The experience of the 50th user (typical user).
  * **`p90`:** Faster than 90% of requests.
  * **`p99` (Tail Latency):** The slowest 1% of requests. Captures database lock contention and lag.

---

## 2. Component Inventory & Network Topology

Our entire observability stack is containerized inside Docker Compose across 3 architectural tiers:

```text
====================================================================================================
                                      DOCKER COMPOSE NETWORK
====================================================================================================

      [ Client / Web Browser ]
                     │
         Port :3000 / HTTPS (grafana.skilio.works)
                     ▼
      ┌─────────────────────────────┐
      │     Grafana UI (:3000)      │ ──▶ Dashboards as Code in "Skilio" folder
      └──────────────┬──────────────┘
                     │ PromQL Queries (access: proxy over Docker internal network)
                     ▼
      ┌─────────────────────────────┐
      │   Prometheus TSDB (:9090)   │ ──▶ Scrapes every 15s, stores in compressed TSDB,
      └──────────────┬──────────────┘     and evaluates alert_rules.yml every 15s
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
====================================================================================================
```

### Component Details:

| Service | Container Image | Port | Role in Stack |
| :--- | :--- | :--- | :--- |
| **Prometheus** | `prom/prometheus:v2.54.1` | `9090` | Scrapes targets, stores time-series data, and evaluates alert rules. |
| **Grafana** | `grafana/grafana:11.2.0` | `3000` | Visual dashboard interface displaying real-time graphs and charts. |
| **FastAPI Backend** | `backend:latest` | `8000` | Application layer instrumented with `prometheus-fastapi-instrumentator`. |
| **PostgreSQL Exporter** | `prometheuscommunity/postgres-exporter:v0.16.0` | `9187` | Translates internal PostgreSQL SQL stats into Prometheus text metrics. |
| **Google cAdvisor** | `gcr.io/cadvisor/cadvisor:v0.51.0` | `8080` | Reads raw CPU, RAM, and network metrics from Linux kernel cgroups. |

---

## 3. Implementation: Multi-Tier Exporters

### Tier 1: Application Layer (FastAPI Telemetry)
* **Library:** `prometheus-fastapi-instrumentator` added to [`backend/pyproject.toml`](../../backend/pyproject.toml).
* **Code Integration:** In [`backend/app/main.py`](../../backend/app/main.py#L90):
  ```python
  from prometheus_fastapi_instrumentator import Instrumentator

  # Instruments all FastAPI routes and exposes /metrics
  Instrumentator().instrument(app).expose(app, include_in_schema=True, tags=["monitoring"])
  ```
* **How it works:** Injects ASGI middleware that times every HTTP request, records the response status (2xx, 4xx, 5xx), method, and route template, exposing them on `http://backend:8000/metrics`.

### Tier 2: Database Layer (`postgres-exporter`)
* Configured in [`compose.yml`](../../compose.yml#L114-L123):
  ```yaml
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:v0.16.0
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATA_SOURCE_NAME: "postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/app?sslmode=disable"
  ```
* **How it works:** Opens an internal SQL connection to PostgreSQL, queries `pg_stat_database` and `pg_stat_activity`, and exposes metrics on `http://postgres-exporter:9187/metrics`.

### Tier 3: Infrastructure Layer (Google cAdvisor)
* Configured in [`compose.yml`](../../compose.yml#L124-L131):
  ```yaml
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.51.0
    restart: unless-stopped
    volumes:
      - /:/rootfs:ro
      - /sys:/sys:ro
      - "${DOCKER_SOCKET:-/var/run/docker.sock}:/var/run/docker.sock:ro"
  ```
* **How it works:** Mounts Linux control groups (`/sys/fs/cgroup`) to read raw CPU and RAM bytes per container, and mounts `docker.sock` to map container hashes to human-readable names (`skilio-backend-1`).

---

## 4. Implementation: Prometheus Configuration Engine

Configured in [`devops/monitoring/prometheus/prometheus.yml`](../../devops/monitoring/prometheus/prometheus.yml):

```yaml
global:
  scrape_interval: 15s      # Scrape targets every 15s
  evaluation_interval: 15s  # Evaluate alert rules every 15s

rule_files:
  - "alert_rules.yml"       # Load alerting rules

scrape_configs:
  # Internal telemetry
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  # Tier 1: Application (FastAPI)
  - job_name: "fastapi-backend"
    metrics_path: "/metrics"
    scrape_interval: 10s    # Higher resolution for live traffic
    static_configs:
      - targets: ["backend:8000"]
        labels:
          app: "skilio-backend"
          environment: "development"

  # Tier 2: Database (PostgreSQL)
  - job_name: "postgres"
    scrape_interval: 15s
    static_configs:
      - targets: ["postgres-exporter:9187"]
        labels:
          app: "skilio-postgres"
          environment: "development"

  # Tier 3: Infrastructure (cAdvisor)
  - job_name: "cadvisor"
    scrape_interval: 15s
    static_configs:
      - targets: ["cadvisor:8080"]
        labels:
          app: "skilio-containers"
          environment: "development"
```

* **Docker Internal DNS:** Targets use service names (`backend:8000`, `postgres-exporter:9187`, `cadvisor:8080`) rather than fragile hardcoded IP addresses.
* **10s Scrape Resolution:** FastAPI is scraped every 10s so live web traffic spikes appear on Grafana almost immediately.

---

## 5. Implementation: Custom Grafana Dashboards as Code

Instead of manually building dashboards through the browser, all datasources and dashboards are **provisioned declaratively as code**:

```text
devops/monitoring/grafana/
└── provisioning/
    ├── datasources/
    │   └── datasource.yml          <-- Connects to Prometheus (access: proxy, editable: false)
    └── dashboards/
        ├── dashboards.yml          <-- Defines provider and groups into "Skilio" folder
        └── definitions/            <-- Version-controlled JSON dashboard blueprints
            ├── fastapi-dashboard.json
            ├── postgres-dashboard.json
            └── containers-dashboard.json
```

### Dashboard 1: FastAPI Application Telemetry (`skilio-fastapi`)
* **Total HTTP Requests:** Cumulative count of processed API requests (`sum(http_requests_total)`).
* **Request Throughput:** Real-time requests per second (`sum(rate(http_requests_total[1m]))`).
* **5xx Error Rate:** Percentage of failed requests (`5xx / Total`). Target: 0%.
* **95th Percentile Latency (p95):** Worst-case response time for 95% of users (`histogram_quantile(0.95, ...)`).
* **Status Code Breakdown:** Visual stacked chart showing 2xx (Success), 4xx (Client errors), and 5xx (Server errors).
* **Latency Percentile Curves:** Line chart comparing `p50`, `p90`, and `p99` response times.
* **Top 10 Active API Endpoints:** Horizontal bar gauge ranking routes by traffic volume using `topk(10, ...)`.

### Dashboard 2: PostgreSQL Database Health (`skilio-postgres`)
* **Application DB Size:** Physical disk space utilized by PostgreSQL on disk (`pg_database_size_bytes`).
* **Active Connections:** Number of connections actively executing queries (`pg_stat_activity_count`).
* **Transaction Commit Rate:** Live query execution rate in queries per second (`rate(pg_stat_database_xact_commit[1m])`).
* **Database Query Throughput:** Historical timeline of database query speed.
* **Row Activity (Reads vs. Writes):** Clear breakdown of CRUD operations comparing **Rows Read / sec** (`tup_returned`) against **Rows Written / sec** (`tup_inserted + tup_updated`).

### Dashboard 3: Docker Containers & Hardware Infrastructure (`skilio-containers`)
* **Total Stack RAM Usage:** Aggregate memory consumption of all Docker containers combined.
* **Total Stack CPU Usage:** Aggregate CPU utilization percentage across all containers.
* **Running Containers Count:** Number of active containers running on the host (9 official containers).
* **RAM Usage by Container (Ranked):** Horizontal bar gauge ranking containers from most memory-hungry to least.
* **CPU % per Container:** Real-time CPU utilization timeline per service.
* **Container Memory History:** Historical RAM trends over time to detect slow memory leaks.

---

## 6. Implementation: Prometheus Alerting Rules Engine

Alert rules are defined declaratively in [`devops/monitoring/prometheus/alert_rules.yml`](../../devops/monitoring/prometheus/alert_rules.yml):

```yaml
groups:
  - name: skilio_alerts
    rules:
      # 1. Application Availability (Critical)
      - alert: BackendDown
        expr: up{job="fastapi-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "FastAPI Backend is down"
          description: "The FastAPI backend container has been unreachable for more than 1 minute."

      # 2. Database Availability (Critical)
      - alert: PostgresDown
        expr: pg_up == 0 or up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL Database is unreachable"
          description: "PostgreSQL is unreachable or postgres-exporter cannot connect for more than 1 minute."

      # 3. HTTP Server Errors (Warning)
      - alert: HttpServerErrors
        expr: rate(http_requests_total{job="fastapi-backend", status=~"5.."}[1m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "FastAPI returning 5xx server errors"
          description: "FastAPI has returned HTTP 5xx errors over the last 1 minute."

      # 4. Infrastructure Memory Threshold (Warning)
      - alert: ContainerHighMemory
        expr: container_memory_usage_bytes{name=~".*(skilio|freelancer).*"} > 700 * 1024 * 1024
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Container memory exceeded 700MB"
          description: "A container has exceeded 700MB of RAM usage for more than 2 minutes."
```

### The Alert Lifecycle State Machine:
$$\text{INACTIVE (Green)} \xrightarrow{\text{Condition evaluates TRUE}} \text{PENDING (Yellow)} \xrightarrow{\text{Timer expires (for: 1m)}} \text{FIRING (Red)}$$

* **Why the `for:` Duration is Critical (Anti-Flapping):**  
  Transient 2-second network hiccups or garbage collection pauses will not trigger false alarms. An alert fires only when the problem is sustained for the full duration.

---

## 7. Security Hardening & Production Cloud Alignment

Our monitoring setup adheres to the **Principle of Least Privilege** and satisfies standard production security requirements:

1. **Mandatory Grafana Authentication:**  
   `GF_AUTH_ANONYMOUS_ENABLED=false` in [`compose.yml`](../../compose.yml#L141). Unauthenticated visitors are forced to the login screen.
2. **Disabled Self-Registration:**  
   `GF_USERS_ALLOW_SIGN_UP=false` disables the public signup button.
3. **Read-Only Volume Mounts (`:ro`):**  
   Both Prometheus configs and Grafana provisioning files are mounted with `:ro`. They cannot be modified from the UI.
4. **Network Port Lockdown in Production:**  
   In [`compose.deploy.yml`](../../compose.deploy.yml), raw ports **`9090` (Prometheus), `9187` (Postgres Exporter), and `8080` (cAdvisor) are NOT exposed to the public internet**. They communicate strictly across the private internal Docker bridge network.
5. **HTTPS Production Ingress:**  
   Grafana is served at **`https://grafana.skilio.works`** with automated Let's Encrypt TLS 1.3 certificates and dynamic routing managed by Traefik 3.6.

---

## 8. Operational Verification & Live Chaos Testing Procedure

Follow this step-by-step verification procedure to inspect stack health, review telemetry, and simulate incidents:

### Step 1: Verify Stack Health in Terminal
```bash
docker compose ps
```
Confirm that `prometheus`, `grafana`, `postgres-exporter`, and `cadvisor` are all running healthy.

### Step 2: Verify Prometheus Scraping Targets
1. Open **`http://localhost:9090/targets`** (or via SSH tunnel on AWS).
2. Confirm that all 4 scrape targets (`prometheus`, `fastapi-backend`, `postgres`, `cadvisor`) are in the **UP (1/1)** state with 0 errors.

### Step 3: Verify Grafana Security & Provisioned Dashboards
1. Open an Incognito browser window to **`http://localhost:3000`** (or `https://grafana.skilio.works`).
2. Verify that anonymous access is blocked (forces login) and registration is disabled.
3. Log in with admin credentials.
4. Open the **"Skilio"** folder and inspect the 3 provisioned dashboards:
   * **FastAPI Dashboard:** Review request throughput, status code distribution, and p95 latency curves.
   * **PostgreSQL Dashboard:** Review database size, active connections, and the **Rows Read vs. Rows Written** panel.
   * **Containers Dashboard:** Review total stack RAM/CPU and the ranked memory bar gauge.

### Step 4: Live Chaos Simulation (Alert Triggering & Self-Healing)
1. Open Prometheus Alerts: **`http://localhost:9090/alerts`**. Verify all 4 rules are green (**Inactive**).
2. In your terminal, simulate a backend outage:
   ```bash
   docker compose stop backend
   ```
3. Refresh `http://localhost:9090/alerts`:
   * Within **15 seconds**: `BackendDown` evaluates to true and turns yellow (**Pending**). The `for: 1m` anti-flapping timer prevents instant alerting during transient restarts.
   * After **1 minute**: The timer expires and the alert turns red (**Firing**).
4. Restore the service:
   ```bash
   docker compose start backend
   ```
5. Refresh: Within 15 seconds, the scrape succeeds and the alert automatically self-heals back to green (**Inactive**).

