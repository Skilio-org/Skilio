# DevOps Engineering & Cloud Infrastructure Hub

This directory contains the operational documentation, technical specifications, and implementation guides for the Skilio platform infrastructure.

---

## 1. 42 Evaluation Point Ledger (5 Points Total)

As DevOps Lead, Aysadeq owns **5 Points** of evaluation modules plus the **Section III Mandatory Requirements**:

| Module ID | Scope | Description | Points | Specification Link |
| :--- | :--- | :--- | :---: | :--- |
| **IV.10** | **Module of Choice (Major)** | **Production Cloud Deployment & Automated Zero-Touch CI/CD**<br>• AWS EC2 cloud infrastructure with static Elastic IP and security group isolation.<br>• Traefik 3.6 reverse proxy with automated Let's Encrypt TLS 1.3 certificates.<br>• Automated 3-tier GitHub Actions CI testing gate and zero-downtime rolling container swap over SSH `rsync`. | **2 Pts** | [deployment.md](deployment.md) |
| **IV.7** | **DevOps (Minor)** | **Health Check, Public Status Page & Disaster Recovery**<br>• Diagnostic health endpoint (`/api/v1/health`) probing Postgres latency, Redis ping, and disk capacity.<br>• Public React status page (`/status`) with real-time latency indicators.<br>• Automated daily database backup daemon with `.sql.gz` compression and 7-day retention.<br>• Instant point-in-time recovery and ephemeral sandbox drill achieving **RTO < 60s**. | **1 Pt** | [backup.md](backup.md) |
| **IV.7** | **DevOps (Major)** | **Observability Suite (Prometheus & Grafana)**<br>• Prometheus scraping backend application metrics and system stats via the pull model.<br>• Pre-configured Grafana dashboards visualizing CPU, memory, HTTP request rates, and error latency.<br>• Pre-configured alert rules for container restarts and resource spikes. | **2 Pts** | [monitoring.md](monitoring.md) |
| **Sec III** | **Mandatory** | **Core Subject Compliance**<br>• Single-command deployment (`make up` / `docker compose up`).<br>• Mandatory HTTPS across all external incoming traffic.<br>• Zero JavaScript console errors on Google Chrome.<br>• Strict secret isolation (`.env` git-ignored, `.env.example` provided). | **Pass/Fail** | Root [`compose.yml`](../../compose.yml), [`Makefile`](../../Makefile) |

---

## 2. Production Cloud Architecture

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

## 3. Documentation Index

The DevOps documentation suite is structured into two complementary layers:

### Module Presentation Specifications
* **[deployment.md](deployment.md)**: Cloud infrastructure (AWS EC2), reverse proxy ingress (Traefik 3.6), and automated zero-touch delivery (GitHub Actions CI/CD) — **IV.10 Major (2 Points)**.
* **[backup.md](backup.md)**: Diagnostic health endpoint (`/health`), public status dashboard (`/status`), automated daily backup engine, and sandbox disaster recovery drill — **IV.7 Minor (1 Point)**.
* **[monitoring.md](monitoring.md)**: 3-tier telemetry collection, custom Grafana dashboards as code, and Prometheus alerting engine — **IV.7 Major (2 Points)**.

### Technical Implementation Guides (`docs/devops/guides/`)
* **[guides/01_docker_compose_foundation.md](guides/01_docker_compose_foundation.md)**: Multi-stage Dockerfile architecture, compose inheritance, internal networking, and volume persistence.
* **[guides/02_cloud_server_&_auto_setup.md](guides/02_cloud_server_&_auto_setup.md)**: AWS EC2 server provisioning, Elastic IP, 2GB swap memory buffer for OOM protection, and idempotent setup automation.
* **[guides/03_ingress_reverse_proxy_https.md](guides/03_ingress_reverse_proxy_https.md)**: Traefik dynamic socket discovery, ACME Let's Encrypt TLS 1.3 handshakes, and HTTP 308 permanent redirects.
* **[guides/04_CI-CD_pipeline.md](guides/04_CI-CD_pipeline.md)**: 3-tier CI quality validation gate, least-privilege SSH `rsync`, and zero-downtime rolling container swap.
* **[guides/05_backup_&_disaster_recovery.md](guides/05_backup_&_disaster_recovery.md)**: Non-locking PostgreSQL streaming backups, CRC-32 verification, FIFO retention, and sub-60s disaster recovery sandbox drill.
* **[guides/06_observability_and_monitoring.md](guides/06_observability_and_monitoring.md)**: Prometheus time-series metrics collection, multi-tier exporters (FastAPI, Postgres, cAdvisor), Grafana dashboards as code, and alerting rules engine.

---

## 4. Operational CLI Quick Reference

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

### Disaster Recovery & Verification
```bash
make dr-test          # Run automated sandbox disaster recovery drill (RTO < 60s)
make backup           # Trigger an immediate manual database backup
```
