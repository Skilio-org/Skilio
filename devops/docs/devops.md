# DevOps Context & Rules for ft_transcendence

> Automatically loaded by Antigravity IDE for all sessions in this workspace.

## Developer Identity & Role
- **Developer:** Aysadeq (`ayman` / `aysadeq`)
- **Role:** DevOps Lead & System Architect
- **Branch:** `aysadeq`
- **Project:** Freelancer Marketplace Platform (*Skilio*) — 42 `ft_transcendence` (v21.2)
- **Live URLs:**
  - Web App: https://skilio.works (AWS EC2 • Elastic IP `16.192.59.166`)
  - Monitoring: https://grafana.skilio.works

## 42 Modules Owned by DevOps Lead (Total: 5 Points + Mandatory)
1. **IV.10 Module of Choice Major (2 Points): Production Cloud Deployment & Automated CI/CD**
   - AWS EC2 `t3.small` cloud provisioning (VPC, Elastic IP, Security Groups).
   - Traefik 3.6 ingress with automatic Let's Encrypt TLS/HTTPS redirection.
   - Zero-touch CI/CD via GitHub Actions (`.github/workflows/deploy.yml`) using `rsync` over SSH and zero-downtime rolling container swap.
2. **IV.7 DevOps Minor (1 Point): Health Check, Status Page & Disaster Recovery**
   - Probes: `/api/v1/health` testing PostgreSQL latency, Redis ping, host disk capacity.
   - Status Page: `/status` (React 19 dashboard with latency badges and auto-poll).
   - Backup: Automated `pg_dump` daemon with gzip compression and 7-day rolling retention.
   - Disaster Recovery: Point-in-time restore (`restore.sh`) and sandbox verification drill (`dr-test.sh`) with RTO < 60s (drill runs in < 5s).
3. **IV.7 DevOps Major (2 Points): Monitoring & Observability Suite**
   - Prometheus metrics scrapers and pre-configured Grafana dashboards.
4. **Section III Mandatory Requirements:**
   - Single-command deployment (`docker compose up` / `make up`).
   - Mandatory HTTPS across all external endpoints.
   - Zero console errors in Google Chrome.
   - Strict secret isolation (`.env` vs `.env.example`).

## Key Files
- Architecture: `compose.yml`, `compose.override.yml`, `compose.deploy.yml`, `Makefile`
- Health & Status: `backend/app/api/routes/health.py`, `frontend/src/routes/status.tsx`
- Backups & DR: `devops/backup/backup.sh`, `restore.sh`, `dr-test.sh`, `entrypoint.sh`
- Cloud & Scripts: `devops/scripts/server-init.sh`, `setup.sh`, `dev.sh`
- Workflows: `.github/workflows/deploy.yml`, `test-backend.yml`, `lint.yml`
- Master Reference: See `AGENTS.md` at project root for exhaustive technical rationale and defense scripts.
