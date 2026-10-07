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

### Phase 1: Cloud Server & Network Provisioning (IaaS)
**Goal**: Provision a secure Linux virtual server with a dedicated static IP and domain DNS routing.

- [ ] **Step 1.1: Server Provisioning**
  - Launch an Ubuntu 24.04 LTS instance (AWS EC2 Free Tier `t3.micro` / `t3.small` or DigitalOcean Droplet via Student Pack).
  - Allocate and attach a **Static Public IP** (Elastic IP) ensuring the server address never changes across reboots.
- [ ] **Step 1.2: Firewall & Network Security Group Hardening**
  - Inbound rules:
    - `Port 22` (SSH): Restricted to SSH Key authentication only (password authentication disabled in `sshd_config`).
    - `Port 80` (HTTP): Allowed for Let's Encrypt ACME challenges and automatic HTTPS redirection.
    - `Port 443` (HTTPS): Allowed for encrypted production traffic.
  - All database, cache, and internal ports (`5432`, `6379`, `8000`, `9090`) strictly blocked from the public internet.
- [ ] **Step 1.3: Domain Name & DNS Configuration**
  - Register/claim the free domain (`.tech` / `.me` from GitHub Student Developer Pack).
  - Configure DNS **A Records**:
    - `@` $\rightarrow$ `<SERVER_PUBLIC_IP>` (Apex domain: `skilio.tech`)
    - `*` $\rightarrow$ `<SERVER_PUBLIC_IP>` (Wildcard subdomains: `api.skilio.tech`, `status.skilio.tech`, `grafana.skilio.tech`)

---

### Phase 2: Automated Server Bootstrap & OS Hardening
**Goal**: Create a reproducible 1-command bootstrap script to prepare any fresh Ubuntu server for production.

- [ ] **Step 2.1: Server Bootstrap Script (`devops/scripts/server-init.sh`)**
  - Automates system package updates (`apt-get update && apt-get upgrade -y`).
  - Installs Docker Engine, Docker Compose v2 plugin, Git, `curl`, and `ufw`.
  - Configures non-root Docker execution: runs `sudo usermod -aG docker ubuntu` so the SSH CI/CD runner executes Docker commands seamlessly without requiring `sudo` or password prompts.
- [ ] **Step 2.2: Memory & Swap Allocation (Option A: Build-on-Server Architecture)**
  - Allocates and enables a **2 GB Linux Swap File** (`/swapfile`):
    - `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`
    - Persists swap across reboots in `/etc/fstab` (`/swapfile none swap sw 0 0`).
    - Optimizes kernel swappiness: sets `vm.swappiness=10` in `/etc/sysctl.conf`.
  - *Engineering rationale (Option A)*: Compiling the Vite frontend (`bun run build`) and compiling Python packages spikes memory to ~800 MB. Swap guarantees 100% build stability without triggering the Linux kernel OOM-Killer.
  - *Architectural Trade-Off Justification for 42 Defense*: Building directly on EC2 with Swap was chosen for this single-node infrastructure to eliminate external registry token management, package rate limits, and third-party dependencies while keeping deployment self-contained. (In a multi-node enterprise environment, building in CI and pushing to GHCR/ECR would be preferred).
- [ ] **Step 2.3: Application Directory & Permissions**
  - Sets up `/opt/skilio` directory with ownership assigned to `ubuntu:ubuntu`.
  - Clones repository or prepares git checkout structure.

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
