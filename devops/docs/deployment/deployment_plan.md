# 🚀 Implementation Plan: Production Cloud Deployment & Automated CI/CD Pipeline
### Module Type: **IV.10 Module of Choice (Major — 2 Points)**
**Author / DevOps Lead:** Aysadeq  
**Project:** Skilio Marketplace Platform (`ft_transcendence`)

---

## 1. Executive Summary & 42 Subject Alignment

Under Section `IV.10 Modules of choice`, the 42 subject mandates:
> **"Major: Implement a custom module that is not listed above. The module must be substantial and demonstrate technical complexity."**

This implementation transitions the Skilio platform from an isolated `localhost` development environment into a live, production-grade cloud SaaS accessible across the public internet with automated HTTPS encryption, zero-touch continuous deployment, and enterprise network security.

### Mandatory Subject Justification Matrix

| Subject Criteria (Section IV.10) | Our Implementation & Architectural Justification |
| :--- | :--- |
| **1. Why did we choose this module?** | A real-world freelancer marketplace cannot remain confined to `localhost`. It must be accessible across the public internet to real users on mobile devices, tablets, and laptops. |
| **2. What technical challenges does it address?** | • **Cloud Networking & Firewalls**: Virtual Private Cloud (VPC), hypervisor security groups restricting traffic to ports 80, 443, and locked-down SSH keys.<br>• **Automated Cryptography**: Dynamic Traefik 3.6 ACME TLS challenge issuing and auto-renewing Let's Encrypt certificates.<br>• **Automated Delivery**: GitHub Actions CI/CD pipeline building, testing, and shipping code on `git push` with zero downtime.<br>• **Persistent Storage**: Cloud persistent volumes safeguarding PostgreSQL data and Prometheus metrics across container rebuilds. |
| **3. How does it add value to the project?** | It eliminates "it works on my machine" bugs, provides instant deployment of merged PRs within 2 minutes, and allows evaluators to interact with the live platform on their own smartphones during the defense. |
| **4. Why does it deserve Major (2 points) status?** | It is not a trivial manual VPS launch. It integrates 4 distinct production engineering disciplines: Cloud Infrastructure (IaaS), Delivery Automation (CI/CD), Reverse Proxy Ingress (Traefik/TLS), and Persistent Cloud Storage. |

---

## 2. System Architecture & End-to-End Data Flow

```text
 ┌────────────────────────┐      git push master       ┌────────────────────────┐
 │   Developer Workstation│ ─────────────────────────▶ │  GitHub Actions (CI/CD)│
 │   (Local Feature Work) │                            │  • Automated Linting   │
 └────────────────────────┘                            │  • Backend Pytest Gate │
                                                       │  • Secure SSH Trigger  │
                                                       └───────────┬────────────┘
                                                                   │
                                                Zero-Touch Deploy  │ (SSH + Secrets)
                                                                   ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                             CLOUD SERVER (IaaS)                              │
 │                                                                              │
 │  ┌────────────────────────────────────────────────────────────────────────┐  │
 │  │                 Cloud Firewall / Security Group (VPC)                  │  │
 │  │        Port 22 (SSH Key Only)  •  Port 80 (HTTP)  •  Port 443 (HTTPS)  │  │
 │  └───────────────────────────────────┬────────────────────────────────────┘  │
 │                                      │                                       │
 │                                      ▼                                       │
 │  ┌────────────────────────────────────────────────────────────────────────┐  │
 │  │                         Traefik 3.6 Ingress                            │  │
 │  │      • Automated Let's Encrypt SSL/TLS Certificate Generation          │  │
 │  │      • HTTP (Port 80) ──▶ HTTPS (Port 443) Automatic Redirect          │  │
 │  │      • Routing to Backend via /api/v1/health Probe Telemetry           │  │
 │  └───────────────────┬───────────────────────┬────────────────────────────┘  │
 │                      │                       │                               │
 │                      ▼                       ▼                               │
 │          ┌───────────────────────┐       ┌───────────────────────┐           │
 │          │   FastAPI + React     │       │   PostgreSQL 18 DB    │           │
 │          │  (Skilio Core App)    │       │   + db-backup daemon  │           │
 │          └───────────────────────┘       └───────────────────────┘           │
 │                      ▲                               ▲                       │
 │                      └───────────────────────┬───────┘                       │
 │                                              │ Persistent Storage            │
 │                                              ▼                               │
 │                                  [Cloud Persistent Volumes]                  │
 └──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Workflow: Phases & Step-by-Step Tasks

### Phase 1: Cloud Server & Network Provisioning (IaaS) (COMPLETED ✅)
**Goal**: Provision a secure Linux virtual server with a dedicated static IP and domain DNS routing.

- [x] **Step 1.1: Server Provisioning (`skilio-production`)**
  - **Provider & Region**: AWS Europe Datacenter.
  - **Operating System**: Ubuntu Server 24.04 LTS (`Linux 6.17.0-1017-aws x86_64`).
  - **Instance Type**: `t3.small` (2 vCPUs, 2.0 GiB physical RAM) — Burstable general-purpose compute covered by student/trial credits.
  - **Storage**: 29 GB NVMe SSD (`gp3` General Purpose SSD root volume, ~7% initial usage).
  - **Static Elastic IP**: Allocated and permanently attached AWS Elastic IP **`16.192.59.166`** (never changes across server reboots, ensuring stable DNS).
- [x] **Step 1.2: Firewall & Network Security Group Hardening (`skilio-sg`)**
  - Configured stateful hypervisor-level firewall outside the Linux OS dropping unauthorized packets before reaching the network interface card:
    - **Port 22 (SSH)**: Allowed from `0.0.0.0/0` (strictly restricted to asymmetric RSA key-pair authentication; password login disabled).
    - **Port 80 (HTTP)**: Allowed from `0.0.0.0/0` (required for Let's Encrypt ACME domain verification challenges and automatic 301 HTTPS redirection).
    - **Port 443 (HTTPS)**: Allowed from `0.0.0.0/0` (production encrypted traffic for web app, REST APIs, and WebSockets).
    - **Database & Internal Ports**: Ports `5432` (PostgreSQL), `6379` (Redis), `8000` (FastAPI), and `9090` (Prometheus) strictly blocked from the public internet.
- [x] **Step 1.3: Cryptographic Access & SSH Handshake Verification**
  - Generated RSA key pair: `skilio-key.pem`.
  - Local private key secured with POSIX permissions: `chmod 400 ~/Downloads/skilio-key.pem` (read-only by owner, 0 permissions for group/others).
  - Verified live SSH connection from local workstation:
    ```bash
    ssh -i ~/Downloads/skilio-key.pem ubuntu@16.192.59.166
    # Hostname: ip-172-31-5-109 | RAM: 1.9 GiB | Disk: 29 GiB (Status: Online 24/7)
    ```
- [x] **Step 1.4: Domain Name & DNS Configuration (`skilio.works`)**
  - Target production domain: **`skilio.works`** (registered via Name.com).
  - Configured DNS **A Records**:
    - `@` $\rightarrow$ `16.192.59.166` (Apex domain: `https://skilio.works`)
    - `*` $\rightarrow$ `16.192.59.166` (Wildcard subdomains: `api.skilio.works`, `status.skilio.works`, `grafana.skilio.works`)

---

### Phase 2: Automated Server Bootstrap & OS Hardening (COMPLETED ✅)
**Goal**: Create a reproducible 1-command bootstrap script to prepare any fresh Ubuntu server for production and execute it against AWS.

- [x] **Step 2.1: Automated Idempotent Bootstrap Script (`devops/scripts/server-init.sh`)**
  - **Script Architecture**:
    - Built with strict shell safety: `set -euo pipefail` (aborts on errors, unset variables, or pipe failures).
    - Auto-elevation: Automatically re-executes with `sudo` if invoked by an unprivileged user.
    - Idempotency: Every step checks existing filesystem and service state before performing modifications, allowing safe repeated runs without side effects.
  - **Base System & Package Hardening**:
    - Suppressed interactive package manager dialogs: `export DEBIAN_FRONTEND=noninteractive`.
    - Updated package indexes: `apt-get update -y`.
    - Installed minimal host dependencies with `--no-install-recommends` to prevent operating system bloat:
      - `ca-certificates`: Enables secure TLS/HTTPS trust verification.
      - `curl`: Command-line HTTP utility.
      - `git`: Source version control tool.
      - `ufw`: Host firewall utility installed for layered defense-in-depth.
  - **1-Command Makefile Integration**:
    - Wired script execution to the project Makefile:
      ```bash
      make server-init
      # Under the hood: ssh -i $(SSH_KEY) ubuntu@$(SERVER_IP) 'sudo bash -s' < devops/scripts/server-init.sh
      ```
    - Streams remote standard output and errors in real-time to the developer workstation.

- [x] **Step 2.2: Memory Architecture & 2 GB Swap Safety Allocation**
  - **Swap Creation & Security Locking**:
    - Allocated contiguous 2 GB block on the NVMe SSD: `fallocate -l 2G /swapfile`.
    - Hardened filesystem permissions: `chmod 600 /swapfile` (strictly restricts read/write permissions to `root`, preventing unprivileged users from reading memory dumps containing passwords, tokens, or private keys).
    - Formatted and brought online: `mkswap /swapfile && swapon /swapfile`.
  - **Reboot Persistence & Kernel Memory Tuning**:
    - Persisted swap mount across system reboots by safely appending `/swapfile none swap sw 0 0` to `/etc/fstab` (guarded by an existence `grep` check).
    - Tuned Linux virtual memory swappiness from aggressive default (`60`) to `10`:
      - Applied immediately to running kernel: `sysctl vm.swappiness=10`.
      - Persisted permanently across reboots in `/etc/sysctl.conf`.
      - *Technical rationale*: Swappiness of 10 instructs the Linux kernel to prioritize fast physical RAM and only page out inactive memory to the SSD swap file during extreme memory pressure (>90% RAM utilization).
  - **42 Evaluation Defense & Architectural Rationale**:
    - Our AWS `t3.small` server has 2.0 GiB physical RAM. Normal container runtime uses ~1.0 GiB. However, compiling the Vite frontend (`npm run build`) or compiling native dependencies momentarily spikes memory to ~2.5 GiB.
    - Without Swap, the Linux kernel Out-Of-Memory (OOM) Killer terminates processes with `Exit Code 137`. The 2 GB swap creates a total addressable virtual memory pool of **4.0 GiB**, guaranteeing zero OOM build failures.

- [x] **Step 2.3: Native Container Runtime Installation (Docker & Compose v2)**
  - **Native Ubuntu 24.04 Repository Deployment**:
    - Used Ubuntu's official repositories to install clean, fully-supported container packages without external third-party repository dependencies:
      - `docker.io` $\rightarrow$ Docker Engine **v29.1.3**
      - `docker-compose-v2` $\rightarrow$ Docker Compose plugin **v2.40.3**
      - `containerd` $\rightarrow$ Container runtime **v2.2.1**
      - `runc` $\rightarrow$ OCI runtime **v1.3.4**
    - Enabled and started daemon in a single atomic systemd command: `systemctl enable --now docker`.

- [x] **Step 2.4: Least-Privilege Permissions & Application Directory Setup**
  - **Non-Root Docker Execution**:
    - Dynamically extracted real human caller from `$SUDO_USER` (falling back to `ubuntu`): `TARGET_USER="${SUDO_USER:-ubuntu}"`.
    - Added user `ubuntu` to system group `docker`: `usermod -aG docker ubuntu`.
    - Allows developer and automated CI/CD SSH pipelines to execute `docker` and `docker compose` commands without requiring `sudo` or password prompts.
  - **Production Application Directory (`/opt/skilio`)**:
    - Created standard Filesystem Hierarchy Standard (FHS) application directory: `mkdir -p /opt/skilio`.
    - Transferred recursive ownership to the deploy user: `chown -R ubuntu:ubuntu /opt/skilio`.
    - Secured directory mode: `chmod 755 /opt/skilio` (owner has read/write/execute; public/services have read/execute).

- [x] **Step 2.5: Live Remote Verification Drill**
  - Executed automated post-flight verification directly on AWS instance `16.192.59.166`:
    ```bash
    # 1. Verify Memory & Active Swap Space
    free -h
    # Output: Mem: 1.9 GiB (476 MiB used) | Swap: 2.0 GiB (0 B used, 2.0 GiB free)
    swapon --show
    # Output: /swapfile  file  2G  0B  -2 (Active)

    # 2. Verify Application Directory Permissions
    ls -ld /opt/skilio
    # Output: drwxr-xr-x 2 ubuntu ubuntu 4096 Oct 9 16:59 /opt/skilio

    # 3. Verify Non-Root Docker Access
    docker ps
    # Output: CONTAINER ID  IMAGE  COMMAND  CREATED  STATUS  PORTS  NAMES (Exit Code: 0)

    # 4. Verify Installed Versions
    docker --version          # Docker version 29.1.3, build 29.1.3-0ubuntu3~24.04.2
    docker compose version    # Docker Compose version 2.40.3+ds1-0ubuntu1~24.04.1
    ```
  - **Result**: Server bootstrap completed with 100% success. Host is fully prepared for containerized application deployment.

---

### Phase 3: Production Docker Ingress & SSL Automation (COMPLETED ✅)
**Goal**: Configure Traefik 3.6 to automatically handle HTTPS termination, certificate issuance, and domain routing with zero manual maintenance.

- [x] **Step 3.1: Public DNS Wildcard Architecture & Domain Strategy (`sslip.io` & `skilio.works`)**
  - **What We Did**:
    - Leveraged wildcard DNS (`16.192.59.166.sslip.io`) for initial staging, then secured and configured the official custom production domain **`skilio.works`** mapped to AWS Elastic IP (`16.192.59.166`).
  - **Why We Did It (Problem & Rationale)**:
    - *The Staging Strategy*: While finalizing domain registration for `skilio.works`, we needed immediate SSL automation without waiting for DNS propagation.
    - *The Challenge*: Let's Encrypt Certificate Authority strictly refuses to issue SSL/TLS certificates directly to bare IP addresses (e.g., `https://16.192.59.166`), requiring fully qualified domain names (FQDN).
    - *The Solution*: `sslip.io` provided zero-configuration public DNS for bootstrap testing. Then, registering `skilio.works` on Name.com with `@` and `*` A-records provided our permanent branded production domain.
    - *Portability*: Zero vendor lock-in. Because our architecture abstracts the domain via `${DOMAIN}`, switching from `sslip.io` staging to `skilio.works` required only updating `DOMAIN=skilio.works` in `/opt/skilio/.env` without touching any application code.
  - **How We Did It**:
    - Verified DNS A-record resolution:
      ```bash
      dig skilio.works +short
      # Output: 16.192.59.166
      ```

- [x] **Step 3.2: Production Docker Ingress Hardening (`compose.deploy.yml`)**
  - **What We Did**:
    - Polished and hardened [compose.deploy.yml](file:///home/aysadeq/Desktop/Freelancer/compose.deploy.yml) for Traefik 3.6 edge routing, automated ACME TLS certificate generation, and monitoring ingress.
  - **Why We Did It (Architectural & Security Rationale)**:
    - *Enforced HTTPS*: Plaintext HTTP (Port 80) transmits credentials, session tokens, and personal data in cleartext vulnerable to man-in-the-middle (MITM) inspection. Traefik automatically redirects all Port 80 traffic to Port 443 with an `HTTP 308 Permanent Redirect`.
    - *Automated Zero-Touch SSL*: Manual certificate issuance and renewal via certbot creates operational friction. Traefik natively solves the ACME HTTP-01 challenge with Let's Encrypt and automatically triggers renewal 30 days prior to expiration without downtime.
    - *CA Compliance*: Passing `--certificatesresolvers.le.acme.email=${ACME_EMAIL:?Variable not set}` satisfies Let's Encrypt terms of service and ensures alerts for rate limits or renewal issues are received.
    - *Monitoring Accessibility*: Added dedicated Traefik router labels for Grafana at `https://grafana.${DOMAIN}` so 42 evaluators can visually inspect live Prometheus server telemetry, memory usage, and container health.
  - **How We Did It**:
    - Configured Traefik entrypoints and routers:
      ```yaml
      # Global HTTP -> HTTPS Redirection
      - --entrypoints.web.address=:80
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      - --entrypoints.websecure.address=:443

      # Let's Encrypt Automated ACME Challenge
      - --certificatesresolvers.le.acme.httpchallenge=true
      - --certificatesresolvers.le.acme.httpchallenge.entrypoint=web
      - --certificatesresolvers.le.acme.email=${ACME_EMAIL:?Variable not set}
      - --certificatesresolvers.le.acme.storage=/certificates/acme.json

      # Persistent Volume Mount
      volumes:
        - traefik-certificates:/certificates
      ```
    - Added Grafana routing labels:
      ```yaml
      grafana:
        labels:
          - traefik.enable=true
          - traefik.http.routers.grafana.rule=Host(`grafana.${DOMAIN}`)
          - traefik.http.routers.grafana.entrypoints=websecure
          - traefik.http.routers.grafana.tls.certresolver=le
          - traefik.http.services.grafana.loadbalancer.server.port=3000
      ```

- [x] **Step 3.3: Connecting Traefik to Deep Diagnostic Health Check Probe**
  - **What We Did**:
    - Wired Traefik's internal backend service load balancer health check probe directly to `/api/v1/health`.
  - **Why We Did It**:
    - In our earlier Phase 0 implementation, we created a deep diagnostic health endpoint that tests real live database queries (`SELECT 1`), Redis ping-pong latency, and disk write capabilities.
    - Linking Traefik to `/api/v1/health` ensures Traefik only routes public user traffic to the backend container when the entire database and cache dependency chain is verified healthy.
  - **How We Did It**:
    - Added Traefik health check labels in [compose.deploy.yml](file:///home/aysadeq/Desktop/Freelancer/compose.deploy.yml):
      ```yaml
      - traefik.http.services.backend.loadbalancer.healthCheck.path=/api/v1/health
      - traefik.http.services.backend.loadbalancer.healthCheck.interval=10s
      - traefik.http.services.backend.loadbalancer.healthCheck.timeout=5s
      ```

- [x] **Step 3.4: Production Environment Isolation & Override Elimination**
  - **What We Did**:
    - Created [.env.production.example](file:///home/aysadeq/Desktop/Freelancer/.env.production.example), generated cryptographically secure keys on AWS, and strictly locked out local development overrides.
  - **Why We Did It (Critical Security Rationale)**:
    - *The Docker Compose Trap*: By default, Docker Compose automatically merges `compose.override.yml` whenever `docker compose up` is executed.
    - *The Vulnerability*: In local development, `compose.override.yml` exposes PostgreSQL directly to the host on port `5432:5432`, exposes Redis on port `6379:6379`, opens Traefik's insecure debug API on port `8090`, runs FastAPI in debug reload mode, and runs Mailpit. If merged in production, these debug ports would be directly exposed to the open internet.
    - *The Defense*: Setting `COMPOSE_FILE=compose.yml:compose.deploy.yml` in `/opt/skilio/.env` strictly restricts Docker Compose to load *only* those two files, isolating and nullifying `compose.override.yml`.
  - **How We Did It**:
    - Generated production environment on AWS (`/opt/skilio/.env`):
      ```bash
      # 1. Lock compose files to production
      COMPOSE_FILE=compose.yml:compose.deploy.yml
      DOMAIN=skilio.works
      ACME_EMAIL=admin@skilio.works

      # 2. Generate 256-bit cryptographic secrets
      SECRET_KEY=$(openssl rand -hex 32)
      FIRST_SUPERUSER_PASSWORD=$(openssl rand -hex 16)
      POSTGRES_PASSWORD=$(openssl rand -hex 16)
      ```
    - Hardened file permissions:
      ```bash
      chmod 600 /opt/skilio/.env
      # Strictly restricts read and write access to the ubuntu user only
      ```
    - Resolved FastAPI `Settings` validation requirement by populating non-empty environment variables for external OAuth and Cloudinary integrations.

- [x] **Step 3.5: Codebase Synchronization & Multi-Stage Production Build**
  - **What We Did**:
    - Synced repository code to `/opt/skilio/` on AWS and compiled production containers (`docker compose build`).
  - **Why We Did It**:
    - Multi-stage builds compile frontend assets into static files and eliminate bulky compilers (Node, Bun, build-essential) from the final runtime container, drastically reducing container size and attack surface.
    - Addressed build blockers:
      - Merged upstream commit `a8a025b` from `origin/master` which resolved a TypeScript compiler error (`TS6133: unused variable`).
      - Verified that physical RAM + 2 GB Swap allocated in Phase 2 handled memory spikes cleanly during `bun run build`.
  - **How We Did It**:
    - Synced code cleanly via `rsync`:
      ```bash
      rsync -avz --exclude '.git' --exclude 'node_modules' --exclude '.venv' \
        --exclude '__pycache__' --exclude '.env' \
        -e "ssh -i ~/Downloads/skilio-key.pem" \
        ./ ubuntu@16.192.59.166:/opt/skilio/
      ```
    - Compiled images on the remote host:
      ```bash
      cd /opt/skilio && docker compose build
      # Frontend SPA compiled with Bun -> backend serves static bundle at /
      # Backend UV package manager resolved Python dependencies with bytecode caching
      ```

- [x] **Step 3.6: Database Migration & Initial Administrator Provisioning**
  - **What We Did**:
    - Executed all 26 database migrations against PostgreSQL 18 and created initial superuser `admin@skilio.works`.
  - **Why We Did It**:
    - A production application cannot start until its relational database tables, relationships, and schema constraints exist.
    - Automating migrations through the containerized prestart script guarantees identical schema states between development and production.
  - **How We Did It**:
    - Ran migration and seeding script:
      ```bash
      docker compose run --rm backend bash scripts/prestart.sh
      ```
    - Output verified:
      ```text
      INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
      INFO  [alembic.runtime.migration] Will assume transactional DDL.
      INFO  [alembic.runtime.migration] Running upgrade  -> 1a229104b377, Initial migration
      ...
      INFO  [alembic.runtime.migration] Running upgrade e8c9d0a1b2c3 -> 9d1234ef5678, ...
      INFO: Initial superuser created successfully: admin@skilio.works
      ```

- [x] **Step 3.7: Production Stack Launch & Live Multi-Tier Verification Drill**
  - **What We Did**:
    - Started all 10 production containers in detached mode (`docker compose up -d`) and performed comprehensive live curl tests across all entrypoints.
  - **How We Did It & Verification Output**:
    - Started services:
      ```bash
      docker compose up -d
      docker compose ps
      ```
  - **Official Production Domain (`skilio.works`) Verification**:
    - Registered custom production domain `skilio.works` via Name.com and pointed A-records (`@` and `*`) to AWS Elastic IP `16.192.59.166`.
    - Updated `/opt/skilio/.env` with `DOMAIN=skilio.works`.
    - Inspected Let's Encrypt certificate issuance:
      ```bash
      docker compose exec proxy cat /certificates/acme.json | jq '.le.Certificates[].domain'
      # Output:
      # {"main": "grafana.skilio.works"}
      # {"main": "skilio.works"}
      # {"main": "16.192.59.166.sslip.io"}
      # {"main": "grafana.16.192.59.166.sslip.io"}
      ```
    - **Live Custom Domain Verification**:
      ```bash
      # 1. Main Web Application on Official Domain
      curl -sI https://skilio.works
      # Output: HTTP/2 200 OK (server: uvicorn, TLS 1.3 Padlock)

      # 2. HTTP to HTTPS 308 Redirection on Official Domain
      curl -sI http://skilio.works
      # Output: HTTP/1.1 308 Permanent Redirect -> Location: https://skilio.works/

      # 3. Live Diagnostic Health Endpoint on Official Domain
      curl -s https://skilio.works/api/v1/health
      # Output: {"status":"healthy","services":{"database":{"status":"healthy","latency_ms":0.8},"cache":{"status":"healthy","latency_ms":0.4},"storage":{"status":"healthy"}}}

      # 4. Live Grafana Monitoring on Official Subdomain
      curl -sI https://grafana.skilio.works
      # Output: HTTP/2 302 -> Location: /login
      ```
  - **Result**: Phase 3 is 100% operational on the official domain **`skilio.works`**! The Skilio application is live on the public internet over encrypted HTTPS, with automated Let's Encrypt SSL management, deep health diagnostic monitoring, and isolated production credentials.

---

### Phase 4: Automated CI/CD Pipeline (GitHub Actions)
**Goal**: Build a zero-touch delivery pipeline that tests, builds, and deploys code on merge to `master`.

- [x] **Step 4.1: Engineer & Harden the 3-Tier Automated CI Quality Gate**
  - **What We Engineered**:
    - Replaced buggy, legacy template workflows with a clean, high-performance **3-Tier CI Pipeline**:
      1. **`lint.yml` (Layer 1: Static Analysis & Compilation, ~8s)**:
         - **Python Backend**: Fast AST syntax checks via `uv run ruff check --select E9,F63,F7,F82 backend/` to catch fatal syntax, control flow, and undefined variable errors without failing on cosmetic issues.
         - **Frontend**: Full type-checking and bundle compilation via `bun run build` (`tsc -p tsconfig.build.json && vite build`).
         - **Optimizations**: `paths-ignore: ['docs/**', '*.md']` and concurrency control with `cancel-in-progress: true`.
      2. **`test-backend.yml` (Layer 2: Integration Testing & Coverage Gate, ~1m)**:
         - Spins up dedicated PostgreSQL 18 and Mailpit containers inside GitHub Actions.
         - Executes database migrations (`uv run bash scripts/prestart.sh`).
         - Runs all **173 Pytest tests** with coverage tracking (`pytest-cov`).
         - Strictly enforces minimum **70% test coverage** (our project achieves **83%**).
         - Uploads interactive HTML coverage report as a downloadable artifact.
         - Filtered with `paths:` targeting `backend/**`, `compose.yml`, and workflow file.
      3. **`test-docker-compose.yml` (Layer 3: Container Build & Smoke Test, ~3m)**:
         - Validates production multi-stage Docker build (`docker compose build`).
         - Runs containerized migrations (`docker compose run --rm backend bash scripts/prestart.sh`).
         - Boots backend application stack in detached mode (`docker compose up -d --wait backend`).
         - Performs automated HTTP smoke checks with retries (`curl -f --retry 5 http://localhost:8000/api/v1/utils/health-check/`).
         - Verifies root frontend web serving (`curl -f --retry 5 http://localhost:8000`).
         - Tears down containers with `if: always()` to ensure clean runner termination.
  - **Repository & Security Hardening**:
    - Deleted obsolete `pre-commit.yml` and `.pre-commit-config.yaml` to eliminate dead configuration.
    - Fixed Pydantic validation requirement for OAuth settings by adding defaults (`LINKEDIN_CLIENT_ID: str = ""`) and clean placeholders in `.env.example`.
    - Mocked external Cloudinary network calls in `test_claudinary.py` so unit tests execute deterministically without leaking external API calls.
  - **Verdict**: Our CI (Continuous Integration) is 100% complete, hardened, and verified with all checks green on PRs. Authored complete team collaboration standard in [docs/git-workflow.md](file:///home/aysadeq/Desktop/Freelancer/docs/git-workflow.md). Ready to engineer **Phase 4: CD (Continuous Deployment)**.

- [x] **Step 4.2: Configure GitHub Actions Secrets**
  - **What We Configured**:
    - Stored deployment credentials securely in GitHub Repository Settings (`Settings` $\rightarrow$ `Secrets and variables` $\rightarrow$ `Actions`):
      - `SERVER_HOST`: `16.192.59.166` (or `skilio.works`).
      - `SERVER_USER`: `ubuntu`.
      - `SERVER_SSH_KEY`: Full contents of the private RSA key (`skilio-key.pem`).
  - **Why We Configured It**:
    - Zero-touch deployment requires the CI/CD runner to authenticate to AWS EC2 over SSH. Storing keys as GitHub encrypted secrets ensures credentials are injected into runtime memory without ever appearing in Git history or pipeline logs (automatically masked with `***`).

- [x] **Step 4.3: Engineer the Zero-Touch Delivery Workflow (`.github/workflows/deploy.yml`)**
  - **Trigger**: Runs automatically on `push` to `master` (when PRs pass all CI checks and are merged).
  - **Concurrency Protection**:
    - Configured `concurrency: group: production-deployment, cancel-in-progress: false` to ensure production deployments are strictly sequential and never canceled halfway through database migrations.
  - **CD Pipeline Stages on AWS (`16.192.59.166`)**:
    1. **Secure SSH Handshake**: Injects `SERVER_SSH_KEY` into temporary runner keypair and scans host key with `ssh-keyscan`.
    2. **Idempotent Code Sync via `rsync`**:
       - Instead of storing GitHub PATs on the server for `git pull`, the runner uses `rsync -avz --delete` over SSH.
       - Strictly excludes `.git*`, `.env*`, `node_modules`, `.venv`, and `devops/backup/dumps/` to protect live production environment variables, TLS certificates, and database backups.
    3. **Multi-Stage Container Build**:
       `docker compose -f compose.yml -f compose.deploy.yml build`
       *(Leverages 2 GB Swap allocated in Phase 2 for zero-OOM compilation)*.
    4. **Database Migration Execution**:
       `docker compose -f compose.yml -f compose.deploy.yml run --rm backend bash scripts/prestart.sh`
       *(Applies pending Alembic schema migrations and verifies superuser)*.
    5. **Zero-Downtime Rolling Swap**:
       `docker compose -f compose.yml -f compose.deploy.yml up -d --remove-orphans`
       *(Old containers finish in-flight requests while new containers pass Traefik health checks)*.
    6. **Automated Layer Pruning**:
       `docker image prune -f`
       *(Purges dangling image layers post-deploy, safeguarding the EBS root disk from ENOSPC exhaustion)*.

- [x] **Step 4.4: Resilient Production Health Smoke Test**
  - Pipeline executes post-deploy verification query with connection retry logic against our live domain:
    ```bash
    curl --retry 6 --retry-delay 5 --retry-connrefused -f -s https://skilio.works/api/v1/health | grep '"status":"healthy"'
    ```
  - *Reliability rationale*: Prevents false-negative pipeline failures during the 3–5 second container warm-up window and confirms zero-downtime deployment succeeded.
  - *Verification*: Verified live in multiple GitHub Actions runs on merge to `master`.

---

### Phase 5: Developer Tooling & Remote Management CLI (COMPLETED ✅)
**Goal**: Integrate production management commands into the local `Makefile`.

- [x] **Step 5.1: Add Remote Management Targets in [`Makefile`](file:///home/aysadeq/Desktop/Freelancer/Makefile)**
  - `make deploy-ssh`: Opens instant interactive SSH terminal into AWS EC2 server.
  - `make deploy-status`: Inspects live container status and resource usage on the cloud server (`docker compose ps` & `docker stats --no-stream`).
  - `make deploy-logs`: Streams real-time remote production logs directly to local terminal via SSH (`docker compose logs -f`).
  - `make deploy-restart`: Restarts production containers on AWS (with optional `SERVICE=backend`).
  - `make deploy-db-clean`: Drops and re-migrates PostgreSQL database safely (preserves Let's Encrypt SSL certs).
  - `make deploy-db-seed`: Populates production database with mock accounts (`make deploy-db-seed COUNT=20`).
- [x] **Step 5.2: Verification & Dry-Run**
  - All targets tested and verified live from the local developer terminal.

---

### Phase 6: Documentation & 42 Evaluation Defence Playbook (COMPLETED ✅)
**Goal**: Document the module according to Section `IV.10` and prepare a live evaluation presentation.

- [x] **Step 6.1: Create `devops/docs/DEPLOYMENT.md`**
  - Authored comprehensive production documentation answering the 4 mandatory subject criteria.
  - Full architecture diagrams, security model, and disaster recovery on cloud storage.
  - Detailed justification for Option A (Build-on-Server + Swap) vs Option B (Registry) trade-off.
- [x] **Step 6.2: Prepare 3-Minute Live Evaluation Script**
  - Prepared complete step-by-step presentation order in [`presentation_plan.md`](file:///home/aysadeq/Desktop/Freelancer/devops/docs/presentation_plan.md) and [`DEPLOYMENT.md`](file:///home/aysadeq/Desktop/Freelancer/devops/docs/DEPLOYMENT.md).
  - Walkthrough: Live SaaS Hook $\rightarrow$ Docker Security $\rightarrow$ 3-Tier CI Gate $\rightarrow$ Zero-Downtime CD $\rightarrow$ Observability & Health $\rightarrow$ Developer CLI Tooling.


---

## 4. Timeline & Milestones Summary

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     PHASE 1     │ ──▶ │    PHASES 2 & 3 │ ──▶ │     PHASE 4     │ ──▶ │   PHASES 5 & 6  │
│ Server & Domain │     │ Bootstrap & SSL │     │ CI/CD Pipeline  │     │ Makefile & Docs │
│   (30 mins)     │     │   (45 mins)     │     │   (45 mins)     │     │   (30 mins)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

Total estimated implementation time: **~2.5 hours**.
