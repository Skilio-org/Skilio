# Implementation Plan & Guide: Health Check, Status Page & Disaster Recovery
### Module: **IV.7 DevOps Minor (1 Point)**
**Author / Owner:** Aysadeq  
**Project:** Freelancer Platform (`ft_transcendence`)

---

## 1. Executive Summary & 42 Subject Alignment

In Section `IV.7 DevOps`, the 42 subject defines this module as:
> **"Minor: Health check and status page system with automated backups and disaster recovery procedures." (1 Point)**

This module is not just a simple web page or a one-line script. It is an end-to-end **High-Availability & Operational Resilience Suite** designed to prove that the Freelancer platform can monitor its own internal health, alert operators to partial failures, continuously protect data, and recover from catastrophic data loss in under 60 seconds.

---

## 2. System Architecture

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                              CLIENT LAYER                              │
  │                     [ Web Browser / 42 Evaluator ]                     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                         HTTP GET /status (Public UI)
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                            FRONTEND LAYER                              │
  │            React + Vite Dashboard (frontend/src/routes/status.tsx)     │
  │                                                                        │
  │   • "All Systems Operational" Banner (Green / Amber / Red)             │
  │   • Real-Time Latency Badges (e.g. Database: 1.8 ms)                   │
  │   • Auto-refresh poll every 10s with manual refresh button             │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                    HTTP GET /api/v1/health (Auto-Poll)
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         FASTAPI BACKEND LAYER                          │
  │                    (backend/app/api/routes/health.py)                  │
  │                                                                        │
  │   ┌──────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
  │   │  DB Latency Probe    │  │ Redis Ping Probe│  │ Disk Space Probe │  │
  │   │  (Runs "SELECT 1")   │  │  (Sends "PING") │  │ (shutil.disk_use)│  │
  │   └──────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
  └──────────────┼───────────────────────┼────────────────────┼────────────┘
                 │                       │                    │
                 ▼                       ▼                    ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                      INFRASTRUCTURE & STORAGE LAYER                    │
  │                                                                        │
  │   ┌──────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
  │   │ PostgreSQL 18 (db)   │  │ Redis 8 (redis) │  │ Host Storage     │  │
  │   │ Relational Database  │  │ Cache / PubSub  │  │ EBS Disk Volume  │  │
  │   └──────────▲───────────┘  └─────────────────┘  └──────────────────┘  │
  └──────────────┼─────────────────────────────────────────────────────────┘
                 │
                 │ Scheduled pg_dump / Instant Point-in-Time Restore
                 │
  ┌──────────────┴─────────────────────────────────────────────────────────┐
  │                 AUTOMATED BACKUPS & DISASTER RECOVERY                  │
  │                                                                        │
  │   [ Backup Daemon ] ──▶ Dumps to .sql.gz (devops/backup/dumps/)        │
  │   [ restore.sh ]    ──▶ Drops active sessions & restores in < 60s      │
  │   [ dr-test.sh ]    ──▶ Automated test drill in isolated sandbox       │
  └────────────────────────────────────────────────────────────────────────┘
```

### Architecture Data Flow Summary

| Component | Responsibility | Failure Behavior |
| :--- | :--- | :--- |
| **Status Page (`/status`)** | Public UI showing health cards and latency badges | If API is down, banner shows red "Service Unreachable" |
| **Health API (`/api/v1/health`)** | Executes live diagnostics across all dependencies | Returns `200 OK` (Healthy/Degraded) or `503` (Unhealthy) |
| **PostgreSQL Probe** | Measures DB query response time in milliseconds | Marks DB degraded/unhealthy if connection drops |
| **Redis Probe** | Measures Redis cache / socket roundtrip | Marks Redis degraded if cache is unreachable |
| **Disk Probe** | Checks free GB and percentage available on host | Alerts if disk free capacity drops below 10% |
| **Backup Daemon** | Automates periodic `pg_dump` with `.sql.gz` compression | Rotates rolling backups, pruning dumps older than 7 days |
| **Disaster Recovery** | Point-in-time recovery (`restore.sh`) & test drill (`dr-test.sh`)| Recovers complete database in `< 60 seconds` (RTO) |

---

## 3. Core Concepts & Mental Bridge (42 C to DevOps)

| 42 Systems Concept | DevOps / SRE Equivalent | How It Works in Our App |
| :--- | :--- | :--- |
| **`ping` / `kill(pid, 0)`** | **Health Probes** | Verifying if a process or service is responsive before routing user traffic to it. |
| **`errno` / Signal Handling** | **Degraded vs Unhealthy States** | A system isn't always binary (UP or DOWN). If Redis fails, chat degrades, but jobs still work. The status page reflects this nuance. |
| **`fork()` + Sandbox Exec** | **Disaster Recovery Drill** | Testing a database recovery in an isolated sandbox without risking production data. |
| **Ring Buffer / Rolling Array** | **Backup Retention Policy** | Storing rolling snapshots (e.g., keep the last 7 daily backups) and automatically freeing old ones to prevent disk saturation. |

---

## 4. Key Engineering Targets (SLA / SLO / RPO / RTO)

Evaluators love seeing concrete industry-standard metrics:

- **RTO (Recovery Time Objective)**: `< 60 seconds` — The maximum acceptable time to restore the database from an archive.
- **RPO (Recovery Point Objective)**: `< 1 hour` — The maximum data age that might be lost during catastrophic hardware destruction.
- **Probe Latency Budget**: `< 50 ms` — Time taken by the backend health probe to test DB + Redis + Disk and return a response.

---

## 5. Step-by-Step Task Breakdown

### Phase 1: Backend Deep Diagnostic Probe (COMPLETED ✅)
**Goal**: Build a robust, non-blocking health probe endpoint that measures actual subsystem connectivity and latency.

- [x] **Task 1.1**: Define minimal & secure SQLModel diagnostic schema in `backend/app/models.py`:
  - `ComponentHealth`: `status` (`healthy` | `degraded` | `unhealthy`), `latency_ms: float | None`, `message: str`.
  - `SystemHealth`: `status` (`healthy` | `degraded` | `unhealthy`), `timestamp: datetime`, `services: dict[str, ComponentHealth]`.
  - *Security Decision*: Omitted `uptime_seconds` and `environment` to prevent information disclosure (OWASP / CWE-200).
- [x] **Task 1.2**: Implement `GET /api/v1/health` in `backend/app/api/routes/health.py`:
  - **Database probe**: Executes lightweight `SELECT 1`, records execution roundtrip in milliseconds via `time.perf_counter()`.
  - **Redis probe**: Asynchronous `PING`, expects `PONG`, records roundtrip latency. Marked as `degraded` on failure (fault tolerance).
  - **Disk capacity probe**: Uses `shutil.disk_usage("/")` to inspect free storage percentage with sanitized messages (no raw GBs leaked to public).
  - **Status Logic**: Evaluates aggregate state; returns HTTP 200 for healthy/degraded and HTTP 503 for critical outages.
  - Registered router in `backend/app/api/main.py`.
- [x] **Task 1.3**: Verification & Live Testing:
  - Skipped redundant unit tests; verified live via `make dev` and direct HTTP queries returning 200 OK.

---

### Phase 2: Interactive Frontend Status Page (`/status`) (COMPLETED ✅)
**Goal**: Provide a clean public dashboard that presents system health, translates backend primitives into user-facing SaaS capabilities, and provides an evaluator live demo mode.

- [x] **Task 2.1**: Create `frontend/src/routes/status.tsx` registered in TanStack Router with full SEO metadata.
- [x] **Task 2.2**: Build the UI components:
  - **Overall Banner**: Dynamic status card — Green (*"All Systems Operational"*), Amber (*"Degraded Performance"*), or Red (*"System Outage"*).
  - **User-Facing Service Cards** (Mapping backend primitives to platform capabilities):
    - 🗄️ **Core Database & Marketplace** (`services.database`): Real-time query latency badge (e.g. `1.2 ms`) and operational state.
    - 💬 **Real-time Messaging & Chat Engine** (`services.cache`): Real-time ping latency badge and cache state.
    - 📁 **Media & File Storage** (`services.storage`): Sanitized storage status.
    - ⚡ **API Gateway**: Live HTTP connectivity and response roundtrip.
  - **Live Auto-Refresh & Countdown**: 10-second polling interval with a live countdown timer and manual "Refresh Now" trigger.
  - **Clean & Authentic SaaS UX**: Streamlined dashboard focusing on live telemetry, keeping the UI realistic like GitHub/Stripe status pages without clutter.
- [x] **Task 2.3**: Link `/status` in `landing-footer.tsx` and main navigation.

---

### Phase 3: Automated PostgreSQL Backup Engine (COMPLETED ✅)
**Goal**: Automate zero-downtime database snapshots with compression, integrity checks, and retention pruning.

- [x] **Task 3.1**: Create `devops/backup/backup.sh` (Core Backup Engine):
  - **Zero-Downtime Streaming**: Pipes `pg_dump` directly through `gzip -9` compression in memory (~85% disk space saved).
  - **Standardized Naming**: Timestamps formatted as `backup_skilio_YYYYMMDD_HHMMSS.sql.gz`.
  - **Archive Integrity Check**: Uses `gzip -t` CRC checksum validation to guarantee valid archives before keeping them.
  - **Dual-Layer Retention Policy**: Prunes snapshots older than 7 days (`-mtime +7`) AND enforces a strict count ceiling (`MAX_BACKUPS=7`, keeping oldest pruned first).
  - **Dual-Mode Execution**: Auto-detects if running inside a container (direct `pg_dump`) or on the host CLI (`docker compose exec -T db pg_dump`).
- [x] **Task 3.2**: Create `devops/backup/backup-list.sh` (Storage Inventory & Telemetry):
  - Scans `devops/backup/dumps/` and displays a clean ANSI-formatted table.
  - Shows snapshot index, archive name, compressed size (`du -h`), human-readable creation date, and `[LATEST]` badge.
  - Reports directory storage telemetry against quota (`TOTAL / MAX_BACKUPS` snapshots, total disk footprint).
- [x] **Task 3.3**: Create `devops/backup/entrypoint.sh` (Daemon Orchestration):
  - **Connection Gate**: Loops with `pg_isready -h db -U postgres` until PostgreSQL accepts connections.
  - **Day-Zero Verification**: Takes an immediate snapshot on container boot (`RUN_ON_STARTUP=true`) to verify credentials and storage immediately.
  - **Environment Persistence**: Generates a subshell wrapper (`/usr/local/bin/cron-backup.sh`) with explicit `export` statements so `crond` retains credentials.
  - **Live Log Forwarding**: Redirects cron output to `/proc/1/fd/1 2> /proc/1/fd/2` so `docker compose logs -f db-backup` streams output live.
  - **Clean Signal Termination**: Replaces bootstrap shell via `exec crond -f -l 2` as PID 1 for instant response to `docker stop` signals.
- [x] **Task 3.4**: Configure the Dockerized Backup Daemon in `compose.yml`:
  - Dedicated `db-backup` service using official `postgres:18-alpine` (~115MB, matching engine v18).
  - Configurable schedule via `BACKUP_SCHEDULE` (defaults to `0 2 * * *` / 2:00 AM daily).
  - Persistent volume mount `./devops/backup/dumps:/dumps` (cleanly ignored in root `.gitignore`).
- [x] **Task 3.5**: Integrate commands into `Makefile`:
  - `make backup`: Takes an immediate compressed live snapshot of PostgreSQL.
  - `make backup-list`: Displays inventory table of available snapshots with disk footprint.

---

### Phase 4: Instant Disaster Recovery & Automated Drill (COMPLETED ✅)
**Goal**: Enable 1-command database restoration and automated drill verification.

- [x] **Task 4.1**: Create `devops/backup/restore.sh` (COMPLETED ✅):
  - Automatically selects latest backup archive by default, or accepts specific file path or filename via argument `$1`.
  - Verifies gzip archive CRC integrity before touching the database.
  - Safely terminates active client connections (`pg_terminate_backend`) to prevent restore locks.
  - Streams decompressed SQL in memory (`gzip -dc | psql -v ON_ERROR_STOP=1`).
  - Validates and counts public tables post-restore (`17 public tables`).
- [x] **Task 4.2**: Create `devops/backup/dr-test.sh` (Automated DR Drill) (COMPLETED ✅):
  - Automatically verifies latest backup (or takes fresh one if none exist).
  - Creates isolated temporary sandbox database (`dr_drill_sandbox`).
  - Restores backup into sandbox database and verifies 100% table count match (`17 / 17 public tables`).
  - Guarantees zero downtime or disruption to active production database (`app`).
  - Drops temporary sandbox cleanly upon completion (or on failure/Ctrl+C via `trap`).
- [x] **Task 4.3**: Integrate recovery commands into `Makefile` (COMPLETED ✅):
  - [x] `make backup`: Run immediate on-demand backup.
  - [x] `make backup-list`: List available backups with timestamps and sizes.
  - [x] `make restore`: Restore from latest (or specified `FILE=...`) backup.
  - [x] `make dr-test`: Run live disaster recovery verification drill in sandbox (< 4s).

---

## 6. How to Defend This in the 42 Evaluation (Live Chaos Demo)

When the evaluator asks: *"Show me the Health Check, Status Page, and Disaster Recovery module"*, you execute this 3-step live demo:

1. **Demonstrate Live Telemetry**:
   - Open `http://localhost:5173/status` in the browser.
   - Point out the live database query latency (e.g. `1.5 ms`), Redis ping, and disk margins.
2. **Inject Chaos (Simulate Failure)**:
   - In terminal, stop the database:
     ```bash
     docker compose stop db
     ```
   - Watch the status page automatically turn **Red (Major Outage)** within 10 seconds:
     - `PostgreSQL: UNHEALTHY (Connection refused)`
     - Overall status shifts to `Outage Detected`.
3. **Restore Service & Disaster Recovery**:
   - Start the database back up:
     ```bash
     docker compose start db
     ```
   - Status page immediately recovers to **Green (All Systems Operational)**.
   - Run disaster recovery drill:
     ```bash
     make dr-test
     ```
   - Terminal shows: Backup archive verified -> Test database restored -> 100% data integrity verified in `< 5 seconds`.
   - **Evaluator signs off the 1 point on the spot.**
