# 🚀 Production Cloud Deployment on AWS with Automated CI/CD Pipeline
### Module of Choice: **IV.10 Major Module (2 Points)**

> **Project:** Freelancer Platform (*Skilio*) — `ft_transcendence` (v21.2)  
> **DevOps Lead:** Aysadeq  
> **Live Production Application:** [https://skilio.works](https://skilio.works)  
> **Live Observability Dashboard:** [https://grafana.skilio.works](https://grafana.skilio.works)  
> **AWS Elastic IP:** `16.192.59.166` (EC2 `t3.small` • Ubuntu 24.04 LTS)  

---

## Table of Contents

1. [Executive Summary & 42 Subject Alignment](#1-executive-summary--42-subject-alignment)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Cloud Infrastructure & OS Hardening (IaaS)](#3-cloud-infrastructure--os-hardening-iaas)
4. [Ingress, Dynamic Reverse Proxy & TLS (Traefik 3.6)](#4-ingress-dynamic-reverse-proxy--tls-traefik-36)
5. [The 3-Tier Automated CI Quality Gate](#5-the-3-tier-automated-ci-quality-gate)
6. [Zero-Touch Continuous Deployment Pipeline (CD)](#6-zero-touch-continuous-deployment-pipeline-cd)
7. [Developer Tooling & Management CLI (Makefile)](#7-developer-tooling--management-cli-makefile)
8. [42 Evaluation Defense & System Mastery](#8-42-evaluation-defense--system-mastery)

---

## 1. Executive Summary & 42 Subject Alignment

Under Section **IV.10 Modules of choice**, the 42 subject mandates:
> *"Major: Implement a custom module that is not listed above. The module must be substantial and demonstrate technical complexity."*

This module bridges the gap between academic code and production-grade software engineering. Rather than remaining confined to `localhost`, the Skilio platform is deployed as a 24/7 cloud SaaS accessible worldwide with automated HTTPS encryption, a hardened 3-tier CI pipeline, and a zero-touch delivery workflow.

### The 4 Mandatory Subject Evaluation Criteria

| Subject Requirement | Our Implementation & Architectural Defense |
| :--- | :--- |
| **1. Why did you choose this module?** | A real-world freelancer marketplace cannot remain on `localhost`. Clients and freelancers need to interact across different devices (smartphones, laptops, tablets) over the public internet with real TLS encryption and zero latency friction. |
| **2. What technical challenges does it address?** | • **Cloud Networking & Security**: Managing AWS VPC security groups, restricting all internal databases/ports, and enforcing asymmetric RSA key authentication.<br>• **Automated Public-Key Cryptography**: Dynamic ACME TLS certificate issuance and renewal via Traefik 3.6 and Let's Encrypt.<br>• **Delivery Automation**: Multi-stage GitHub Actions CI quality gates and automated SSH deployments on merge.<br>• **Resource Constraints**: Running 10 Docker containers and multi-stage Vite/Python builds reliably on a budget-constrained 2.0 GiB AWS instance using a tuned 2 GB Swap memory file. |
| **3. How does it add value to the project?** | It completely eliminates "works on my machine" bugs, provides instant automated delivery within 2 minutes of merging a PR, and allows evaluators to interact with the live platform on their own phones during the defense. |
| **4. Why does it deserve Major (2 Points) status?** | It is not a basic script or manual VPS launch. It integrates **4 distinct production engineering disciplines**: Cloud Infrastructure (AWS IaaS), Delivery Automation (CI/CD), Reverse Proxy Ingress (Traefik/TLS), and Developer Experience Tooling (`Makefile`). |

---

## 2. High-Level System Architecture

```text
 ┌────────────────────────┐      git push (PR)         ┌─────────────────────────────────────────┐
 │   Developer Workstation│ ─────────────────────────▶ │        GitHub Actions 3-Tier CI         │
 │   (Local Feature Work) │                            │  • Tier 1: Ruff AST & TypeScript Build  │
 └────────────────────────┘                            │  • Tier 2: 173 Pytests (83% Coverage)   │
                                                       │  • Tier 3: Docker Build & Smoke Test    │
                                                       └────────────────────┬────────────────────┘
                                                                            │ Merge to master
                                                                            ▼
                                                       ┌─────────────────────────────────────────┐
                                                       │        GitHub Actions CD Runner         │
                                                       │  • Secure SSH Handshake (Secrets)       │
                                                       │  • Idempotent rsync Sync                │
                                                       └────────────────────┬────────────────────┘
                                                                            │ (SSH :22)
                                                                            ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                 AWS EC2 CLOUD SERVER (IaaS)                                   │
 │                                                                                               │
 │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                         AWS Virtual Private Cloud (VPC) Firewall                        │  │
 │  │           Port 22 (SSH RSA Key)  •  Port 80 (HTTP)  •  Port 443 (HTTPS)                 │  │
 │  └─────────────────────────────────────────────┬───────────────────────────────────────────┘  │
 │                                                │                                              │
 │                                                ▼                                              │
 │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                                    Traefik 3.6 Ingress                                  │  │
 │  │      • Automated Let's Encrypt TLS 1.3 / ACME TLS-ALPN Challenge                        │  │
 │  │      • HTTP (Port 80) ──▶ HTTPS (Port 443) 308 Permanent Redirection                    │  │
 │  │      • Health Check Telemetry: /api/v1/health Active Probing (10s interval)             │  │
 │  └───────────────────┬─────────────────────────────────┬───────────────────────────────────┘  │
 │                      │                                 │                                      │
 │       https://skilio.works                             │ https://grafana.skilio.works         │
 │                      ▼                                 ▼                                      │
 │          ┌───────────────────────┐         ┌───────────────────────┐                          │
 │          │   FastAPI + React     │         │   Grafana Dashboard   │                          │
 │          │  (Skilio Core App)    │         │  (Real-Time Metrics)  │                          │
 │          └───────────┬───────────┘         └───────────┬───────────┘                          │
 │                      │                                 │                                      │
 │                      ▼ (Internal Bridge Network)       ▼                                      │
 │          ┌───────────────────────┐         ┌───────────────────────┐                          │
 │          │   PostgreSQL 18 DB    │         │    Prometheus +       │                          │
 │          │    + Redis Cache      │         │   Node Exporters      │                          │
 │          └───────────────────────┘         └───────────────────────┘                          │
 └───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cloud Infrastructure & OS Hardening (IaaS)

### 3.1 Provisioning Specifications
* **Cloud Provider**: Amazon Web Services (AWS), Europe Datacenter.
* **Instance Tier**: `t3.small` (2 vCPUs, 2.0 GiB physical RAM, burstable CPU credits).
* **Storage**: 29 GB NVMe SSD (`gp3` General Purpose SSD root volume).
* **Static Elastic IP**: Allocated and attached **`16.192.59.166`** (persists across reboots).
* **Domain DNS Routing**:
  * Apex Domain (`skilio.works`): A-record $\rightarrow$ `16.192.59.166`.
  * Wildcard Subdomains (`*.skilio.works`): A-record $\rightarrow$ `16.192.59.166` (`grafana.skilio.works`, `adminer.skilio.works`).

### 3.2 Network Security & Least-Privilege Firewall
The AWS Security Group operates as a stateful hypervisor firewall outside the operating system:
* **Port 22 (SSH)**: Allowed from anywhere, strictly locked to asymmetric RSA private key authentication (`skilio-key.pem`). Password login is disabled.
* **Port 80 (HTTP)**: Open publicly to resolve Let's Encrypt ACME challenges and perform automated 308 redirects to HTTPS.
* **Port 443 (HTTPS)**: Open publicly for all production application traffic, REST APIs, and WebSockets.
* **Internal Ports**: Ports `5432` (Postgres), `6379` (Redis), `8000` (FastAPI), and `9090` (Prometheus) are strictly **BLOCKED** from the public internet and exist exclusively on Docker's private bridge network.

### 3.3 Memory Architecture & 2 GB Swap Space
* **The Problem**: Compiling the React Vite bundle (`bun run build`) alongside Python UV bytecode compilation momentarily spikes memory to ~2.5 GiB. On a 2.0 GiB instance, the Linux kernel Out-Of-Memory (OOM) Killer would terminate processes with `Exit Code 137`.
* **The Solution**:
  1. Allocated contiguous 2 GB block on the NVMe SSD: `fallocate -l 2G /swapfile`.
  2. Hardened permissions: `chmod 600 /swapfile` (strictly root-only, preventing unprivileged memory inspection).
  3. Formatted and activated: `mkswap /swapfile && swapon /swapfile`.
  4. Persisted in `/etc/fstab` across reboots.
  5. Tuned kernel swappiness: `sysctl vm.swappiness=10` (prioritizes fast physical RAM and only pages inactive memory during extreme spikes >90%).

---

## 4. Ingress, Dynamic Reverse Proxy & TLS (Traefik 3.6)

### 4.1 Cloud-Native Ingress (Traefik vs. Nginx)
Traditional Nginx requires manual configuration files and reload signals (`nginx -s reload`). Traefik connects directly to the Docker socket (`/var/run/docker.sock`), dynamically reading container labels to discover routes, handle ports, and provision SSL certificates with zero manual configuration.

### 4.2 Automated ACME TLS 1.3 Handshake
* **Certificate Authority**: Let's Encrypt (free, automated, X.509 certificates).
* **Challenge Type**: `tlschallenge=true` (TLS-ALPN-01) and HTTP-01 challenge solving.
* **Storage & Renewal**: Certificates are stored in `/certificates/acme.json` mounted on a persistent Docker volume (`traefik-certificates`). Traefik automatically renews certificates at **day 60** (30 days prior to expiration) with zero downtime.
* **Global HTTPS Enforcement**: Port 80 unconditionally issues HTTP 308 redirects to HTTPS.

---

## 5. The 3-Tier Automated CI Quality Gate

Every Pull Request targeting `master` must pass a sequential 3-tier automated quality pipeline before merge is permitted:

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         3-TIER CI QUALITY PIPELINES                         │
 │                                                                             │
 │  [Tier 1: lint.yml] (~15s)                                                  │
 │   • Backend: Fast AST syntax analysis via Ruff (--select E9,F63,F7,F82)     │
 │   • Frontend: Full TypeScript type-checking & bundle build via Bun          │
 │                                                                             │
 │  [Tier 2: test-backend.yml] (~1m)                                           │
 │   • Spawns dedicated PostgreSQL 18 & Mailpit service containers             │
 │   • Runs database migrations (prestart.sh)                                  │
 │   • Executes 173 Pytest integration tests                                   │
 │   • Enforces strict ≥70% coverage gate (achieving 83% coverage)             │
 │   • Uploads interactive HTML coverage report artifact                       │
 │                                                                             │
 │  [Tier 3: test-docker-compose.yml] (~2.5m)                                  │
 │   • Builds production multi-stage Docker images                             │
 │   • Boots containerized application stack in detached mode                  │
 │   • Probes HTTP /api/v1/utils/health-check/ with retries                    │
 │   • Verifies static frontend serving at root (/)                            │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Zero-Touch Continuous Deployment Pipeline (CD)

Defined in [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml), CD triggers automatically whenever code is merged into `master`.

### 6.1 The 6 Deployment Stages

```text
 1. Configure Temporary SSH Key (using secrets.SERVER_SSH_KEY)
                     │
                     ▼
 2. Idempotent Code Sync via rsync over SSH
    (Excludes .git*, .env*, node_modules, .venv, and devops/backup/dumps/)
                     │
                     ▼
 3. Multi-Stage Container Build ('docker compose build')
    (Compiles Vite frontend + Python UV package manager with 2 GB Swap safety)
                     │
                     ▼
 4. Ephemeral Migration Prestart Gate ('docker compose run --rm backend prestart.sh')
    (Applies pending Alembic migrations & verifies superuser before containers restart)
                     │
                     ▼
 5. Zero-Downtime Rolling Swap ('docker compose up -d --remove-orphans')
    (New containers boot, pass Traefik health probes; old containers gracefully drain)
                     │
                     ▼
 6. Automated Layer Prune ('docker image prune -f') & Live Production Probe
    (Cleans dangling layers; executes curl probe against https://skilio.works/api/v1/health)
```

### 6.2 Architectural Decisions & Trade-Offs

#### Why `rsync` over SSH instead of `git pull` on the server?
* **Security & Least Privilege**: `Moody-0x01/Freelancer` is a private Git repository. Running `git pull` on EC2 would require storing a GitHub Personal Access Token (PAT) or deploy key permanently on the server disk. If the server were ever breached, the attacker could access the entire source code repository. With `rsync`, GitHub Actions already has the checked-out code and pushes it over SSH. The EC2 server holds **zero GitHub tokens**.
* **Data Protection**: `rsync --delete` strictly excludes `.env*` and `devops/backup/dumps/`, ensuring live production credentials and automated database backups are never deleted during deployment.

#### Why Build-on-Host + Swap instead of Container Registry?
* **Simplicity & Self-Containment**: Building on the host with 2 GB Swap avoids third-party container registry rate limits (Docker Hub 100 pulls/6hr), token expirations, and registry storage costs.
* **Trade-off Recognition**: For a single-node VPS, this architecture is self-contained and takes ~70s. In multi-node auto-scaling Kubernetes clusters, the industry pattern is Option B (building in CI and pushing to AWS ECR/GHCR so worker nodes only pull).

---

## 7. Developer Tooling & Management CLI (Makefile)

The root [`Makefile`](../../Makefile) provides single-word CLI commands for developer operations:

| Command | Category | Operational Function |
| :--- | :--- | :--- |
| `make setup` | Local Dev | One-command onboarding: installs deps, starts DB, migrates & seeds |
| `make dev` | Local Dev | Boots local FastAPI + React development stack with unified logs |
| `make test` | Testing | Runs backend pytest suite with coverage tracking |
| `make seed` | Testing | Seeds local database with mock accounts (`COUNT=20`) |
| `make deploy-ssh` | Cloud Ops | Opens instant interactive SSH terminal into AWS server |
| `make deploy-status` | Cloud Ops | Displays live production containers, CPU%, and memory usage |
| `make deploy-logs` | Cloud Ops | Streams real-time remote production container logs |
| `make deploy-restart` | Cloud Ops | Restarts production containers on AWS (or `SERVICE=backend`) |
| `make deploy-db-clean` | Cloud Ops | Safely drops and re-migrates production DB (preserves SSL certs) |
| `make deploy-db-seed` | Cloud Ops | Seeds production database with mock accounts (`COUNT=20`) |

---

## 8. 42 Evaluation Defense & System Mastery

### 8.1 Evaluator FAQ & Model Answers

**Q1: What happens if someone pushes broken code or failing tests?**  
> *"Our 3-tier CI pipeline on GitHub Actions intercepts the Pull Request. If Ruff finds syntax errors, TypeScript fails compilation, any of the 173 Pytests fail, or coverage drops below 70%, the PR is blocked. Broken code can never merge into `master`, and therefore the CD pipeline never executes."*

**Q2: How does your deployment achieve zero downtime?**  
> *"We use Traefik reverse proxy coupled with Docker Compose rolling updates. When new containers build, Docker launches the new container in parallel. Traefik actively probes `/api/v1/health` and only routes incoming user traffic to the new container once it responds with `healthy`. Meanwhile, existing connections to the old container gracefully drain before termination."*

**Q3: Why didn't you run `docker compose down -v` to reset your database on AWS?**  
> *"Running `docker compose down -v` is a catastrophic anti-pattern in production because it wipes all Docker named volumes, including `traefik-certificates`. This would destroy our `acme.json` file containing Let's Encrypt certificates and can cause Let's Encrypt to rate-limit and ban our domain for 7 days. Instead, our `make deploy-db-clean` command force-drops and recreates only the PostgreSQL `app` database via `psql`, keeping certificates and configurations 100% intact."*

### 8.2 Live 3-Minute Evaluation Walkthrough Script

1. **Step 1: The Live SaaS Hook (30s)**:
   * Open `https://skilio.works` on your browser or mobile phone.
   * Point out the valid Let's Encrypt TLS 1.3 padlock.
   * Run `curl -sI http://skilio.works` to prove automatic HTTP 308 redirection to HTTPS.
2. **Step 2: Live Observability & Health (30s)**:
   * Open `https://grafana.skilio.works` and show real-time CPU/RAM/HTTP metrics.
   * Open `https://skilio.works/api/v1/health` to show deep diagnostic telemetry for PostgreSQL, Redis, and disk storage.
3. **Step 3: The 3-Tier CI Gate (45s)**:
   * Show GitHub Pull Request history with all 3 green checks (Lint, Backend Tests with 83% coverage, Docker smoke test).
4. **Step 4: Developer CLI Demo (45s)**:
   * In local terminal, run `make deploy-status` to show running production containers and memory utilization.
   * Run `make help` to show the comprehensive standardized developer interface.
