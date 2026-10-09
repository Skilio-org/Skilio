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
- [x] **Step 1.4: Domain Name & DNS Configuration (`skilio.tech`)**
  - Target production domain: **`skilio.tech`** (secured via GitHub Student Developer Pack).
  - Configured DNS **A Records**:
    - `@` $\rightarrow$ `16.192.59.166` (Apex domain: `https://skilio.tech`)
    - `*` $\rightarrow$ `16.192.59.166` (Wildcard subdomains: `api.skilio.tech`, `status.skilio.tech`, `grafana.skilio.tech`)

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

### Phase 3: Production Docker Ingress & SSL Automation
**Goal**: Configure Traefik 3.6 to automatically handle HTTPS termination, certificate issuance, and domain routing.

- [ ] **Step 3.1: Finalize Production Ingress (`compose.deploy.yml`)**
  - Review and align [`compose.deploy.yml`](file:///home/ayman/Desktop/Freelancer/compose.deploy.yml) with production parameters:
    - Traefik reverse proxy listening on ports 80 and 443 with automatic HTTP $\rightarrow$ HTTPS redirection.
    - Let's Encrypt TLS ACME challenge stored in persistent volume `traefik-certificates:/certificates/acme.json`.
    - **ACME Registration Compliance**: Configure Let's Encrypt contact email via `--certificatesresolvers.le.acme.email=${ACME_EMAIL:?Variable not set}` to receive automated renewal warnings and prevent CA throttles.
    - **Monitoring Ingress**: Add HTTPS routing for Grafana (`grafana.${DOMAIN}`) so evaluators can inspect live Prometheus/Grafana monitoring dashboards on the public domain.
- [ ] **Step 3.2: Connect Traefik to Health Check Probe**
  - Update Traefik backend load balancer service labels to route traffic based on our deep diagnostic probe:
    ```yaml
    - traefik.http.services.backend.loadbalancer.healthCheck.path=/api/v1/health
    - traefik.http.services.backend.loadbalancer.healthCheck.interval=10s
    - traefik.http.services.backend.loadbalancer.healthCheck.timeout=5s
    ```
- [ ] **Step 3.3: Production Environment File Setup & Override Isolation**
  - Create template `.env.production` containing production domains, database credentials, `ACME_EMAIL`, and secrets.
  - **Docker Compose Override Isolation**: Explicitly declare `COMPOSE_FILE=compose.yml:compose.deploy.yml` in `.env.production`.
    - *Security rationale*: By default, Docker Compose automatically merges `compose.override.yml`. Setting `COMPOSE_FILE` prevents local development overrides (insecure Traefik API on 8090, exposed DB port 5432, `fastapi dev` reload mode, and Mailpit) from leaking into production.

---

### Phase 4: Automated CI/CD Pipeline (GitHub Actions)
**Goal**: Build a zero-touch delivery pipeline that tests, builds, and deploys code on merge to `master`.

- [ ] **Step 4.1: Configure GitHub Actions Secrets**
  - Store deployment credentials securely in repository settings:
    - `SERVER_HOST`: Public IP or domain name.
    - `SERVER_USER`: Deployment username (e.g., `ubuntu`).
    - `SERVER_SSH_KEY`: Private SSH key matching the server's `authorized_keys`.
    - `PRODUCTION_ENV`: Base64-encoded production `.env` configuration.
- [ ] **Step 4.2: Build the Delivery Workflow (`.github/workflows/deploy.yml`)**
  - Pipeline stages:
    1. **Test Gate (CI)**:
       - Runs backend `pytest` suite.
       - Runs frontend typecheck (`bun run build`).
       - If any test fails, deployment immediately halts.
    2. **Deploy Trigger (CD)**:
       - Connects via secure SSH action (`appleboy/ssh-action` or native SSH).
       - Updates repository using clean reset:
         `git fetch origin master && git reset --hard origin/master`
         *(Guarantees clean sync and eliminates non-interactive merge conflicts)*.
       - Rebuilds modified containers:
         `docker compose build`
       - Runs database migrations:
         `docker compose run --rm backend bash scripts/prestart.sh`
       - Performs rolling container update:
         `docker compose up -d --remove-orphans`
       - **Disk Cleanup**: Executes `docker image prune -f` post-deploy to purge dangling layers and safeguard the small cloud EBS disk from `ENOSPC` exhaustion.
- [ ] **Step 4.3: Resilient Deployment Health Smoke Test**
  - Pipeline executes a post-deploy verification query with connection retry logic:
    ```bash
    curl --retry 6 --retry-delay 5 --retry-connrefused -f -s https://${DOMAIN}/api/v1/health | grep '"status":"healthy"'
    ```
  - *Reliability rationale*: Prevents false-negative 502/503 pipeline failures during the 3–5 second container warm-up window. Confirms zero-downtime deployment succeeded.

---

### Phase 5: Developer Tooling & Remote Management CLI
**Goal**: Integrate production management commands into the local `Makefile`.

- [ ] **Step 5.1: Add Remote Management Targets in [`Makefile`](file:///home/ayman/Desktop/Freelancer/Makefile)**
  - `make deploy`: Triggers manual deployment or reports latest deployed commit.
  - `make deploy-status`: Inspects live container status and resource usage on the cloud server (`docker compose ps` & `docker stats --no-stream`).
  - `make deploy-logs`: Streams real-time remote production logs directly to local terminal via SSH (`docker compose logs -f`).
- [ ] **Step 5.2: Verification & Dry-Run**
  - Test the entire pipeline with a minor commit and confirm automated delivery takes $< 2\text{ minutes}$.

---

### Phase 6: Documentation & 42 Evaluation Defence Playbook
**Goal**: Document the module according to Section `IV.10` and prepare a live evaluation presentation.

- [ ] **Step 6.1: Create `devops/DEPLOYMENT.md`**
  - Complete documentation answering the 4 mandatory subject criteria.
  - Full architecture explanation, security model, and disaster recovery on cloud storage.
  - Detailed justification for Option A (Build-on-Server + Swap) vs Option B (Registry) trade-off.
- [ ] **Step 6.2: Prepare 3-Minute Live Evaluation Script**
  - **Live Mobile Demo**: Hand evaluator a QR code to open `https://skilio.tech` on their phone.
  - **Live CI/CD Push Demo**: Push a small commit, watch GitHub Actions execute, and verify live cloud site updates automatically with zero downtime.

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
