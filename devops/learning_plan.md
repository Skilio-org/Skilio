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

### 1.1 What is Cloud Computing (IaaS)?
- **Concept**: Instead of buying a physical rack server, you rent virtualized hardware slices on demand through an API or web console.
- **Why it matters**: AWS manages physical power, cooling, motherboard repairs, and fiber cables. You manage the operating system (Ubuntu 24.04 LTS), Docker, and code.

### 1.2 AWS EC2 (Elastic Compute Cloud) & Virtualization
- **What is EC2?**: An EC2 instance is a virtual machine running on AWS's physical hypervisors (AWS Nitro System / KVM).
- **Instance Sizing**:
  - `t3.micro`: 2 vCPUs, 1 GB RAM (Free Tier eligible).
  - `t3.small`: 2 vCPUs, 2 GB RAM (Comfortable for building Docker containers).
- **42 C Analogy**: Think of an EC2 instance as a dedicated virtual machine running inside an isolated Linux namespace with its own virtual CPU, RAM, and disk controller.

### 1.3 AWS Networking: VPC, Elastic IPs, and Security Groups
- **VPC (Virtual Private Cloud)**: An isolated virtual network dedicated to your AWS account. Your server sits in a public subnet with access to an Internet Gateway.
- **Dynamic vs. Elastic IP**:
  - *Default Public IP*: Changes every time the EC2 instance stops and starts.
  - *Elastic IP (Static IP)*: A permanent public IPv4 address allocated to your account. It never changes, which is required for your domain's DNS `A Record`.
- **Security Groups (Stateful Hypervisor Firewall)**:
  - Security Groups run at the AWS network hypervisor layer, **outside** your Linux operating system.
  - *Stateful nature*: If you allow inbound traffic on port 443, the outbound response traffic is automatically allowed regardless of outbound rules.
  - **Our Rule Matrix**:
    - Port `22` (SSH): Allowed only with cryptographic keys.
    - Port `80` (HTTP): Allowed for Let's Encrypt validation & HTTPS redirect.
    - Port `443` (HTTPS): Allowed for encrypted web traffic.
    - Ports `5432` (Postgres) / `6379` (Redis): Strictly blocked from the internet.

### 1.4 Linux Memory & The Swap File
- **The Problem**: Compiling frontend bundles (`bun run build`) and building Docker images can spike memory usage beyond 1 GB. If RAM runs out, the Linux kernel's **OOM Killer (Out-Of-Memory Killer)** abruptly sends `SIGKILL` (-9) to your process, crashing the build.
- **The Solution (Swap)**:
  - A 2 GB Swap file (`/swapfile`) acts as virtual memory on the SSD.
  - When physical RAM fills up, the Linux memory manager pages inactive memory blocks to disk, keeping processes alive and stable.

### 1.5 Asymmetric SSH Key Cryptography
- **How it works**:
  - You generate a public/private key pair (`ssh-keygen` or AWS `.pem`).
  - **Private Key** (e.g., `skilio-key.pem`): Stored securely on your laptop with permissions `chmod 400` (readable only by you). **Never shared.**
  - **Public Key**: Placed in the server's `~/.ssh/authorized_keys`.
  - When connecting, the server encrypts a challenge with the public key; only your private key can decrypt and sign it. Passwords are completely disabled (`PasswordAuthentication no`).

---

## Level 2: DNS, Networking, Ingress & Automated SSL/TLS

### 2.1 How DNS (Domain Name System) Works
- **Concept**: The phonebook of the internet. Translates human-readable names (`skilio.tech`) into machine IP addresses (`54.210.80.12`).
- **Core DNS Records**:
  - **A Record**: Maps a domain name directly to an IPv4 address.
    - Example: `@` (apex: `skilio.tech`) $\rightarrow$ `54.210.80.12`
  - **Wildcard Record (`*`)**: Maps all subdomains (`*.skilio.tech`) to the same server so `api.skilio.tech` or `adminer.skilio.tech` work automatically.
  - **TTL (Time to Live)**: How many seconds DNS resolvers (like Google `8.8.8.8` or Cloudflare `1.1.1.1`) cache the record before asking your authoritative nameserver again.

### 2.2 Reverse Proxy Architecture
- **Forward Proxy**: Sits in front of clients (e.g. university proxy monitoring outgoing web browsing).
- **Reverse Proxy**: Sits in front of backend servers. Clients connect to the reverse proxy without knowing what internal services exist behind it.
- **Why use Traefik instead of exposing ports directly?**:
  1. *Single Ingress Point*: Only ports 80 and 443 are open to the world.
  2. *TLS Termination*: Traefik handles heavy cryptographic SSL handshakes in one place; backend containers talk lightweight HTTP internally.
  3. *Dynamic Routing*: Inspects the HTTP `Host` header to route traffic (`skilio.tech` $\rightarrow$ frontend/backend, `adminer.skilio.tech` $\rightarrow$ database GUI).

### 2.3 Automated TLS / HTTPS via Let's Encrypt & ACME
- **What is TLS/SSL?**: Encrypts the TCP connection between browser and server, preventing eavesdropping and man-in-the-middle (MITM) attacks.
- **The ACME Protocol (Automated Certificate Management Environment)**:
  1. Traefik sends a request to Let's Encrypt: *"I want a certificate for skilio.tech"*.
  2. Let's Encrypt replies with a challenge: *"Prove you control this domain by answering on port 80 or 443"*.
  3. Traefik fulfills the challenge dynamically (TLS-ALPN-01 or HTTP-01).
  4. Let's Encrypt verifies it and signs an official X.509 certificate.
  5. Traefik stores it in `/certificates/acme.json` and auto-renews it 30 days before expiration.

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
 2. Pull latest git commits ('git pull origin master')
                     │
                     ▼
 3. Build new Docker images in parallel ('docker compose build')
                     │
                     ▼
 4. Run database migrations ('docker compose run --rm backend prestart.sh')
                     │
                     ▼
 5. Rolling Container Restart ('docker compose up -d')
    • Old containers receive SIGTERM (given grace period to finish requests)
    • New containers start up & pass health check probe
    • Traefik seamlessly switches new HTTP/WebSocket connections
                     │
                     ▼
 6. Smoke Test (curl -f https://skilio.tech/api/v1/health)
```

---
