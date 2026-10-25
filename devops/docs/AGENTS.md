# DevOps Engineering & Project Context: ft_transcendence (Skilio Platform)

> **Auto-Context Rule / System Prompt**: This file provides complete project context, developer identity, architecture, assigned 42 modules, and technical rationale for any AI assistant working on this repository.

---

## 1. Project & Developer Overview

* **Project Name:** Freelancer Marketplace Platform (*Skilio*) — 42 Common Core Final Project (`ft_transcendence` v21.2)
* **Live Production URL:** [https://skilio.works](https://skilio.works) (AWS EC2 • Elastic IP: `16.192.59.166`)
* **Live Monitoring URL:** [https://grafana.skilio.works](https://grafana.skilio.works)
* **Repository:** `Moody-0x01/Freelancer`
* **Developer Name / Login:** **Aysadeq** (`ayman` / `aysadeq`)
* **Primary Role:** **DevOps Lead & System Architect**
* **Active Git Branch:** `aysadeq` (read docs/git-work-flow.md for more info)

---

## 2. 42 Evaluation Modules & Point Ledger

As DevOps Lead, Aysadeq owns **5 Points** of evaluation modules plus the **Section III Mandatory Requirements**:

| Module ID | Category & Scope | Description | Points | Key Artifacts |
| :--- | :--- | :--- | :---: | :--- |
| **IV.10** | **Module of Choice (Major)** | **Production Cloud Deployment & Automated Zero-Touch CI/CD**<br>• AWS EC2 (`t3.small`) cloud provisioning with Elastic IP & security groups.<br>• Traefik 3.6 ingress with automated Let's Encrypt TLS-ALPN / HTTPS redirection.<br>• Automated GitHub Actions CI/CD with 3-tier validation (linting, tests, docker smoke test) and zero-downtime rolling container swap over SSH `rsync`. | **2 Pts** | • `.github/workflows/deploy.yml`<br>• `compose.deploy.yml`<br>• `devops/scripts/server-init.sh`<br>• `devops/docs/deployment/` |
| **IV.7** | **DevOps (Minor)** | **Health Check, Public Status Page & Disaster Recovery**<br>• Real-time diagnostic endpoint (`/api/v1/health`) probing Postgres latency (`SELECT 1`), Redis ping, and host disk capacity.<br>• Public React status page (`/status`) with live latency badges and auto-polling.<br>• Automated Postgres backup daemon with `.sql.gz` compression and 7-day rolling retention.<br>• Instant point-in-time recovery (`restore.sh`) & sandbox verification drill (`dr-test.sh`) achieving **RTO < 60 seconds** (actual drill runs in < 5s). | **1 Pt** | • `backend/app/api/routes/health.py`<br>• `frontend/src/routes/status.tsx`<br>• `devops/backup/backup.sh`<br>• `devops/backup/restore.sh`<br>• `devops/backup/dr-test.sh` |
| **IV.7** | **DevOps (Major)** | **Observability Suite (Prometheus & Grafana)**<br>• Prometheus scraping backend application metrics and node stats.<br>• Pre-configured Grafana dashboards visualizing CPU, memory, HTTP request rates, and error latency.<br>• Pre-configured alerts for container restarts and resource spikes. | **2 Pts** | • `devops/monitoring/prometheus/`<br>• `devops/monitoring/grafana/`<br>• `devops/docs/MONITORING.md` |
| **Sec III** | **Mandatory Requirements** | **Core Subject Compliance**<br>• Web application with frontend, backend, and relational database.<br>• Single-command deployment (`docker compose up` / `make up`).<br>• Mandatory HTTPS across all external incoming traffic.<br>• Zero JavaScript console errors / warnings on Google Chrome.<br>• Strict secret isolation (`.env` ignored by Git, `.env.example` provided). | **Pass/Fail** | • `compose.yml`<br>• `compose.override.yml`<br>• `.env.example`<br>• `Makefile` |

**Total DevOps Module Points Claimed:** **5 Points** (towards the 14-point project requirement).

---

## 3. Technology Stack & Multi-Stage Architecture

### Application Stack
* **Backend:** Python 3.14, FastAPI, SQLModel (SQLAlchemy 2.0 async), PostgreSQL 18 (`psycopg3`), Redis 8, Alembic, uv package manager.
* **Frontend:** React 19, TypeScript 6, Vite 8 (SWC), Tailwind CSS v4, TanStack Router, TanStack Query v5, Bun runtime.
* **Reverse Proxy / Ingress:** Traefik 3.6 (Docker provider with label-based routing & ACME TLS resolver).
* **Observability:** Prometheus + Grafana.
* **Storage & Hosting:** AWS EC2 (`t3.small`, Ubuntu 24.04 LTS), 2GB Swapfile (`vm.swappiness=10`), EBS volumes.

### Multi-File Docker Compose Strategy
The system uses Docker Compose file inheritance:
1. **`compose.yml` (Base):** Defines all service blueprints:
   - `proxy` (Traefik 3.6)
   - `db` (PostgreSQL 18 on internal network)
   - `db-backup` (Alpine daemon running cron backups)
   - `redis` (Redis 8 cache & Pub/Sub)
   - `backend` (FastAPI + React bundle)
   - `prometheus` & `grafana` (telemetry)
2. **`compose.override.yml` (Local Dev):** Automatically merged during local `docker compose up`. Exposes ports to `localhost` (Postgres 5432, Redis 6379, Traefik Dashboard 8090, Mailpit SMTP sandbox).
3. **`compose.deploy.yml` (Production):** Overrides config on AWS. Binds ports 80/443 exclusively through Traefik, blocks external DB/Redis ports, enforces HTTPS redirects, enables ACME TLS challenge, and connects live health probes.

---

## 4. Key File & Directory Map for DevOps

```text
Freelancer/
├── compose.yml                     # Base container architecture
├── compose.override.yml            # Local development overrides & debugging ports
├── compose.deploy.yml              # Production overrides (Traefik TLS, port lock-down)
├── Makefile                        # Team CLI: make up, make dev, make dr-test, make deploy-*
├── .env.example                    # Template for development environment variables
├── .env.production.example         # Template for AWS production secrets
│
├── devops/
│   ├── backup/                     # IV.7 Backup & Disaster Recovery Suite
│   │   ├── backup.sh               # Runs pg_dump with gzip, manages 7-day retention
│   │   ├── restore.sh              # Terminates active DB connections, restores dump
│   │   ├── dr-test.sh              # Sandbox verification drill on ephemeral test database
│   │   ├── entrypoint.sh           # Daemon cron scheduler (runs at 02:00 UTC)
│   │   └── dumps/                  # Volume mount destination for .sql.gz snapshots
│   ├── monitoring/                 # IV.7 Observability Suite
│   │   ├── prometheus/             # Prometheus configuration & scrape targets
│   │   └── grafana/                # Grafana dashboards and provisioning configs
│   ├── scripts/                    # Automation Scripts
│   │   ├── server-init.sh          # Idempotent AWS server setup (Docker, 2GB swap, UFW)
│   │   ├── setup.sh                # Local team onboarding script (make setup)
│   │   └── dev.sh                  # Local development concurrent launcher
│   └── docs/                       # DevOps Documentation Suite
│       ├── presentation_plan.md    # 6-phase defense plan & 7-stage learning roadmap
│       ├── implementation_plan.md  # SLA/SLO/RTO targets & architecture details
│       ├── BACKUP.md               # Backup & DR deep dive
│       ├── MONITORING.md           # Observability metrics & alert specs
│       └── deployment/             # Cloud provisioning & CI/CD pipeline guides
│
├── .github/workflows/              # IV.10 Zero-Touch CI/CD Pipelines
│   ├── deploy.yml                  # Production deployment (lint -> test -> rsync -> rolling swap)
│   ├── test-backend.yml            # 173 pytest tests with coverage validation
│   ├── test-docker-compose.yml     # Docker build smoke test
│   └── lint.yml                    # Ruff linting & TypeScript type checks
│
├── backend/Dockerfile
```

---

## 5. Architectural Rationale & Defense Talking Points (Why Decisions Were Made)

When defending the project before 42 peer evaluators, explain these design choices:

1. **Why Traefik instead of NGINX?**
   - NGINX requires static configuration files and manual reload signals (`nginx -s reload`) when containers change IP.
   - Traefik listens directly to the Docker daemon socket (`/var/run/docker.sock`), dynamically routing to containers via container labels.
   - Traefik natively solves Let's Encrypt TLS-ALPN and HTTP-01 challenges, automatically issuing and renewing HTTPS certificates without external certbot cron jobs.

2. **Why 2GB Swapfile on AWS (`vm.swappiness=10`)?**
   - The AWS `t3.small` instance has 2GB RAM. Compiling the React 19 SPA with Bun/Vite spikes memory usage, triggering Linux kernel `OOM Killer` (Exit Code 137).
   - Adding 2GB swap via `server-init.sh` provides a safety margin. `vm.swappiness=10` ensures Linux uses physical RAM for active processes and only pages to swap during memory pressure.

3. **Why Sandboxed Disaster Recovery (`dr-test.sh`)?**
   - An untested backup is not a backup.
   - `dr-test.sh` spins up an ephemeral database container (`skilio_dr_test_db`), imports the latest production dump, executes relational integrity checks (`SELECT count(*) FROM users`), verifies table schemas, and cleans up the sandbox. This proves our **RTO < 60s** (real drill completes in < 5 seconds) without risking production data.

4. **Why Multi-Stage Dockerfile?**
   - Stage 1 compiles the React SPA bundle with Bun.
   - Stage 2 copies only static assets into the Python 3.14 FastAPI image. This minimizes image size, reduces attack surface, and allows FastAPI to serve both API endpoints and the SPA in a single container.

5. **Why SSH `rsync` Deployment over GitHub PAT on the Server?**
   - Storing GitHub Personal Access Tokens or SSH deploy keys with repository write access on a cloud server violates the Principle of Least Privilege.
   - Our GitHub Actions runner holds an SSH private key (`SSH_PRIVATE_KEY`), pushes build artifacts to AWS via `rsync`, and triggers `docker compose up -d` remotely. The server itself has zero credentials to access GitHub.

---

## 6. Daily Operations & CLI Cheat Sheet (Makefile)

consult the `Makefile` in the root directory for all available commands.

## 7. AI Persona & Working Instructions

When assisting ayman on this repository:
**Always read subject to know what to do and what not to do**
**before the implementation always list all available options and trade-offs and give a recommendation**
**always keep it simple and short for a beginner in devops and 42student**
**always explain your work and your implementations and your decisions and ur commands after implementing**
**never touch or change or add to any team member work or folder unless take permission**
**keep in mind this is a school project so keep it simple and clean and don't over-engineer**
**keep in mind this project is for educational and learning purposes but it should be professional and production-ready**
**when you be asked to explain try be short and mention main core concepts in software or devops depending on the context of the question and what and why and how it works**