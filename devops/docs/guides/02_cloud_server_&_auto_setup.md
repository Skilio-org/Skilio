# 🛡️ Stage 2: Linux OS Hardening & Automated Cloud Bootstrap
### Comprehensive Presentation & Technical Reference Guide

---

## 1. Architectural Overview & Cloud Infrastructure (IaaS)

Our cloud infrastructure transitions the Skilio platform from an ephemeral `localhost` environment into an enterprise-grade, highly available cloud SaaS running 24/7 on AWS.

Our infrastructure philosophy is built on **three foundational pillars**:
1. **Infrastructure as a Service (IaaS):** Complete ownership and control of the operating system, kernel parameters, hypervisor firewalls, and network ingress.
2. **Security & Least Privilege:** Asymmetric cryptographic SSH authentication (`chmod 400`), zero password authentication, hypervisor-isolated datastores, and memory dump protections.
3. **Idempotent Automated Provisioning:** Zero manual server configuration. A single command (`make server-init`) safely prepares any fresh Linux server from scratch.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    AWS VPC (Virtual Private Cloud)                     │
 │                                                                        │
 │  ┌─────────────────────── Public Subnet ────────────────────────────┐  │
 │  │                                                                  │  │
 │  │  Internet Gateway (IGW) ──▶ [Elastic IP: 16.192.59.166] (Static) │  │
 │  │                                    │                             │  │
 │  │                                    ▼                             │  │
 │  │                      ┌───────────────────────────┐               │  │
 │  │                      │   AWS Security Group      │               │  │
 │  │                      │  (Hypervisor Firewall)    │               │  │
 │  │                      │   • Port 22  (SSH Key)    │               │  │
 │  │                      │   • Port 80  (HTTP)       │               │  │
 │  │                      │   • Port 443 (HTTPS)      │               │  │
 │  │                      │   • Port 5432 (DB Locked) │               │  │
 │  │                      └─────────────┬─────────────┘               │  │
 │  │                                    │                             │  │
 │  │                                    ▼                             │  │
 │  │                      ┌───────────────────────────┐               │  │
 │  │                      │   AWS EC2 (t3.small)      │               │  │
 │  │                      │   Ubuntu 24.04 LTS        │               │  │
 │  │                      │   • 2 vCPUs, 2 GB RAM     │               │  │
 │  │                      │   • 2 GB Swap (vm.swap=10)│               │  │
 │  │                      └─────────────┬─────────────┘               │  │
 │  │                                    │ Attached Block Bus          │  │
 │  │                                    ▼                             │  │
 │  │                      ┌───────────────────────────┐               │  │
 │  │                      │   AWS EBS (29 GB SSD)     │               │  │
 │  │                      │   • /swapfile (chmod 600) │               │  │
 │  │                      │   • /opt/skilio (App Root)│               │  │
 │  │                      │   • Docker Named Volumes  │               │  │
 │  │                      └───────────────────────────┘               │  │
 │  └──────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cloud Service Models: Why IaaS for 42 Evaluation?

The cloud industry categorizes infrastructure into three distinct tiers:

```text
 ┌────────────────────────────────────────────────────────┐
 │                          SaaS                          │  Software as a Service
 │             (Gmail, GitHub, Figma, Slack)              │  • You are strictly an end-user.
 ├────────────────────────────────────────────────────────┤
 │                          PaaS                          │  Platform as a Service
 │               (Vercel, Render, Heroku)                 │  • You upload code; vendor automates OS & network.
 ├────────────────────────────────────────────────────────┤
 │                          IaaS                          │  Infrastructure as a Service
 │             (AWS EC2, Google Compute Engine)           │  • Vendor provides raw virtualized hardware.
 │                                                        │  • YOU engineer OS, kernel, security, & Docker.
 └────────────────────────────────────────────────────────┘
```

### The 42 Evaluation Defense Rationale
* **Why PaaS (Vercel / Render) is Rejected:** PaaS platforms abstract away the entire server. The developer does not manage IP routing, firewall rules, kernel memory limits, or reverse proxies. Evaluators reject PaaS because it lacks DevOps engineering depth.
* **Why IaaS (AWS EC2) Qualifies for IV.10 Major (2 Points):** You personally configure every layer of the infrastructure:
  1. Hypervisor firewall security groups dropping malicious packets before hitting the OS.
  2. Linux OS kernel tuning, memory paging, and out-of-memory prevention.
  3. Reverse proxy ingress, SSL/TLS certificate automation, and container orchestration.
  4. Automated, zero-touch CI/CD pipelines deploying over encrypted SSH tunnels.

### The AWS Shared Responsibility Model (IaaS)

| Layer | Responsible Entity | Implementation in Skilio |
| :--- | :---: | :--- |
| **Physical Datacenter** | **AWS** | Power redundancy, diesel generators, physical biometric security, cooling. |
| **Hypervisor Virtualization**| **AWS** | AWS Nitro / KVM slicing physical silicon into isolated VMs. |
| **Virtual Firewall (Network)**| **YOU** | AWS Security Group: Port 22, 80, 443 open; datastores strictly dropped. |
| **Operating System** | **YOU** | Selecting Ubuntu 24.04 LTS, patching vulnerabilities, user management. |
| **Kernel & Memory** | **YOU** | Allocating 2 GB swap, tuning `vm.swappiness=10`, managing POSIX permissions. |
| **Containers & Runtime** | **YOU** | Installing Docker Engine, `overlay2` storage driver, non-root user groups. |
| **Application & Secrets** | **YOU** | Isolating `.env` secrets, managing PostgreSQL backups, running automated CI/CD. |

---

## 3. Cloud Networking & Persistent Storage Architecture

### A. Virtual Machine vs. Docker Container
Evaluators frequently ask to distinguish between the two virtualization paradigms:

* **Virtual Machine (AWS EC2):** Virtualizes the **hardware layer**. Runs a full, independent guest operating system with its own dedicated Linux kernel (`Linux 6.17.0-1017-aws`).
* **Docker Container:** Virtualizes the **user space (software execution)**. Containers have no kernel; they share the host EC2 Linux kernel using Linux cgroups and kernel namespaces.
* **Our Architecture:** Lightweight Docker microservices running *inside* an isolated AWS EC2 virtual machine.

### B. Compute vs. Persistent Storage: EC2 vs. AWS EBS
* **Compute (EC2 `t3.small`):** Provides 2 vCPUs and 2.0 GiB physical RAM. This layer is **volatile**; stopping the instance releases CPU/RAM back to AWS.
* **Storage (AWS EBS `gp3` 29 GB SSD):** Acts as a virtual NVMe drive attached over high-speed networking.
  * Docker named volumes (`app-db-data`, `traefik-certificates`) reside on this EBS volume at `/var/lib/docker/volumes/`.
  * **Persistence Guarantee:** When the EC2 server is rebooted, or when containers are rebuilt with `docker compose down && up`, **100% of PostgreSQL records, users, and certificates survive intact**.

### C. Networking: VPC, Elastic IP & Hypervisor Security Groups
1. **AWS VPC & Internet Gateway (IGW):** An isolated private software-defined network. The Internet Gateway performs Network Address Translation (NAT) to route public traffic to our subnet.
2. **Static Elastic IP (`16.192.59.166`):** Standard EC2 public IPs change on every reboot, which would break DNS. Our static Elastic IP is permanently bound to our account, keeping `skilio.works` and `*.skilio.works` permanently intact.
3. **Stateful Hypervisor Security Group:** Operates *outside* the Linux OS at the AWS Nitro hypervisor level. Packets sent to unauthorized ports are discarded before reaching the virtual machine's network card or CPU.

#### Production Port Matrix (`skilio-sg`)
| Port | Protocol | Purpose | Source | Status | Architectural Rationale |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **`22`** | TCP | SSH Maintenance & CI/CD | `0.0.0.0/0` | 🟢 **OPEN** | Secured exclusively by asymmetric RSA key; passwords disabled. |
| **`80`** | TCP | HTTP Ingress | `0.0.0.0/0` | 🟢 **OPEN** | Mandatory for Let's Encrypt validation & 308 HTTPS redirect. |
| **`443`** | TCP | HTTPS Production Web Traffic | `0.0.0.0/0` | 🟢 **OPEN** | TLS 1.3 encrypted web app, REST APIs, and WebSockets. |
| **`5432`** | TCP | PostgreSQL Database | Blocked | 🔴 **LOCKED** | Internal only. Isolated on Docker private bridge network. |
| **`6379`** | TCP | Redis Cache & Pub/Sub | Blocked | 🔴 **LOCKED** | Internal only. Zero public internet exposure. |
| **`8000`** | TCP | FastAPI Backend Service | Blocked | 🔴 **LOCKED** | Internal only. Traefik routes to it dynamically. |

---

## 4. Asymmetric SSH Cryptography & Host Hardening

### Why Passwords are Dead in Production
Internet botnets scan public IPv4 ranges 24/7 executing automated dictionary and brute-force attacks against Port 22. In our production server, password authentication is permanently disabled in `/etc/ssh/sshd_config`. The host accepts only mathematical cryptographic proofs.

### The 4-Step Challenge-Response Handshake
The private key is **never transmitted over the network**:

```text
 ┌──────────────────────┐                           ┌───────────────────────────┐
 │     YOUR LAPTOP      │                           │      AWS EC2 SERVER       │
 │ (Holds Private Key)  │                           │ (Holds ~/.ssh/auth_keys)  │
 └──────────┬───────────┘                           └─────────────┬─────────────┘
            │                                                     │
            │  1. Client: "Authenticate user 'ubuntu' with Key X" │
            │ ──────────────────────────────────────────────────▶ │
            │                                                     │
            │  2. Server generates random 256-bit number (Nonce)  │
            │     and encrypts it using user's Public Key         │
            │ ◀────────────────────────────────────────────────── │
            │                                                     │
            │  3. Laptop decrypts Nonce with local Private Key,   │
            │     signs it cryptographically, and sends proof     │
            │ ──────────────────────────────────────────────────▶ │
            │                                                     │
            │  4. Server validates signature using Public Key     │
            │     ✔ MATCH! Handshake complete. Access granted     │
            │ ◀────────────────────────────────────────────────── │
```

### POSIX Permissions & The Mandatory `chmod 400`
OpenSSH client strictly enforces local key security:
* **`chmod 400 skilio-key.pem`**: **Owner:** Read-only and group and others have no permissions.
* If permissions are left at standard defaults (`644` or `777`), OpenSSH immediately halts execution with:
  `WARNING: UNPROTECTED PRIVATE KEY FILE! Permissions 0644 are too open. This private key will be ignored.`
  This prevents local background processes or other users on your machine from exfiltrating the private key.

### Host SSH Hardening (`/etc/ssh/sshd_config`)
```text
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```
* `PasswordAuthentication no`: Shuts down password brute-force attacks completely.
* `PermitRootLogin prohibit-password`: Enforces the Principle of Least Privilege. Administrators connect as unprivileged user `ubuntu` and escalate via `sudo` only when necessary.

---

## 5. Linux Memory Architecture & The 2 GB Swap File

### The Problem: Memory Spikes & The Linux OOM Killer
* Our server has **2.0 GB of physical RAM**.
* Normal runtime operations (Ubuntu + Docker + Postgres + Redis + FastAPI) consume **~900 MB** (~45% RAM).
* When building the application, the Vite/Bun compiler (`bun run build`) bundles the React 19 SPA. Compiling TypeScript and tree-shaking native modules spikes memory usage to **~2.2 GB – 2.5 GB**.
* When memory allocation fails, the Linux kernel invokes the **OOM Killer** (*Out-Of-Memory Killer*), and terminates the build process with an uncatchable **`SIGKILL` (Signal 9)**.

### The Solution: Virtual Memory Paging & `/swapfile`
We allocate a 2 GB contiguous file on the NVMe SSD (`/swapfile`), expanding total virtual memory to **4.0 GB**.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     VIRTUAL MEMORY (4.0 GB TOTAL)                      │
 │                                                                        │
 │  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
 │  │   Physical RAM (2.0 GB) │          │     SSD Swapfile (2.0 GB)   │  │
 │  │   (Ultra-fast, volatile)│          │     (Persistent SSD disk)   │  │
 │  │                         │          │                             │  │
 │  │  [Active React Build]   │          │  [Idle OS processes]        │  │
 │  │  [Active HTTP traffic]  │          │  [Idle background daemons]  │  │
 │  └────────────▲────────────┘          └──────────────▲──────────────┘  │
 │               │                                      │                 │
 │               └────────────── PAGING ────────────────┘                 │
 │                  Cold pages out ──▶ Disk                               │
 │                  Active pages in ──▶ RAM                               │
 └────────────────────────────────────────────────────────────────────────┘
```

* **Paging Mechanism:** Memory is divided into 4 KB Pages. When compilation demands physical RAM, the kernel pages out inactive memory (e.g. idle background daemons) to `/swapfile`. When those daemons wake, their pages are paged back in.
* **Security Lockdown (`chmod 600 /swapfile`):** Swap contains raw memory pages—including active database tokens, API keys, and session hashes. Setting permissions to `600` (`rw-------`) ensures **only the root kernel process** can access the file, preventing unprivileged users from dumping system memory.
* **Kernel Parameter Tuning (`vm.swappiness=10`):** Ubuntu defaults to `60`, which swaps aggressively and degrades disk performance. Setting `vm.swappiness=10` instructs the kernel to prioritize physical RAM, engaging swap only when memory pressure exceeds **~90%**.

---

## 6. Automated Idempotent Bootstrap: `server-init.sh`

Located at [`devops/scripts/server-init.sh`], this script prepares a raw Ubuntu server for production in under 45 seconds.

### Defensive Bash Engineering (`set -euo pipefail`)
* **`-e` (Exit immediately):** Halts the script if any command returns a non-zero exit status.
* **`-u` (Unset variables):** Treats unset variables as an error and terminates immediately, preventing catastrophic bugs (e.g., `rm -rf /opt/$UNDEFINED`).
* **`-o pipefail` (Pipeline safety):** If any command in a pipe fails (`cmd1 | cmd2 | cmd3`), the entire pipeline returns that failure code instead of masked success.

### Idempotency: Run Once or Run 100 Times
Every task checks existing system state before making modifications:
1. **Swap Verification:** `if [ -f /swapfile ]` skips creation if the swap file already exists.
2. **Mount Persistence:** `if ! grep -q '/swapfile' /etc/fstab` prevents duplicate mount entries.
3. **Runtime Check:** `if command -v docker` skips re-installation if Docker is already operational.
4. **Daemon Storage Driver:** Writes `{"storage-driver": "overlay2"}` only if `/etc/docker/daemon.json` is missing.

### Remote Execution Architecture via Makefile
```makefile
server-init:
	ssh -i $(SSH_KEY) ubuntu@$(SERVER_IP) 'sudo bash -s' < devops/scripts/server-init.sh
```
* Streams the local script directly through the encrypted SSH tunnel into remote `sudo bash -s`.
* Eliminates the need to copy (`scp`) scripts to the server, execute them, and clean them up.
* Real-time formatted and colored logs stream directly back to the developer workstation.

---

## 7. Master Command & Flag Cheat Sheet

### Bash & OS Bootstrap
| Command / Syntax | Flags | What it does & Technical Purpose |
| :--- | :---: | :--- |
| `#!/usr/bin/env bash` | — | Shebang: Portably resolves bash path via `$PATH`. |
| `set -euo pipefail` | `-e`, `-u`, `-o` | Bash Strict Mode: Catches errors, unset variables, and pipeline failures. |
| `exec sudo bash "$0" "$@"` | `exec` | Process replacement: Auto-elevates script privileges to root with original arguments. |
| `${SUDO_USER:-ubuntu}` | `:-` | Parameter Expansion: Resolves calling user; defaults to `ubuntu`. |
| `export DEBIAN_FRONTEND=noninteractive` | — | Silences interactive terminal dialogs to prevent automated scripts from freezing. |
| `apt-get install -y --no-install-recommends` | `--no-install-recommends` | Installs only mandatory binaries, preventing operating system bloat. |

### Memory & Swap Management
| Command / Syntax | Flags | What it does & Technical Purpose |
| :--- | :---: | :--- |
| `fallocate -l 2G /swapfile` | `-l 2G` | Allocates a contiguous 2 GB block instantly on disk without zero-filling. |
| `chmod 600 /swapfile` | `600` | Security permission: Read/Write for `root` only (`rw-------`). |
| `mkswap /swapfile` | `>/dev/null` | Formats the preallocated file as a Linux swap filesystem. |
| `swapon /swapfile` | — | Activates swap space in the running Linux kernel. |
| `grep -q '/swapfile' /etc/fstab` | `-q` | Quiet check: Suppresses output, returns status code to avoid duplicate entries. |
| `sysctl vm.swappiness=10` | — | Sets runtime kernel swappiness to 10 (RAM prioritized, swap only when >90% full). |

### Container Runtime & User Privileges
| Command / Syntax | Flags | What it does & Technical Purpose |
| :--- | :---: | :--- |
| `docker.io` | — | Native, fully-supported Ubuntu package for Docker Engine. |
| `docker-compose-v2` | — | Native Compose plugin (`docker compose`). |
| `{"storage-driver": "overlay2"}` | — | Docker daemon config: Enforces modern UnionFS driver for cAdvisor compatibility. |
| `systemctl enable --now docker` | `--now` | Enables Docker on boot AND starts the service immediately. |
| `usermod -aG docker ubuntu` | `-aG` | Appends user `ubuntu` to `docker` group, allowing non-root Docker execution. |
| `chown -R ubuntu:ubuntu /opt/skilio` | `-R` | Recursively sets deployment directory ownership to `ubuntu`. |
| `chmod 755 /opt/skilio` | `755` | Standard FHS permissions: Owner write (`rwx`), world read/execute (`r-x`). |

---

### The 30-Second Defense Elevator Pitch
Our infrastructure runs on an AWS EC2 `t3.small` instance provisioned inside a dedicated VPC with a permanent static Elastic IP (`16.192.59.166`). We isolate our datastores at the hypervisor level using stateful Security Groups that drop all traffic except ports 22, 80, and 443. The host OS was bootstrapped with an idempotent script (`server-init.sh`) written with `set -euo pipefail`. We eliminated kernel OOM build crashes by allocating a 2 GB swapfile secured with `chmod 600` and tuned with `vm.swappiness=10`. Container management is granted to an unprivileged deploy user, allowing zero-touch CI/CD over encrypted SSH without requiring root credentials.
