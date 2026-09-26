# Production Observability Suite: Prometheus, Grafana, Exporters & Alerting
## 42 ft_transcendence — DevOps Major Module (2 Points)

---

## Table of Contents
1. [Core Concepts & Observability Philosophy](#0-core-concepts--observability-philosophy)
2. [System Architecture & Network Topology](#1-system-architecture--network-topology)
3. [Criterion 1: Prometheus Metrics Collection Engine](#2-criterion-1-prometheus-metrics-collection-engine)
4. [Criterion 2: Exporters & Multi-Tier Telemetry Integrations](#3-criterion-2-exporters--multi-tier-telemetry-integrations)
5. [Criterion 3: Custom Grafana Dashboards as Code](#4-criterion-3-custom-grafana-dashboards-as-code)
6. [Criterion 4: Securing Access to Grafana](#5-criterion-4-securing-access-to-grafana)
7. [Criterion 5: Prometheus Alerting Rules Engine](#6-criterion-5-prometheus-alerting-rules-engine)
8. [Peer Evaluation Defense & Live Chaos Testing Guide](#7-peer-evaluation-defense--live-chaos-testing-guide)

---

## 0. Core Concepts & Observability Philosophy

### What is Observability?
In software engineering, **monitoring** tells you *when* something is wrong; **observability** is the degree to which you can infer the internal execution state of a system based solely on its external telemetry outputs.

Observability rests on the **Three Pillars of Telemetry**:
1. **Metrics**: Aggregatable numeric measurements evaluated over fixed time intervals (Counters, Gauges, Histograms). Metrics are cheap to store, fast to query, and form the basis of **automated alerting**.
2. **Logs**: Timestamped discrete event strings (e.g., error tracebacks, user logins). High cardinality, high storage cost.
3. **Traces**: End-to-end request lifecycle paths traversing distributed network hops (e.g., Frontend ➔ Traefik ➔ FastAPI ➔ PostgreSQL).

For our **DevOps Major Module**, we implement **System & Application Metrics Instrumentation**, capturing real-time time-series data across every layer of the platform stack.

---

### The Pull Model vs. The Push Model

Most traditional monitoring systems (such as Graphite or CloudWatch) employ a **Push Model**, where services actively dispatch metrics over UDP/HTTP to a central ingestion daemon.

Prometheus deliberately chose a **Pull Model** (scraping):
```text
+-----------------------+              HTTP GET /metrics             +------------------------+
|                       |  ----------------------------------------> | Target: FastAPI        |
|  Prometheus Server    |  <---------------------------------------- | (Response: Raw Text)   |
|  (Scrape Engine)      |                                            +------------------------+
|                       |              HTTP GET :9187/metrics        +------------------------+
|  Controls Frequency,  |  ----------------------------------------> | Target: Postgres-Exp   |
|  Pacing, & Timeouts   |  <---------------------------------------- | (Response: Raw Text)   |
+-----------------------+                                            +------------------------+
```

#### Why the Pull Model is Superior for Production:
1. **Centralized Rate Limiting & Overload Protection**: The monitoring system decides when and how often to scrape (e.g., every 15s). A malfunctioning service in a traffic spike cannot DDoS the monitoring database by spamming metrics.
2. **Built-in Liveness & Health Detection (`up` metric)**: In a push architecture, if a service crashes or hangs, it simply stops sending packets; the server cannot immediately distinguish between a crashed service, network partition, or low traffic. In a pull architecture, if an HTTP scrape fails or times out, Prometheus immediately records `up == 0`, triggering an availability alert.
3. **Decoupled Architecture**: Monitored applications simply expose an unauthenticated read-only HTTP endpoint (`/metrics`) formatted in OpenMetrics/Prometheus text exposition standard. They do not know or care where Prometheus is hosted.

---

### What is a Time-Series Database (TSDB)?

A time-series is a stream of timestamped numeric values belonging to the same metric and set of labeled dimensions:

```text
  identifier = <metric_name>{<label_name>=<label_value>, ...}
  series     = identifier + [(t0, v0), (t1, v1), (t2, v2), ...]
```

Example in our stack:
```text
http_requests_total{app="freelancer-backend", handler="/api/v1/auth/login", method="POST", status="200"}
```
Prometheus stores these samples using **Gorilla Chunk Compression**, encoding float64 timestamps and values down to an average of **1.37 bytes per sample**, allowing millions of data points to reside in minimal RAM.

---

## 1. System Architecture & Network Topology

Our entire monitoring stack is containerized and integrated into the platform's rootless Docker network defined in [compose.yml](file:///home/aysadeq/Desktop/Freelancer/compose.yml) and [compose.override.yml](file:///home/aysadeq/Desktop/Freelancer/compose.override.yml).

```text
====================================================================================================
                                      DOCKER COMPOSE NETWORK
====================================================================================================

      +-----------------------------+
      |      Client Web Browser     |
      +-----------------------------+
             |                 |
     Port :3000           Port :9090
             v                 v
      +--------------+  +-------------------------------------------------------------------------+
      |   Grafana    |  |                           Prometheus TSDB                               |
      |   (v11.2.0)  |  |                              (v2.54.1)                                  |
      +--------------+  +-------------------------------------------------------------------------+
             |                                 |                   |                    |
             | PromQL                          | Scrape            | Scrape             | Scrape
             | Queries                         | 10s               | 15s                | 15s
             v                                 v                   v                    v
      +--------------+                 +---------------+   +------------------+   +---------------+
      |  Prometheus  |                 |    FastAPI    |   | postgres-exporter|   |    cAdvisor   |
      | HTTP Proxy   |                 |    Backend    |   |     (v0.16.0)    |   |   (v0.49.1)   |
      +--------------+                 +---------------+   +------------------+   +---------------+
                                               |                   |                    |
                                            Internal            Port 5432            Host OS
                                            ASGI App           (PostgreSQL)         /sys /rootfs
                                                                                    docker.sock
====================================================================================================
```

### Component Inventory & Network Matrix

| Service | Container Image | Internal Port | Host Port | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Prometheus** | `prom/prometheus:v2.54.1` | `9090` | `9090` | TSDB storage, metric scraping, rule evaluation |
| **Grafana** | `grafana/grafana:11.2.0` | `3000` | `3000` | Visualization UI, auto-provisioned dashboards |
| **FastAPI Backend** | `backend:latest` | `8000` | `8000` | Application layer instrumented with metrics middleware |
| **PostgreSQL Exporter** | `prometheuscommunity/postgres-exporter:v0.16.0` | `9187` | Internal | Translates PostgreSQL internal stats to Prometheus format |
| **Google cAdvisor** | `gcr.io/cadvisor/cadvisor:v0.49.1` | `8080` | Internal | Hardware & Docker cgroups resource collector |

---

## 2. Criterion 1: Prometheus Metrics Collection Engine

The configuration of the Prometheus engine is maintained declaratively in [prometheus.yml](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/prometheus/prometheus.yml).

### Scrape Engine Configuration

```yaml
global:
  scrape_interval: 15s     # How frequently Prometheus scrapes targets
  evaluation_interval: 15s # How frequently Prometheus evaluates alert rules

rule_files:
  - "alert_rules.yml"      # Load declarative alert assertions

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "fastapi-backend"
    metrics_path: "/metrics"
    scrape_interval: 10s   # Higher resolution for application traffic
    static_configs:
      - targets: ["backend:8000"]
        labels:
          app: "freelancer-backend"
          environment: "development"

  - job_name: "postgres"
    scrape_interval: 15s
    static_configs:
      - targets: ["postgres-exporter:9187"]
        labels:
          app: "freelancer-postgres"
          environment: "development"

  - job_name: "cadvisor"
    scrape_interval: 15s
    static_configs:
      - targets: ["cadvisor:8080"]
        labels:
          app: "freelancer-containers"
          environment: "development"
```

### Core PromQL Concepts Used Across the Stack

1. **Instant Vector**: A set of time series containing a single sample for each time series, all sharing the same timestamp (e.g. `up{job="fastapi-backend"}`).
2. **Range Vector**: A set of time series containing a buffer of data points over time (e.g. `http_requests_total[5m]`). Range vectors cannot be graphed directly; they must be transformed into an instant vector via functions.
3. **`rate()` vs `increase()`**:
   * `rate(v[1m])`: Calculates the per-second average rate of increase of a monotonic counter over 1 minute. Handles counter resets (process restarts) gracefully.
   * `increase(v[1h])`: Calculates the absolute integer increase of a counter over 1 hour.
4. **`histogram_quantile(φ, b)`**: Calculates the $\phi$-quantile ($0 \le \phi \le 1$) from the buckets of a histogram metric, used to compute latency percentiles (p50, p90, p95, p99).

---

## 3. Criterion 2: Exporters & Multi-Tier Telemetry Integrations

Telemetry is gathered across three distinct architectural tiers:

```text
+---------------------------------------------------------------------------------------+
| TIER 2: APPLICATION TELEMETRY                                                         |
| FastAPI Backend + prometheus-fastapi-instrumentator                                   |
| Metrics: http_requests_total, http_request_duration_seconds_bucket, response sizes    |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
| TIER 3: DATABASE TELEMETRY                                                            |
| PostgreSQL Database + postgres-exporter:v0.16.0                                       |
| Metrics: pg_stat_database_*, pg_stat_activity_count, buffer cache hit ratios          |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
| TIER 4: HARDWARE & CONTAINER TELEMETRY                                                |
| Docker Engine Cgroups + Google cAdvisor:v0.49.1                                        |
| Metrics: container_memory_usage_bytes, container_cpu_usage_seconds_total, network IO  |
+---------------------------------------------------------------------------------------+
```

---

### Tier 2: Application Layer (FastAPI Telemetry)

* **Package**: `prometheus-fastapi-instrumentator>=8.1.0` added to [backend/pyproject.toml](file:///home/aysadeq/Desktop/Freelancer/backend/pyproject.toml).
* **Implementation** in [backend/app/main.py](file:///home/aysadeq/Desktop/Freelancer/backend/app/main.py):
  ```python
  from prometheus_fastapi_instrumentator import Instrumentator

  # Initialize and instrument FastAPI application
  instrumentator = Instrumentator(
      should_group_status_codes=False,
      should_ignore_untemplated=True,
      should_respect_env_var=False,
      excluded_handlers=["/metrics", "/docs", "/openapi.json"],
      env_var_name="ENABLE_METRICS",
  )
  instrumentator.instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
  ```
* **How it works under the hood**:
  The instrumentator injects an ASGI middleware. On every incoming HTTP request:
  1. Starts a high-resolution monotonic timer (`time.perf_counter()`).
  2. Forwards the request down the FastAPI dependency chain and router.
  3. Captures response status code, route template (`/api/v1/jobs/{id}` rather than raw UUIDs to prevent metric cardinality explosion), and method.
  4. Records the observation into an in-memory Prometheus Histogram and increments request counters.

---

### Tier 3: Database Layer (PostgreSQL Telemetry)

* **Container Image**: `prometheuscommunity/postgres-exporter:v0.16.0` configured in [compose.yml](file:///home/aysadeq/Desktop/Freelancer/compose.yml).
* **Configuration**:
  ```yaml
    postgres-exporter:
      image: prometheuscommunity/postgres-exporter:v0.16.0
      restart: unless-stopped
      environment:
        DATA_SOURCE_NAME: "postgresql://postgres:${POSTGRES_PASSWORD:?Variable not set}@db:5432/app?sslmode=disable"
      depends_on:
        db:
          condition: service_healthy
          restart: true
  ```
* **How it works under the hood**:
  The exporter opens a persistent SQL connection to the PostgreSQL `app` database and executes scheduled internal catalog queries against `pg_stat_database`, `pg_stat_activity`, and `pg_stat_bgwriter`. It exposes metrics on internal HTTP port `9187`.

---

### Tier 4: Hardware & Infrastructure Layer (Google cAdvisor)

* **Container Image**: `gcr.io/cadvisor/cadvisor:v0.49.1` configured in [compose.yml](file:///home/aysadeq/Desktop/Freelancer/compose.yml).
* **Mount Configuration**:
  ```yaml
    cadvisor:
      image: gcr.io/cadvisor/cadvisor:v0.49.1
      restart: unless-stopped
      volumes:
        - /:/rootfs:ro
        - /sys:/sys:ro
        - "${DOCKER_SOCKET:-/var/run/docker.sock}:/var/run/docker.sock:ro"
  ```
* **How it works under the hood**:
  cAdvisor directly inspects the Linux kernel's **control groups (cgroups)** hierarchy via `/sys/fs/cgroup`. It reads raw hardware accounting statistics:
  * `cpu.cfs_quota_us` and `cpuacct.usage` ➔ Converted to CPU core saturation percentages.
  * `memory.usage_in_bytes` and `memory.stat` ➔ Converted to active anonymous RAM vs kernel page cache.
  * Socket inspection via `/var/run/docker.sock` ➔ Maps internal cgroup container hashes back to human-readable container names (e.g. `freelancer-backend-1`).

---

## 4. Criterion 3: Custom Grafana Dashboards as Code

Rather than manually creating dashboards in the Grafana UI (which is error-prone and lost on container restart), all dashboards and datasources are **provisioned entirely as code**.

### Provisioning Architecture

1. **Datasource Provisioning** ([datasource.yml](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/grafana/provisioning/datasources/datasource.yml)):
   ```yaml
   apiVersion: 1
   datasources:
     - name: Prometheus
       type: prometheus
       access: proxy
       url: http://prometheus:9090
       isDefault: true
       editable: false
   ```
   *Note: `access: proxy` instructs the Grafana backend server to proxy PromQL queries across internal Docker DNS (`http://prometheus:9090`), so the client's browser does not need direct access.*

2. **Dashboard Provider** ([dashboards.yml](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/grafana/provisioning/dashboards/dashboards.yml)):
   Auto-loads all JSON definitions from `/etc/grafana/provisioning/dashboards/definitions` into a dedicated Grafana folder titled **"Freelancer"**.

---

### Dashboard 1: FastAPI Application Telemetry
*File: [fastapi-dashboard.json](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/grafana/provisioning/dashboards/definitions/fastapi-dashboard.json)*

| Panel Title | Visualization | PromQL Query | Engineering Purpose |
| :--- | :--- | :--- | :--- |
| **Total Requests** | Stat Panel | `sum(http_requests_total{job="fastapi-backend"})` | Cumulative traffic volume counter |
| **Current Throughput** | Stat Panel | `sum(rate(http_requests_total{job="fastapi-backend"}[1m]))` | Real-time traffic rate in req/s |
| **5xx Error Ratio** | Stat Panel | `(sum(rate(...status=~"5.."}[5m])) or vector(0)) / (sum(rate(...}[5m])) + 0.0001)` | Core Service Level Indicator (SLI) |
| **p95 Latency** | Stat Panel | `histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))` | 95th percentile worst-case latency |
| **Status Codes Distribution** | Timeseries Stacked | `sum by (status) (rate(http_requests_total{job="fastapi-backend"}[1m]))` | Visual traffic breakdown (2xx vs 4xx vs 5xx) |
| **Latency Curves (p50, p90, p99)** | Timeseries Lines | Quantile evaluations across `0.50`, `0.90`, and `0.99` | Demonstrates performance distribution |
| **Top 10 API Endpoints** | Table | `topk(10, sum by (handler, method) (increase(http_requests_total[1h])))` | Route traffic ranking |

#### Engineering Deep-Dive: Why Latency Percentiles (p50/p90/p99) over Averages
Arithmetic averages ($\mu = \frac{1}{N}\sum x_i$) are dangerous in web operations because fast requests mask agonizingly slow requests. 

*Example*: If 99 users experience a lightning-fast response of **10ms**, but 1 user suffers a database lock timeout of **10,000ms**:
$$\text{Average Latency} = \frac{99 \times 10 + 10000}{100} = 109.9\text{ms}$$
An average of **109ms** looks completely healthy on a dashboard, hiding the fact that 1 in 100 users had a broken experience. Percentiles sort requests from fastest to slowest:
* **p50 (Median)**: The experience of the average user.
* **p95**: The threshold that 95% of users experienced faster than.
* **p99 (Tail Latency)**: The worst 1% of requests, capturing lock contention and slow database queries.

---

### Dashboard 2: PostgreSQL Database Health
*File: [postgres-dashboard.json](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/grafana/provisioning/dashboards/definitions/postgres-dashboard.json)*

| Panel Title | Visualization | PromQL Query | Engineering Purpose |
| :--- | :--- | :--- | :--- |
| **Database Size** | Stat (Bytes) | `pg_stat_database_size_bytes{datname="app"}` | Physical disk utilization of app database |
| **Active Connections** | Stat / Gauge | `sum(pg_stat_activity_count{datname="app", state="active"})` | Current connection pool load |
| **Buffer Cache Hit Ratio** | Gauge (%) | `sum(pg_stat_database_blks_hit) / (sum(pg_stat_database_blks_hit) + sum(pg_stat_database_blks_read)) * 100` | Target > 99%. Measures if queries hit RAM vs Disk |
| **Commits vs Rollbacks** | Timeseries | `rate(pg_stat_database_xact_commit[1m])` vs `rate(...xact_rollback[1m])` | Transaction success health |
| **DB Size Growth** | Timeseries | `pg_stat_database_size_bytes{datname="app"}` | Disk storage capacity trend |

---

### Dashboard 3: Docker Containers & Hardware Infrastructure
*File: [containers-dashboard.json](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/grafana/provisioning/dashboards/definitions/containers-dashboard.json)*

| Panel Title | Visualization | PromQL Query | Engineering Purpose |
| :--- | :--- | :--- | :--- |
| **Total Stack RAM** | Stat (Bytes) | `sum(container_memory_usage_bytes{name=~"freelancer-.*"})` | Total memory footprint of all containers |
| **Total Stack CPU** | Gauge (%) | `sum(rate(container_cpu_usage_seconds_total{name=~"freelancer-.*"}[1m])) * 100` | Aggregate CPU core utilization |
| **Active Containers** | Stat | `count(count by (name) (container_last_seen{name=~"freelancer-.*"}))` | Total running service containers |
| **Inbound Network Bandwidth**| Stat (Bps) | `sum(rate(container_network_receive_bytes_total{name=~"freelancer-.*"}[1m]))` | Stack network ingress rate |
| **RAM per Container (Ranked)**| Bar Gauge (Horizontal)| `sum by (name) (container_memory_usage_bytes{name=~"freelancer-.*"})` | Identifies memory-hungry services |
| **CPU % per Container** | Timeseries | `sum by (name) (rate(container_cpu_usage_seconds_total[1m])) * 100` | CPU utilization history by service |
| **Network Traffic RX / TX** | Timeseries | `container_network_receive_bytes_total` & `transmit_bytes_total` | Per-container network throughput |

---

## 5. Criterion 4: Securing Access to Grafana

In accordance with subject security requirements, Grafana is hardened against unauthorized inspection and public modification.

### Hardening Measures Configured in [compose.yml](file:///home/aysadeq/Desktop/Freelancer/compose.yml)

```yaml
  grafana:
    image: grafana/grafana:11.2.0
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./devops/monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
```

1. **Mandatory Authentication (`GF_AUTH_ANONYMOUS_ENABLED=false`)**:
   Unauthenticated users attempting to access `http://localhost:3000` are immediately redirected to `/login`. No anonymous browsing or guest role viewing is permitted.
2. **Disabled Self-Registration (`GF_USERS_ALLOW_SIGN_UP=false`)**:
   The public registration form is completely removed from the login screen. Only administrators can provision accounts.
3. **Environment-Driven Secrets**:
   Admin credentials default to `.env` variables (`GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD`), preventing hardcoded credentials in public source repositories.
4. **Read-Only Provisioning Mount (`:ro`)**:
   The dashboard and datasource provisioning files are mounted with `:ro` (read-only flags). Even if a malicious actor gains access to the Grafana admin account, they cannot persist modifications that alter underlying configuration files.

---

## 6. Criterion 5: Prometheus Alerting Rules Engine

Alerting rules are declarative threshold assertions evaluated by Prometheus's internal rule evaluation engine. Configured in [alert_rules.yml](file:///home/aysadeq/Desktop/Freelancer/devops/monitoring/prometheus/alert_rules.yml).

### The Alert Lifecycle State Machine

```text
               +---------------------------------------------+
               |                  INACTIVE                   |
               |        Condition evaluates to FALSE         |
               +---------------------------------------------+
                                      |
                     Condition evaluates to TRUE (e.g. up==0)
                                      v
               +---------------------------------------------+
               |                  PENDING                    |
               |       Waiting for 'for:' timer (e.g. 1m)    |
               +---------------------------------------------+
                 /                                         \
      Healed within timer                           Timer expires (1m)
               v                                             v
+-----------------------------+               +-----------------------------+
|    Resolved / INACTIVE      |               |           FIRING            |
| (No false alarm dispatched) |               |  Active production incident |
+-----------------------------+               +-----------------------------+
```

#### Why the `for:` Duration is Critical (Anti-Flapping):
In distributed systems, momentary network blips, container initialization delays, or garbage collection pauses can cause a single scrape to fail. Without the `for:` clause, an engineer's phone would ring repeatedly for transient 2-second hiccups. The `for: 1m` clause ensures an alert fires **only when an issue represents a sustained failure**.

---

### Active Alerting Rules Inventory

| Rule Name | Severity | Condition (PromQL) | Duration (`for`) | What it Detects |
| :--- | :--- | :--- | :--- | :--- |
| **`BackendDown`** | 🔴 `critical` | `up{job="fastapi-backend"} == 0` | `1m` | FastAPI API container is dead / unreachable |
| **`PostgresDown`** | 🔴 `critical` | `up{job="postgres"} == 0` | `1m` | Database is dead; all logins and queries failing |
| **`CadvisorDown`** | 🟠 `warning` | `up{job="cadvisor"} == 0` | `1m` | Container hardware telemetry collection lost |
| **`HighHttp5xxRate`** | 🟠 `warning` | `(sum(rate(5xx[2m])) / sum(rate(all[2m]))) * 100 > 5` | `2m` | Application bugs; > 5% of API requests failing |
| **`HighHttpLatencyP95`**| 🟠 `warning` | `histogram_quantile(0.95, ...) > 1.0` | `3m` | API response time degraded; 95% of users > 1s |
| **`ContainerHighMemory`**| 🟠 `warning`| `container_memory_usage_bytes > 400MB` | `2m` | Memory leak; container nearing Linux OOM kill |

---

## 7. Peer Evaluation Defense & Live Chaos Testing Guide

Follow this step-by-step walkthrough during the 42 peer evaluation to demonstrate complete compliance with all requirements:

### Step 1: Prove Stack Architecture & Container Health
In the terminal, run:
```bash
docker compose ps
```
*Point out to evaluator*: Show that `prometheus`, `grafana`, `postgres-exporter`, `cadvisor`, and `backend` are all running healthy.

---

### Step 2: Prove Prometheus Scrape Targets
1. Open your browser to **`http://localhost:9090/targets`**.
2. *Show to evaluator*: Point out that all 4 scrape targets (`prometheus`, `fastapi-backend`, `postgres`, `cadvisor`) are in the **UP (1/1)** state with 0 errors.

---

### Step 3: Prove Grafana Security & Provisioned Dashboards
1. Open a new Incognito / Private browser window to **`http://localhost:3000`**.
2. *Show to evaluator*:
   * Notice that Grafana forces a login screen (Anonymous viewing is disabled).
   * Notice there is no "Sign Up" button (Registration disabled).
3. Log in with `admin` / `admin`.
4. Click **Dashboards** in the left sidebar and open the **"Freelancer"** folder.
5. Tour the 3 custom dashboards:
   * **FastAPI Application Telemetry**: Show request throughput, status code graphs, and explain why p95 latency is used.
   * **PostgreSQL Database Health**: Show active connections, DB size, and buffer cache hit ratio (> 99%).
   * **Docker Containers & Hardware**: Show live container RAM/CPU rankings and network throughput.

---

### Step 4: Live Traffic & Error Generation Demo
To prove that metrics update dynamically, run this command in your terminal to generate 20 requests including intentional 404 errors:
```bash
for i in {1..15}; do curl -s -o /dev/null http://localhost:8000/api/v1/utils/health-check/; done
for i in {1..5}; do curl -s -o /dev/null http://localhost:8000/api/v1/non-existent-endpoint; done
```
Return to the **FastAPI Application Telemetry** Grafana dashboard:
* Show that **Total Requests** increased.
* Show the **Status Code Distribution** panel rendering both green `200` responses and yellow `404` client errors.

---

### Step 5: The "Chaos Test" Alerting Demo (The Showstopper)
1. Open the Prometheus Alerts UI: **`http://localhost:9090/alerts`**.
2. *Show to evaluator*: All 6 rules are loaded and currently green (**Inactive**).
3. In your terminal, simulate a catastrophic backend failure:
   ```bash
   docker compose stop backend
   ```
4. Refresh `http://localhost:9090/alerts`:
   * Within **15 seconds**: The `BackendDown` rule turns yellow (**Pending - 1 active**).
   * Explain to the evaluator: *"The alert is pending because our `for: 1m` anti-flapping timer is protecting us from false alarms."*
   * After **1 minute**: The rule turns red (**Firing - 1 active**).
5. Restore the service:
   ```bash
   docker compose start backend
   ```
6. Within 15 seconds, refresh the page: The rule self-heals and returns to green (**Inactive**).
