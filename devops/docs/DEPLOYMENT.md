# 🚀 Production Cloud Deployment & Automated Zero-Touch CI/CD
### 42 Evaluation Module: **IV.10 Module of Choice (Major — 2 Points)**

> **Project:** Skilio Marketplace Platform (`ft_transcendence` v21.2)  
> **DevOps Lead:** Aysadeq  
> **Repository:** [`Skilio-org/Skilio`](https://github.com/Skilio-org/Skilio)  
> **Live Website:** [https://skilio.works](https://skilio.works)  
> **Server IP:** `16.192.59.166` (AWS EC2 `t3.small` • Ubuntu 24.04 LTS)

---

## 1. 42 Subject Justification

According to the 42 subject (`en.subject.pdf`, page 20), a Major Module of Choice must provide justification for these 4 questions:

| Subject Question | Plain English Explanation |
| :--- | :--- |
| **1. Why did you choose this module?** | We wanted Skilio to be a real, live website on the internet that anyone can open from their phone or laptop, rather than an application that only runs locally on `localhost`. |
| **2. What technical challenges does it address?** | • Provisioning and securing an enterprise Linux cloud server on AWS.<br>• Configuring automated HTTPS with Let's Encrypt certificates.<br>• Building an automated 3-tier testing and deployment pipeline using GitHub Actions.<br>• Running 10 Docker containers reliably on a budget 2GB server using a 2GB Swap buffer. |
| **3. How does it add value to the project?** | It eliminates the *"it works on my machine"* problem. Every Pull Request is automatically tested, and code merged to `master` deploys to production in under 2 minutes with zero downtime. |
| **4. Why does it deserve Major (2 Points) status?** | It integrates the **3 core pillars of real-world production engineering**: Cloud Infrastructure (AWS), Ingress & SSL (Traefik), and Automated Continuous Delivery (CI/CD). |

---

## 2. Master System Architecture

```text
 ┌────────────────────────┐      git push (PR / merge)      ┌────────────────────────────────────────┐
 │  DEVELOPER WORKSTATION │ ──────────────────────────────▶ │  1. GITHUB ACTIONS 3-TIER CI PIPELINE  │
 │  (Feature Development) │                                 │     • Ruff Python Syntax Check         │
 └────────────────────────┘                                 │     • Bun Vite TypeScript Compiler     │
                                                            │     • 173 Pytest Tests (83% Coverage)  │
                                                            │     • Docker Stack Build & Smoke Test  │
                                                            └───────────────────┬────────────────────┘
                                                                                │ All tests pass
                                                                                │ Merged to master
                                                                                ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   2. AWS EC2 PRODUCTION SERVER                                    │
 │                                                                                                   │
 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                            Cloud Firewall (AWS Security Group)                              │  │
 │  │        Port 22 (SSH RSA Key)  •  Port 80 (HTTP Redirect)  •  Port 443 (HTTPS Web Traffic)    │  │
 │  │             [Database (5432) & Redis (6379) strictly hidden from the public internet]       │  │
 │  └─────────────────────────────────────────────┬───────────────────────────────────────────────┘  │
 │                                                │                                                  │
 │                                                ▼                                                  │
 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                             Traefik 3.6 Cloud Ingress (Reverse Proxy)                       │  │
 │  │          • Listens directly to Docker socket to detect running containers                   │  │
 │  │          • Automatically requests & renews Let's Encrypt TLS 1.3 certificates               │  │
 │  │          • Forces all HTTP traffic (Port 80) to redirect to encrypted HTTPS (Port 443)       │  │
 │  └─────────────────────────────────────────────┬───────────────────────────────────────────────┘  │
 │                                                │                                                  │
 │                                                ▼                                                  │
 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                              Docker Compose Application Stack                               │  │
 │  │                                                                                             │  │
 │  │   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌───────────────────┐   │  │
 │  │   │     FastAPI + React       │    │     PostgreSQL 18 DB      │    │      Redis 8      │   │  │
 │  │   │     (Skilio Web App)      │◀──▶│   + Automated Backups     │◀──▶│  Cache & Real-Time│   │  │
 │  │   │      Port 8000 (Internal) │    │   Port 5432 (Internal)    │    │  Port 6379 (Int.) │   │  │
 │  │   └───────────────────────────┘    └───────────────────────────┘    └───────────────────┘   │  │
 │  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pillar 1: Cloud Infrastructure & Automated Server Setup (AWS IaaS)

We provisioned a dedicated cloud virtual machine on Amazon Web Services (AWS) Europe to host our production environment.

### Key Architecture Features
* **Virtual Machine (AWS EC2 `t3.small`):** 2 virtual CPUs and 2.0 GiB of physical RAM.
* **Static Elastic IP (`16.192.59.166`):** A permanent public IPv4 address attached to our server so our domain name (`skilio.works`) never breaks across server restarts.
* **2GB Swap Memory (`vm.swappiness=10`):** Compiling our React frontend bundle spikes memory usage. The 2GB swap file acts as a memory safety buffer, preventing Linux Out-Of-Memory (OOM) crashes (`Exit Code 137`).
* **Least-Privilege Firewall (VPC Security Group):**
  * **Open to Public:** Port 22 (SSH RSA key only; passwords disabled), Port 80 (HTTP), Port 443 (HTTPS).
  * **Blocked from Public:** PostgreSQL (5432) and Redis (6379) are completely inaccessible from the outside world.
* **Automated Idempotent Setup ([`server-init.sh`](../scripts/server-init.sh)):** A single automated bootstrap script that sets up Docker, creates the 2GB swap, and configures permissions safely without human error.

> 📖 **Deep Dive Technical Guide:**  
> For full command breakdowns, Linux memory management theory, and SSH security details, read:  
> 👉 **[guides/02_cloud_server_&_auto_setup.md](guides/02_cloud_server_&_auto_setup.md)**

---

## 4. Pillar 2: Cloud Ingress, Reverse Proxy & Automated HTTPS (Traefik 3.6)

Rather than using traditional web servers like Nginx, we use **Traefik 3.6** as our cloud reverse proxy and ingress controller.

### Key Architecture Features
* **Docker Socket Discovery:** Traefik listens directly to the Docker engine (`/var/run/docker.sock`). When a container starts with routing labels, Traefik routes traffic to it automatically without needing manual configuration files or server restarts.
* **Automated Let's Encrypt TLS 1.3:** Traefik automatically proves domain ownership through the ACME TLS-ALPN challenge, issues free trusted SSL/TLS certificates, and auto-renews them every 60 days.
* **Mandatory HTTPS Enforcement:** Any visitor opening `http://skilio.works` (Port 80) is automatically redirected via **HTTP 308** to secure `https://skilio.works` (Port 443).
* **Zero Console Errors:** Satisfies 42 subject Section III mandatory rules requiring HTTPS encryption and clean browser console execution.

> 📖 **Deep Dive Technical Guide:**  
> For Traefik routing labels, ACME handshake mechanics, and Nginx comparison, read:  
> 👉 **[guides/03_ingress_reverse_proxy_https.md](guides/03_ingress_reverse_proxy_https.md)**

---

## 5. Pillar 3: Zero-Touch CI/CD Delivery Pipeline ([`ci-cd.yml`](../../.github/workflows/ci-cd.yml))

We implemented a complete automated testing and delivery pipeline using **GitHub Actions** and **SSH automation**.

### 1. The 3-Tier CI Testing Gate
Before any code can merge into `master`, 4 parallel testing jobs must pass:
1. **Tier 1 (Static Quality):** `ruff` scans Python code for syntax and import bugs; `bun` type-checks and compiles React TypeScript.
2. **Tier 2 (Integration Suite):** Starts temporary Postgres and Mailpit containers, running **173 automated tests** with `pytest`. Enforces a strict **70% code coverage rule** (our backend reaches **83%**).
3. **Tier 3 (Docker Smoke Test):** Builds the full production container image on a clean runner, boots the stack, and probes [`devops/scripts/check-health.sh`](../scripts/check-health.sh).

### 2. Zero-Touch CD & Zero-Downtime Swap ([`deploy.sh`](../scripts/deploy.sh))
When code merges into `master`, deployment happens in under 2 minutes:
1. **Secure Transport (`rsync`):** Connects to AWS via SSH, uploading only changed files in seconds. Production `.env` secrets and database backups are strictly excluded and protected.
2. **Ephemeral Migration Gate:** Runs database migrations inside a temporary worker container (`scripts/prestart.sh`). If migrations fail, the script aborts immediately and the live site is untouched.
3. **Zero-Downtime Swap (`--wait`):** Docker builds the new container in the background while the old container continues serving active visitors. Traefik switches visitors only after the new container passes health checks.
4. **Storage Hygiene (`docker image prune -f`):** Deletes untagged old image layers after every build, preventing the SSD from filling up.

> 📖 **Deep Dive Technical Guide:**  
> For runner lifecycle, Directed Acyclic Graphs (DAG), `rsync` delta algorithms, and zero-downtime mechanics, read:  
> 👉 **[guides/04_CI-CD_pipeline.md](guides/04_CI-CD_pipeline.md)**

---

## 6. The 3 Pillars at a Glance (Architecture Summary)

| Pillar | Technology | Core Responsibility | Deep Dive Reference |
| :--- | :--- | :--- | :--- |
| **Pillar 1: Infrastructure** | AWS EC2 • Ubuntu 24.04 • Swap | Cloud compute, static Elastic IP, memory buffer, firewall isolation | [02_cloud_server_&_auto_setup.md](guides/02_cloud_server_&_auto_setup.md) |
| **Pillar 2: Ingress & TLS** | Traefik 3.6 • Let's Encrypt | Dynamic Docker routing, automated TLS 1.3 certificates, HTTPS redirect | [03_ingress_reverse_proxy_https.md](guides/03_ingress_reverse_proxy_https.md) |
| **Pillar 3: Automated CI/CD**| GitHub Actions • rsync • Docker | 3-tier testing gate, least-privilege SSH sync, zero-downtime container swap | [04_CI-CD_pipeline.md](guides/04_CI-CD_pipeline.md) |
