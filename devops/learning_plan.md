# 🧠 DevOps Cloud & CI/CD Master Learning Plan
### Module: **IV.10 Module of Choice (Major — 2 Points)**

**Goal:** Deep theoretical & practical mastery of all concepts used in the AWS Cloud Deployment & CI/CD Pipeline module .

---

## 🗺️ Learning Roadmap Overview

```text
 ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
 │     LEVEL 1      │ ──▶ │     LEVEL 2      │ ──▶ │     LEVEL 3      │ ──▶ │     LEVEL 4      │
 │ Cloud & Linux    │     │ DNS, Networking  │     │ Automated CI/CD  │     │ 42 Defense &     │
 │ Infrastructure   │     │ & Ingress (TLS)  │     │ & Zero-Downtime  │     │ Systems Bridge   │
 └──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Level 1: Cloud & Linux Infrastructure (IaaS & AWS)

### 1.0 Prerequisites: The Mental Shift (Localhost vs. Cloud Server)

Before working with the cloud, understand the fundamental shift from local development to production infrastructure:

* **The Localhost Reality (`127.0.0.1`)**:
  * Code runs on your laptop's CPU, RAM, and SSD.
  * Listens exclusively on the internal loopback interface (`127.0.0.1` / `localhost`). Nobody on the internet can reach it.
  * When your laptop lid closes or sleeps, all processes terminate.
* **The Server Reality**:
  * A server is an always-on (24/7) Linux computer in an enterprise datacenter with redundant power, cooling, and high-speed fiber internet.
  * It has **no monitor, keyboard, or mouse**: It is managed 100% remotely over the network via **SSH**.
* **The Postal Analogy (IP vs. Ports)**:
  * **IP Address** (`54.210.80.12`): The physical street address of the building. Directs packets across the global internet.
  * **Port**: The numbered apartment doors inside that building:
    * **Port 22**: Administrative entrance (SSH encrypted terminal).
    * **Port 80**: Public front door (Unencrypted HTTP web traffic).
    * **Port 443**: Secure revolving door (Encrypted HTTPS web traffic).
    * **Port 5432**: Internal vault (PostgreSQL database — never exposed publicly).

---

### 1.1 What is Cloud Computing & IaaS?

* **The Cloud Definition**:
  Computing power (CPU, RAM, storage, networking) delivered as an on-demand, metered utility over the internet—provisioned in seconds via API or web console rather than purchasing physical hardware.
* **The 3 Cloud Service Models (The Pyramid)**:

```text
 ┌────────────────────────────────────────────────────────┐
 │                          SaaS                          │  Software as a Service
 │             (Gmail, GitHub, Figma, Slack)              │  • End-user software.
 ├────────────────────────────────────────────────────────┤
 │                          PaaS                          │  Platform as a Service
 │               (Vercel, Render, Heroku)                 │  • Provider manages OS, Docker, & SSL.
 │                                                        │  • You only upload code.
 ├────────────────────────────────────────────────────────┤
 │                          IaaS                          │  Infrastructure as a Service
 │             (AWS EC2, Google Compute Engine)           │  • Provider provisions virtual hardware.
 │                                                        │  • YOU manage the OS, Docker, & Security.
 └────────────────────────────────────────────────────────┘
```

* **The AWS Shared Responsibility Model (IaaS)**:

| Layer | Responsible Entity | Scope & Responsibilities |
| :--- | :---: | :--- |
| **Datacenter Infrastructure** | **AWS** | Physical facility security, diesel generators, HVAC cooling, physical servers, fiber switches. |
| **Virtualization Hypervisor** | **AWS** | AWS Nitro System / KVM slicing physical motherboards into isolated virtual machines. |
| **Operating System** | **YOU** | Selecting Ubuntu 24.04 LTS, running `apt update`, patching Linux kernel vulnerabilities. |
| **Firewall & Ingress** | **YOU** | Configuring Security Groups to allow only ports 22, 80, 443 and drop private database ports. |
| **Runtime & Containers** | **YOU** | Installing Docker Engine, orchestrating Traefik reverse proxy, running PostgreSQL 18. |
| **Code & Application Data** | **YOU** | Deploying the Skilio codebase, managing database backups, securing user credentials. |

* **Why IaaS is Mandatory for 42 School Evaluation**:
  * *PaaS (Vercel/Render)*: Evaluators reject it as trivial because the platform automates OS, network routing, and certificates for you.
  * *IaaS (AWS EC2)*: Evaluators accept it as a **Major Module of Choice (2 Points)** because you personally engineer the entire infrastructure stack: hypervisor firewalls, Linux OS hardening, reverse proxies, and CI/CD pipelines.

---

### 1.2 AWS EC2 (Elastic Compute Cloud) & Virtualization

* **What EC2 Stands For**: **E**lastic **C**ompute **C**loud (1 E + 2 C's).
  * *Elastic*: Can be resized, stopped, restarted, or cloned in seconds.
  * *Compute*: Raw processing power (virtual CPU cores and RAM).
  * *Cloud*: Hosted in AWS global datacenters (e.g. Frankfurt, Paris, Ireland).

```text
 ┌────────────────────────────────────────────────────────┐
 │            PHYSICAL RACK SERVER IN AWS DATACENTER      │
 │          (e.g., 128 Physical CPU Cores, 512 GB RAM)    │
 ├────────────────────────────────────────────────────────┤
 │              THE HYPERVISOR (AWS Nitro / KVM)          │
 │    (Hardware virtualization that carves up resources)  │
 ├──────────────┬──────────────┬───────────┬──────────────┤
 │  VM 1 (EC2)  │  VM 2 (EC2)  │   ...     │  OUR EC2     │
 │ (Customer A) │ (Customer B) │           │ (t3.micro)   │
 │ Ubuntu 22.04 │ Debian 12    │           │ Ubuntu 24.04 │
 │ 4 vCPU, 8GB  │ 2 vCPU, 4GB  │           │ 2 vCPU, 1GB  │
 └──────────────┴──────────────┴───────────┴──────────────┘
```

* **Virtual Machine vs. Docker Container**:
  * **Virtual Machine (EC2)**: Virtualizes the **hardware layer**. Runs its own independent Linux kernel.
  * **Docker Container**: Virtualizes the **operating system / user space**. Multiple containers share the *same* host Linux kernel using Linux cgroups and namespaces.
  * *In our architecture*: We run our Docker containers *inside* our EC2 Virtual Machine.
* **Decoding EC2 Instance Sizing (`t3.micro`)**:
  * `t`: **Instance Family** — Burstable general-purpose compute.
  * `3`: **Generation** — 3rd generation hardware architecture (faster than `t2`).
  * `micro`: **Size** — 2 vCPUs, 1 GB of RAM (eligible for the 12-Month AWS Free Tier).
* **CPU Credits & Bursting**:
  * During idle periods, the instance accumulates **CPU credits**.
  * When handling user traffic spikes or compiling Docker images, the CPU consumes credits to burst to **100% of full clock speed**.
* **Compute vs. Persistent Storage (AWS EBS)**:
  * **EC2**: The processing brain (CPU + RAM).
  * **AWS EBS (Elastic Block Store)**: High-speed network-attached virtual SSD (30 GB Free Tier).
  * *Persistence*: Even if the EC2 instance is stopped or rebooted, the EBS volume retains 100% of data (PostgreSQL database, backup archives, Docker image cache).

---

### 1.3 AWS Networking: VPC, Elastic IPs, and Security Groups

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    AWS VPC (Virtual Private Cloud)                     │
 │                                                                        │
 │  ┌─────────────────────── Public Subnet ────────────────────────────┐  │
 │  │                                                                  │  │
 │  │  Internet Gateway (IGW) ──▶ [Elastic IP: 54.210.80.12] (Static)  │  │
 │  │                                    │                             │  │
 │  │                                    ▼                             │  │
 │  │                      ┌───────────────────────────┐               │  │
 │  │                      │   AWS Security Group      │               │  │
 │  │                      │   (Hypervisor Firewall)   │               │  │
 │  │                      │   • Port 22  (SSH)   [✔]  │               │  │
 │  │                      │   • Port 80  (HTTP)  [✔]  │               │  │
 │  │                      │   • Port 443 (HTTPS) [✔]  │               │  │
 │  │                      │   • Port 5432 (DB)   [✖]  │               │  │
 │  │                      └─────────────┬─────────────┘               │  │
 │  │                                    │                             │  │
 │  │                                    ▼                             │  │
 │  │                           [ EC2 Instance ]                       │  │
 │  │                       (Ubuntu 24.04 + Docker)                    │  │
 │  └──────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

* **VPC (Virtual Private Cloud) & Internet Gateway (IGW)**:
  * An isolated software-defined network dedicated to your AWS account.
  * The **Internet Gateway (IGW)** acts as the router connecting your VPC's public subnet to the internet.
* **Dynamic Public IP vs. Elastic IP (Static IP)**:
  * *Default Public IP*: Changes randomly whenever the EC2 instance stops and starts.
  * *Elastic IP (EIP)*: A permanent public IPv4 address allocated to your account that never changes across reboots. Mandatory so your domain's DNS `A Record` (`skilio.tech` $\rightarrow$ Elastic IP) remains permanently intact.
* **Security Groups (Stateful Hypervisor Firewall)**:
  * Operates at the AWS Nitro hypervisor layer **outside** the Linux OS.
  * Packets on blocked ports are dropped before they ever reach the server CPU or network card.
  * **Stateful Property**: Inbound connections automatically permit return response packets without opening high ephemeral ports.
* **Production Firewall Rule Matrix for Skilio**:

| Port | Protocol | Purpose | Source Allowed | Status |
| :---: | :---: | :--- | :--- | :---: |
| **`22`** | **TCP (SSH)** | Administrative terminal access & GitHub Actions deployment. | `0.0.0.0/0` (Key-pair only) | 🟢 **OPEN** |
| **`80`** | **TCP (HTTP)** | Let's Encrypt domain validation & 301 HTTPS redirection. | `0.0.0.0/0` (Anywhere) | 🟢 **OPEN** |
| **`443`** | **TCP (HTTPS)**| Production encrypted web traffic, REST APIs, & WebSockets. | `0.0.0.0/0` (Anywhere) | 🟢 **OPEN** |
| **`5432`**| **TCP (Postgres)** | Database engine (only reachable inside Docker network). | None (Blocked) | 🔴 **BLOCKED** |
| **`6379`**| **TCP (Redis)** | Cache & message broker. | None (Blocked) | 🔴 **BLOCKED** |
| **`8000`**| **TCP (FastAPI)**| Backend API service (only Traefik routes to this internally). | None (Blocked) | 🔴 **BLOCKED** |

---

### 1.4 Linux Memory Management & The 2 GB Swap File

* **The 1 GB RAM Ceiling Problem**:
  * Idle server baseline (Linux + Docker + Traefik + Postgres + Redis): $\approx 400\text{ MB}$.
  * Deployment build spike (Vite/Bun compilation `bun run build` + Docker image build layers): Spikes to **1.2 GB – 1.5 GB**.
* **The Linux OOM Killer (Out-Of-Memory Killer)**:
  * When memory allocation (`malloc()`) fails, the Linux kernel assigns an `oom_score` to processes and terminates the largest consumer with an unconditional **`SIGKILL` (Signal 9)**.
  * Build abruptly crashes with: `Process completed with exit code 137` ($128 + 9 = 137$).
* **The Solution: Virtual Memory Paging & Linux Swap**:
  * **Swap** acts as an emergency memory extension on the SSD (`/swapfile`).
  * *Paging Mechanism*: When RAM fills up, the Linux kernel writes inactive, "cold" memory pages (e.g., idle background processes) to disk (**Page Out**), freeing physical RAM for active compilation. When needed, data is paged back into RAM (**Page In**).
* **Automated Swap Setup on Ubuntu 24.04**:

```bash
# 1. Allocate 2 GB contiguous file on SSD
sudo fallocate -l 2G /swapfile

# 2. Restrict permissions (ONLY root can read swap to prevent in-memory credential leaks)
sudo chmod 600 /swapfile

# 3. Format as Linux Swap filesystem
sudo mkswap /swapfile

# 4. Activate swap
sudo swapon /swapfile

# 5. Persist across reboots in /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

* **Kernel Parameter `vm.swappiness=10`**:
  * Tuning `sysctl vm.swappiness=10` ensures Linux prioritizes ultra-fast physical RAM, only paging to SSD when memory usage exceeds $90\%$.

---

### 1.5 Asymmetric SSH Key Cryptography

* **Why Passwords are Dead in Production**:
  * Internet bots scan IP ranges 24/7 trying automated brute-force attacks on Port 22.
  * In our production server config (`/etc/ssh/sshd_config`), passwords are permanently disabled:
    ```text
    PasswordAuthentication no
    ```
* **Symmetric vs. Asymmetric Cryptography**:
  * *Symmetric*: Same shared secret encrypts and decrypts (if intercepted, security is broken).
  * *Asymmetric*: Two mathematically linked keys:
    * **Private Key (`skilio-key.pem`)**: Secret signature stored **only** on your local machine. Permissions set to `chmod 400`. Never transmitted over the network.
    * **Public Key (`skilio-key.pub`)**: Shared with the world. Stored on the server in `/home/ubuntu/.ssh/authorized_keys`.
* **The 4-Step Challenge-Response Handshake**:

```text
 ┌──────────────────────┐                           ┌──────────────────────┐
 │    YOUR LAPTOP       │                           │      AWS EC2         │
 │ (Has Private Key)    │                           │ (Has Public Key)     │
 └──────────┬───────────┘                           └──────────┬───────────┘
            │                                                  │
            │  1. "Hello, I want to log in as user 'ubuntu'"   │
            │ ───────────────────────────────────────────────▶ │
            │                                                  │
            │  2. Server generates random number (Nonce)       │
            │     and encrypts it with your Public Key         │
            │ ◀─────────────────────────────────────────────── │
            │                                                  │
            │  3. Laptop decrypts challenge with Private Key,  │
            │     signs it, and sends cryptographic proof back │
            │ ───────────────────────────────────────────────▶ │
            │                                                  │
            │  4. Server verifies signature with Public Key    │
            │     ✔ MATCH! Access Granted.                    │
            │ ◀─────────────────────────────────────────────── │
```

* **Why `chmod 400` is Enforced by OpenSSH**:
  * `chmod 400`: Read-only by the owner, 0 permissions for group and others.
  * If a private key is world-readable (`chmod 644` or `777`), OpenSSH aborts with:
    `WARNING: UNPROTECTED PRIVATE KEY FILE! Permissions 0644 are too open. Load key "skilio-key.pem": bad permissions`.
* **How CI/CD Uses This**:
  * The private key is stored inside **GitHub Repository Secrets** (`SERVER_SSH_KEY`).
  * On every merge to `master`, GitHub Actions loads the key into an ephemeral runner and executes the challenge-response handshake to deploy the platform with zero human intervention.

---

## Level 2: DNS, Networking, Ingress & Automated SSL/TLS (COMPLETED ✅)

### 2.1 How DNS (Domain Name System) Works

* **The Core Concept**: The Internet's Phonebook.
  * **Computers and routers** communicate exclusively via numerical IP addresses (`16.192.59.166`).
  * **Humans** navigate using human-friendly names (`skilio.tech`).
  * DNS is the globally distributed database that maps:
    $$\text{"skilio.tech"} \quad \xrightarrow{\text{DNS Lookup}} \quad \mathbf{16.192.59.166}$$

```text
 [Your Browser / Laptop]
          │
          ▼ (1. "Who is skilio.tech?")
 ┌────────────────────────────────────────────────────────────┐
 │ DNS Recursive Resolver (ISP, Cloudflare 1.1.1.1, Google)   │
 └────────┬───────────────────────────────────────────────────┘
          │
          ▼ (2. "Who manages the .tech TLD?")
 ┌────────────────────────────────────────────────────────────┐
 │ Root & TLD Nameservers (.tech Registry)                    │
 └────────┬───────────────────────────────────────────────────┘
          │
          ▼ (3. "Ask the Authoritative Nameserver")
 ┌────────────────────────────────────────────────────────────┐
 │ Authoritative Nameserver (Host where DNS records live)     │
 └────────┬───────────────────────────────────────────────────┘
          │
          ▼ (4. "skilio.tech resolves to 16.192.59.166!")
 [Browser establishes TCP/TLS handshake with AWS EC2]
```

* **Core DNS Record Types for DevOps**:

| Record Type | Host | Target Value | Purpose in Skilio Platform |
| :---: | :---: | :---: | :--- |
| **`A`** | `@` (Apex) | `16.192.59.166` | Maps the root domain (`https://skilio.tech`) directly to our static AWS Elastic IPv4. |
| **`A` (Wildcard)** | `*` | `16.192.59.166` | **DevOps Superpower**: Directs **all** subdomains (`api.skilio.tech`, `grafana.skilio.tech`, `status.skilio.tech`) to our host without creating separate DNS records. |
| **`CNAME`** | `www` | `skilio.tech` | Canonical Name alias: redirects `www.skilio.tech` to apex `skilio.tech`. |

* **TTL (Time-To-Live) & Global Caching**:
  * **TTL** defines the number of seconds intermediate DNS resolvers cache our DNS answer before querying our authoritative nameserver again.
  * *Standard Production*: `3600` seconds ($1\text{ hour}$) or `86400` seconds ($24\text{ hours}$).
  * *Migration / Launch Mode*: `300` seconds ($5\text{ minutes}$) to ensure instant IP propagation if the server address changes.
* **CLI DNS Verification**:
  ```bash
  dig +short skilio.tech
  # 16.192.59.166
  nslookup api.skilio.tech
  # Address: 16.192.59.166
  ```

---

### 2.2 Reverse Proxy Architecture (Traefik 3.6)

* **Why We Cannot Expose Containers Directly**:
  * If containers were published directly to the host, visitors would need to memorize ugly ports: `skilio.tech:5173` (React), `skilio.tech:8000` (FastAPI), `skilio.tech:3000` (Grafana).
  * Opening multiple host ports through the AWS Security Group expands the server's attack surface.
  * Each container would need its own complex SSL certificate configuration.

* **Forward Proxy vs. Reverse Proxy**:

```text
 FORWARD PROXY (Protects and hides clients)
 [Student Laptop] ──▶ [University Proxy] ──▶ [The Public Internet]
 (Intercepts outbound requests, enforces filtering, logs visited websites).

 REVERSE PROXY (Protects and manages backend servers)
 [Public Internet User] ──▶ [Traefik 3.6 Proxy] ──▶ [Private Docker Containers]
 (Single ingress point; routes incoming traffic to internal microservices).
```

* **The 3 Superpowers of a Reverse Proxy**:

```text
                             PUBLIC INTERNET
                                    │
                         Ports 80 (HTTP) & 443 (HTTPS)
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │     TRAEFIK REVERSE PROXY   │
                     │  • Handles TLS Termination  │
                     │  • Inspects Host & Paths    │
                     └──────────────┬──────────────┘
                                    │ Internal Docker Bridge Network (100% Private)
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
   │ React Frontend  │     │ FastAPI Backend │     │ Grafana Monitor │
   │ (skilio.tech/)  │     │ (/api/v1/...)   │     │ (grafana.skilio)│
   └─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Single Ingress Point (Maximum Security)**:
   * Only **Port 80 (HTTP)** and **Port 443 (HTTPS)** are exposed to the public internet.
   * All backend microservices (FastAPI, PostgreSQL, Redis, Prometheus) live on an isolated internal Docker bridge network (`default`), completely unreachable from the outside.
2. **TLS / SSL Termination**:
   * Heavy cryptographic encryption/decryption happens once at the Traefik boundary.
   * Traffic between Traefik and internal containers travels over high-speed, unencrypted internal Linux bridge networking with zero encryption overhead.
3. **Dynamic Host & Path-Based Routing**:
   * Traefik inspects incoming HTTP request headers to route traffic to the correct container:

| User Request | Traefik Routing Rule | Target Container |
| :--- | :--- | :--- |
| `https://skilio.tech/` | `Host("skilio.tech")` | **Frontend (React / Nginx)** |
| `https://skilio.tech/api/v1/...` | `Host("skilio.tech") && PathPrefix("/api")` | **Backend (FastAPI)** |
| `wss://skilio.tech/ws/...` | `Host("skilio.tech") && PathPrefix("/ws")` | **Backend (WebSockets)** |
| `https://grafana.skilio.tech` | `Host("grafana.skilio.tech")` | **Monitoring (Grafana)** |

* **Why Traefik 3.6 over Classic Nginx?**:
  * *Classic Nginx*: Relies on static configuration files (`nginx.conf`). Every container change requires updating IP addresses and running `nginx -s reload`.
  * *Traefik*: **Cloud-Native & Container-Aware**. Connects directly to the Docker daemon socket (`/var/run/docker.sock`). When containers start, Traefik dynamically reads their Docker Compose `labels`, sets up routing rules, and provisions SSL certificates with **zero manual configuration files and zero reloads**.

---

### 2.3 Automated TLS / HTTPS via Let's Encrypt & ACME

* **HTTP vs. HTTPS**:
  * **HTTP (Port 80)**: Plaintext transmission. Packets traversing public Wi-Fi or ISP routers can be intercepted via packet sniffing, exposing passwords and JWT authentication tokens.
  * **HTTPS (Port 443)**: HTTP over TLS 1.3 (Transport Layer Security). Cryptographically encrypts all payloads into scrambled ciphertext, preventing eavesdropping and Man-in-the-Middle (MITM) attacks.

* **The Shift to Let's Encrypt & ACME**:
  * *Traditional CAs*: Expensive ($100–$500/year), required manual Certificate Signing Requests (CSR), domain verification emails, and manual certificate installations. Expired certificates caused catastrophic production outages.
  * *Let's Encrypt*: Free, non-profit, automated Certificate Authority governed by the Linux Foundation and Mozilla.
  * *ACME Protocol*: **A**utomated **C**ertificate **M**anagement **E**nvironment — RFC 8555 standard enabling automated certificate issuance, verification, and renewal.

* **The ACME HTTP-01 Challenge Handshake**:

```text
  [Traefik 3.6 on AWS]                                      [Let's Encrypt CA]
           │                                                         │
           │  1. Request SSL certificate for "skilio.tech"           │
           │ ──────────────────────────────────────────────────────▶ │
           │                                                         │
           │  2. Challenge: "Prove ownership! Serve this token at:   │
           │     http://skilio.tech/.well-known/acme-challenge/XYZ"  │
           │ ◀────────────────────────────────────────────────────── │
           │                                                         │
           │  3. Traefik dynamically registers temporary HTTP route   │
           │     and responds: "Challenge ready. Verify it!"         │
           │ ──────────────────────────────────────────────────────▶ │
           │                                                         │
           │  4. Let's Encrypt queries http://skilio.tech/.../XYZ    │
           │     ✔ Token verified! Domain ownership proven.          │
           │                                                         │
           │  5. Issues signed X.509 SSL Certificate                 │
           │ ◀────────────────────────────────────────────────────── │
```

* **Storage & Automatic 90-Day Renewal Lifecycle**:
  * **`acme.json` Storage**: Traefik stores issued certificates and private keys inside `/certificates/acme.json`.
  * **File Permissions Hardening (`chmod 600`)**: Traefik strictly enforces that `acme.json` must be readable only by its owner (mode `0600`). If permissions are open, Traefik refuses to start for security reasons.
  * **Persistent Volume Mounting**: The certificate directory is mounted to a named Docker volume (`traefik-certificates`), ensuring certificates survive container restarts and rebuilds.
  * **Automatic Renewal**: Let's Encrypt certificates are valid for $90\text{ days}$. Traefik automatically initiates renewal at **day 60** ($30\text{ days}$ prior to expiration) in the background with zero downtime.

* **Global HTTP $\rightarrow$ HTTPS Redirection**:
  * Traefik enforces an automatic global redirect on Port 80:
    ```text
    http://skilio.tech (Port 80) ──▶ HTTP 301 Moved Permanently ──▶ https://skilio.tech (Port 443)
    ```
  * Guarantees $100\%$ of user traffic is encrypted, eliminating insecure plaintext connections.

---

## Level 3: Continuous Integration & Deployment (CI/CD)

### 3.1 CI vs. CD Explained
- **Continuous Integration (CI)**:
  - Automates code quality checks on every push or pull request.
  - Runs linters, formatting checks, and automated unit/integration tests (`pytest`, `bun test`).
  - **Goal**: Prevent broken code from ever reaching the `master` branch.
- **Continuous Deployment (CD)**:
  - Automatically takes code merged into `master` and ships it to the live cloud production server without human intervention.
  - **Goal**: Fast, frequent, reliable releases (RTO $< 2\text{ minutes}$).

### 3.2 GitHub Actions Architecture
- **Workflow File**: YAML document inside `.github/workflows/` defining jobs and triggers.
- **Runner**: A clean Ubuntu virtual machine spun up temporarily by GitHub to execute your workflow steps.
- **Secrets Management**:
  - Sensitive data (`SERVER_SSH_KEY`, `SERVER_HOST`, `DB_PASSWORD`) is stored in GitHub Repository Secrets.
  - Masked in logs (displayed as `***`) and injected as runtime environment variables.

### 3.3 Zero-Downtime Deployment Lifecycle
How does the server update without kicking active users out of their WebSocket chat?

```text
 1. GitHub Actions SSH into Server
                     │
                     ▼
 2. Clean Git Reset ('git fetch origin master && git reset --hard origin/master')
                     │
                     ▼
 3. Build new Docker images in parallel ('docker compose build')
                     │
                     ▼
 4. Run database migrations ('docker compose run --rm backend bash scripts/prestart.sh')
                     │
                     ▼
 5. Rolling Container Restart ('docker compose up -d --remove-orphans')
    • Old containers receive SIGTERM (given grace period to finish requests)
    • New containers start up & pass health check probe
    • Traefik seamlessly switches new HTTP/WebSocket connections
                     │
                     ▼
 6. Disk Pruning ('docker image prune -f')
    • Purges dangling layers, safeguarding EBS storage against ENOSPC crashes
                     │
                     ▼
 7. Resilient Smoke Test (curl with retries to /api/v1/health)
```

### 3.4 Production Architectural Trade-Off: Option A vs. Option B

| Dimension | Option A: Build on EC2 with 2GB Swap (Our Chosen Architecture) | Option B: Build in CI & Push to Container Registry (GHCR/ECR) |
| :--- | :--- | :--- |
| **How it works** | VPS pulls source code and compiles images directly on host. | CI runner compiles image, pushes to registry; VPS runs `docker pull`. |
| **Complexity** | 🟢 **Zero extra tokens**: No registry PATs or machine credentials. | 🟡 **Token management**: Requires GHCR read/write scopes and Docker logins. |
| **Build Stability** | 🟢 **100% stable with Swap**: 2 GB swap prevents OOM-killer. | 🟢 Fast GitHub runner (16 GB RAM). |
| **Deploy Duration** | ~1.5 to 2 minutes on `t3.micro`. | ~15 to 25 seconds. |
| **Real-world Context** | Used by modern single-node deployment engines (Kamal, Dokku, Coolify). | Used in multi-node Kubernetes / auto-scaling AWS ECS clusters. |

---

## Level 4: 42 Evaluation Defense & System Mastery

### 4.1 How to Defend This in the 42 Evaluation

**Evaluator Question**: *"Why did you choose to build directly on the server instead of pushing images to Docker Hub or GitHub Container Registry (GHCR)?"*

> **Model Answer**:  
> *"For this single-node infrastructure, we deliberately chose Option A (Build-on-Server with a 2 GB Swap file). It keeps our deployment 100% self-contained and avoids brittle third-party registry tokens, credentials expiration, and registry pull rate limits. In our profiling, Vite Bun compilation and Python uv sync peak under 800 MB, well within our 3 GB total virtual memory.  
> However, we fully recognize the architectural trade-off: in a multi-node enterprise environment with auto-scaling groups or Kubernetes, the industry standard is Option B (building in GitHub Actions runners and pushing to GHCR/ECR) so that worker nodes only perform `docker compose pull` without expending CPU credits on builds."*

**Evaluator Question**: *"What prevents your local dev overrides from running on production?"*

> **Model Answer**:  
> *"Docker Compose automatically merges `compose.override.yml` by default, which contains development conveniences like `--api.insecure=true` on port 8090, exposed port 5432, and Mailpit. To enforce strict production isolation, our `.env.production` sets `COMPOSE_FILE=compose.yml:compose.deploy.yml`. This explicitly binds Compose to production files only, preventing any dev ports or hot-reload configurations from ever being exposed."*

---

