# 🛡️ DevOps Engineering & Cloud Architecture Hub

## 1. 42 Evaluation Point Ledger (5 Points Total)

As DevOps Lead, Aysadeq claims **5 Points** of evaluation modules plus the **Section III Mandatory Requirements**:

| Module ID | Scope | Description | Points | Primary Documentation |
| :--- | :--- | :--- | :---: | :--- |
| **IV.10** | **Module of Choice (Major)** | **Production Cloud Deployment & Automated Zero-Touch CI/CD**<br>• AWS EC2 cloud infrastructure with static Elastic IP and firewall isolation.<br>• Traefik 3.6 reverse proxy with automated Let's Encrypt TLS 1.3 certificates.<br>• Automated 3-tier GitHub Actions CI testing gate and zero-downtime rolling container swap over SSH `rsync`. | **2 Pts** | 👉 **[deployment.md](deployment.md)** |
| **IV.7** | **DevOps (Minor)** | **Health Check, Public Status Page & Disaster Recovery**<br>• Diagnostic health endpoint (`/api/v1/health`) probing Postgres latency, Redis ping, and disk capacity.<br>• Public React status page (`/status`) with real-time badges.<br>• Automated daily database backup daemon with `.sql.gz` compression and 7-day retention.<br>• Instant point-in-time recovery and ephemeral sandbox drill achieving **RTO < 60s**. | **1 Pt** | 👉 **[backup.md](backup.md)** |
| **IV.7** | **DevOps (Major)** | **Observability Suite (Prometheus & Grafana)**<br>• Prometheus scraping backend application metrics and system stats.<br>• Pre-configured Grafana dashboards visualizing CPU, memory, HTTP request rates, and error latency.<br>• Pre-configured alerts for container restarts and resource spikes. | **2 Pts** | 👉 **[monitoring.md](monitoring.md)** |
| **Sec III** | **Mandatory** | **Core Subject Compliance**<br>• Single-command deployment (`make up` / `docker compose up`).<br>• Mandatory HTTPS across all external incoming traffic.<br>• Zero JavaScript console errors on Google Chrome.<br>• Strict secret isolation (`.env` git-ignored, `.env.example` provided). | **Pass/Fail** | Root [`compose.yml`](../../compose.yml), [`Makefile`](../../Makefile) |

---

## 2. Master System Architecture

```text
                                  [ PUBLIC INTERNET ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
           https://skilio.works (Port 443)      https://grafana.skilio.works (Port 443)
                        │                                     │
                        ▼                                     ▼
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                               AWS EC2 CLOUD SERVER                                │
 │                                                                                   │
 │  ┌─────────────────────────────────────────────────────────────────────────────┐  │
 │  │                         Traefik 3.6 Cloud Ingress                           │  │
 │  │      • Automated Let's Encrypt TLS 1.3 Encryption                           │  │
 │  │      • Automatic HTTP (Port 80) ──▶ HTTPS (Port 443) Redirection            │  │
 │  │      • Dynamic Docker socket discovery & health routing                     │  │
 │  └──────────────────────┬───────────────────────────────┬──────────────────────┘  │
 │                         │                               │                         │
 │                         ▼                               ▼                         │
 │             ┌───────────────────────┐       ┌───────────────────────┐             │
 │             │   FastAPI + React     │       │   Grafana Dashboard   │             │
 │             │  (Skilio Web App)     │       │ (Live Telemetry UI)   │             │
 │             └───────────┬───────────┘       └───────────┬───────────┘             │
 │                         │                               │                         │
 │                         ▼ (Private Internal Network)    ▼                         │
 │             ┌───────────────────────┐       ┌───────────────────────┐             │
 │             │   PostgreSQL 18 DB    │       │    Prometheus         │             │
 │             │    + Redis 8 Cache    │       │  Telemetry Scraper    │             │
 │             └───────────┬───────────┘       └───────────────────────┘             │
 │                         │                                                         │
 │                         ▼                                                         │
 │             ┌───────────────────────┐                                             │
 │             │  Automated DB Backup  │ ──▶ Daily gzip snapshots (/dumps)           │
 │             │  Daemon (Alpine Cron) │ ──▶ RTO < 60s Disaster Recovery Drill       │
 │             └───────────────────────┘                                             │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. DevOps Documentation Directory

Our DevOps documentation is organized into two layers: **Official Evaluation Specs** and **Deep-Dive Technical Guides**:

### 📑 Official Evaluation Module Specs
* 🚀 **[deployment.md](deployment.md)**: Cloud Infrastructure, Traefik Reverse Proxy, and Zero-Touch CI/CD (**IV.10 Major — 2 Pts**).
* 🛡️ **[backup.md](backup.md)**: Health Probes, Public Status Dashboard, and Backup/DR Runbook (**IV.7 Minor — 1 Pt**).
* 📊 **[monitoring.md](monitoring.md)**: Observability Architecture, Prometheus Scrape Targets, and Grafana Dashboards (**IV.7 Major — 2 Pts**).
* 🎓 **[presentation_plan.md](presentation_plan.md)**: Master 6-Phase Evaluation Defense Plan & Talking Points.

### 📖 Deep-Dive Engineering Guides (`docs/devops/guides/`)
* 🐳 **[guides/01_docker_compose_foundation.md](guides/01_docker_compose_foundation.md)**: Multi-Stage Dockerfile, Compose file inheritance, networking, and volume persistence.
* ☁️ **[guides/02_cloud_server_&_auto_setup.md](guides/02_cloud_server_&_auto_setup.md)**: AWS EC2 provisioning, Elastic IP, 2GB Swap OOM prevention, and idempotent server setup.
* 🔒 **[guides/03_ingress_reverse_proxy_https.md](guides/03_ingress_reverse_proxy_https.md)**: Traefik dynamic socket discovery, ACME Let's Encrypt TLS challenges, and HTTP 308 redirects.
* ⚙️ **[guides/04_CI-CD_pipeline.md](guides/04_CI-CD_pipeline.md)**: 3-Tier CI quality gates, least-privilege SSH `rsync`, and zero-downtime rolling container swap.
* 🛡️ **[guides/05_backup_&_disaster_recovery.md](guides/05_backup_&_disaster_recovery.md)**: Zero-downtime streaming backups, RTO < 60s disaster recovery, and sandbox verification drill.

---

## 4. Key CLI Commands (Operations Cheat Sheet)

The root [`Makefile`](../../Makefile) provides standardized single-command shortcuts for all team and infrastructure tasks:

### Local Development
```bash
make up          # Start the complete local stack in Docker
make dev         # Run local dev environment with live reload
make test        # Run backend pytest suite with code coverage
make seed        # Populate database with mock users and jobs
```

### Production Cloud Operations (AWS)
```bash
make deploy-status    # View live production container status, CPU%, and RAM
make deploy-logs      # Stream real-time production container logs
make deploy-restart   # Restart production containers on AWS
make deploy-ssh       # Open an immediate SSH terminal into the AWS server
```

### Disaster Recovery & Health Drills
```bash
make dr-test          # Run automated sandbox disaster recovery drill (RTO < 60s)
make backup           # Trigger an immediate manual database backup
```

