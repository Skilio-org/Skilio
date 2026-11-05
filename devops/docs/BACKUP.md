# 🛡️ Health Check, Public Status Page & Disaster Recovery

---

## 1. 42 Subject Compliance & Justification

In Section **IV.7 DevOps**, the 42 curriculum defines this module as:

> **"Minor: Health check and status page system with automated backups and disaster recovery procedures." (1 Point)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Diagnostic Health Check Endpoint** | Deep active probing of PostgreSQL query latency (`SELECT 1`), Redis ping roundtrip, and root storage capacity; returns HTTP 200 (healthy/degraded) or HTTP 503 (unhealthy). | [`health.py`](../../backend/app/api/routes/health.py) |
| **2. Public Status Dashboard** | React single-page application dashboard polling `/api/v1/health` every 10s with real-time latency badges and system health banners. | [`status.tsx`](../../frontend/src/routes/status.tsx) |
| **3. Automated Database Backups** | Dedicated Alpine container running BusyBox `crond` at 02:00 UTC daily, streaming `pg_dump \| gzip -9` with CRC-32 verification and 7-day FIFO retention. | [`backup.sh`](../backup/backup.sh) • [`entrypoint.sh`](../backup/entrypoint.sh) |
| **4. Disaster Recovery & RTO Target** | 1-command database restoration with connection termination, plus an automated non-destructive sandbox verification drill achieving **RTO < 60 seconds** (actual drill runs in **< 5s**). | [`restore.sh`](../backup/restore.sh) • [`dr-test.sh`](../backup/dr-test.sh) |

---

## 2. Master System Resilience Architecture

Rather than treating backups and monitoring as isolated scripts, our architecture implements a continuous **Detection $\rightarrow$ Protection $\rightarrow$ Verification** operational loop:

```text
 ┌──────────────────────────────────┐      ┌──────────────────────────────────┐      ┌──────────────────────────────────┐
 │     1. ACTIVE OBSERVABILITY      │ ──▶  │       2. DATA PROTECTION         │ ──▶  │      3. RESILIENCE DRILL         │
 │  • Deep /api/v1/health Probe     │      │  • Streaming pg_dump | gzip -9   │      │  • Non-Destructive Sandbox Drill │
 │  • Public /status Live Dashboard │      │  • Containerized 02:00 UTC Cron  │      │  • RTO < 60s (Runs in < 5s)      │
 │  • 10s Auto-Polling Telemetry    │      │  • 7-Day FIFO Ring Buffer        │      │  • Assert 17/17 Table Integrity  │
 └──────────────────────────────────┘      └──────────────────────────────────┘      └──────────────────────────────────┘
```

```text
                             [ Evaluator Browser ]
                                       │
                                       │ HTTP GET /status (Polls every 10s)
                                       ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                   FASTAPI APPLICATION GATEWAY (:8000)                     │
 │                                                                           │
 │  GET /api/v1/health ──────────────────────────────────────────────────┐   │
 │   • probe_database() ──▶ SELECT 1 (latency ms)                        │   │
 │   • probe_redis()    ──▶ async PING (latency ms)                      │   │
 │   • probe_disk()     ──▶ shutil.disk_usage('/') (% free)              │   │
 └─────────────────────────────────────┬─────────────────────────────────┘   │
                                       │                                     │
                 DOCKER INTERNAL BRIDGE NETWORK                              │
                                       │                                     │
           ┌───────────────────────────┴───────────────────────────┐         │
           ▼                                                       ▼         │
 ┌───────────────────┐                                   ┌───────────────────┐
 │ PostgreSQL 18 DB  │                                   │      Redis 8      │
 │ Primary: 'app'    │                                   │ In-Memory Cache   │
 │ (17 Tables)       │                                   │ & Real-Time Chat  │
 └─────────┬─────────┘                                   └───────────────────┘
           │
           │ Automated Backup Stream (crond 02:00 UTC / entrypoint.sh)
           ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                DEDICATED ALPINE BACKUP DAEMON CONTAINER                   │
 │                                                                           │
 │  • Streams: pg_dump | gzip -9 > backup_app_YYYYMMDD_HHMMSS.sql.gz         │
 │  • Immediate CRC-32 Check: gzip -t archive                                │
 │  • FIFO Retention: Keeps newest 7 archives, prunes older snapshots        │
 │  • Ephemeral Sandbox Verification (dr-test.sh): Restores into sandbox DB  │
 │    and asserts 100% table match without touching live production data.    │
 └───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pillar 1: Real-Time Diagnostic Observability & Status Dashboard

### Key Architecture Features
* **Active Dependency Probing:** [`health.py`](../../backend/app/api/routes/health.py) does not return a dummy static JSON. It executes live transactions against PostgreSQL (`SELECT 1`), measures Redis round-trip latency, and inspects host partition capacity.
* **Smart HTTP Status Mapping:**
  - `status: "healthy"` $\rightarrow$ **HTTP 200**
  - `status: "degraded"` (e.g., Redis offline, but DB online) $\rightarrow$ **HTTP 200** (marketplace operational, chat offline).
  - `status: "unhealthy"` (Postgres offline or disk $< 5\%$) $\rightarrow$ **HTTP 503 Service Unavailable**.
* **Public React Status Page ([`status.tsx`](../../frontend/src/routes/status.tsx)):** Live public UI with countdown auto-polling every 10s and color-coded latency badges.

---

## 4. Pillar 2: Zero-Downtime Automated Backup Engine

### Key Architecture Features
* **Dedicated Container Daemon (`postgres:18-alpine`):** Packaged inside Docker Compose with BusyBox `crond`. Runs independently of host OS cron, avoiding `pg_dump` binary version mismatches.
* **Zero Exclusive Locks via MVCC:** PostgreSQL Multi-Version Concurrency Control opens a `REPEATABLE READ` transaction snapshot. Backups run in the background while users continue placing orders and creating proposals without blocking.
* **In-Memory Streaming Compression:** Data streams directly through a kernel pipe (`pg_dump | gzip -9`), eliminating intermediate uncompressed 20GB disk files.
* **Automated CRC-32 Checksum Validation:** Every archive is immediately tested via `gzip -t`. Corrupted files are trapped and deleted before storage.
* **Deterministic FIFO Retention (`MAX_BACKUPS=7`):** Automatically prunes snapshots older than the 7 newest archives, guaranteeing bounded disk consumption.

---

## 5. Pillar 3: Instant Disaster Recovery & Sandbox Drills

### Key Architecture Features
* **Single-Command Restoration ([`restore.sh`](../backup/restore.sh)):** Running `make restore` terminates lingering connection locks via `pg_terminate_backend`, resets schema `public`, and streams the latest archive in $< 15\text{s}$.
* **Automated Sandbox Verification Drill ([`dr-test.sh`](../backup/dr-test.sh)):** An untested backup is not a backup. Running `make dr-test` creates an isolated test database (`dr_drill_sandbox`), restores the latest snapshot, asserts that all 17 public tables match production 100%, and drops the sandbox.
* **RTO Performance Guarantee:** 42 subject requires $\text{RTO} < 60\text{ seconds}$. Our drill completes full verification and table assertion in **$< 5\text{ seconds}$**.
* **Zero Production Risk:** Drills run in an ephemeral sandbox without downtime or impact on active users.

---

## 6. Operations & Evaluation CLI Cheatsheet

All operations are integrated into the root [`Makefile`](../../Makefile):

| Command | Action |
| :--- | :--- |
| `make backup` | Triggers an immediate compressed PostgreSQL snapshot (`.sql.gz`). |
| `make backup-list` | Displays table of stored archives, compressed sizes, and dates. |
| `make restore` | Restores database schema from latest snapshot. |
| `make restore FILE=<name>` | Restores database from a specific historical archive. |
| `make dr-test` | Runs non-destructive DR verification drill in an isolated sandbox (**RTO < 60s**). |

---

> 📖 **Deep Dive Technical Guide & Defense Playbook:**  
> For detailed SRE theory (RPO/RTO metrics, MVCC mechanics), step-by-step bash scripts, chaos testing simulations, and peer evaluator Q&A, read:  
> 👉 **[guides/05_backup_&_disaster_recovery.md](guides/05_backup_&_disaster_recovery.md)**
