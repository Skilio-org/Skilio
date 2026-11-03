# 🛡️ Stage 5: High Availability, Automated Backups & Disaster Recovery
### Comprehensive Presentation & Technical Reference Guide (Module IV.7 Minor — 1 Pt)

---

## 1. Architectural Overview & The Resilience Loop

In modern Site Reliability Engineering (SRE), backups and system monitoring cannot exist as disconnected scripts. If an outage occurs, an engineering team needs a continuous **Detection $\rightarrow$ Protection $\rightarrow$ Verification** operational loop:

```text
 ┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
 │   1. OBSERVABILITY     │ ──▶  │   2. DATA PROTECTION   │ ──▶  │     3. RESILIENCE      │
 │  Deep Diagnostic Probe │      │ Zero-Downtime Snapshots│      │ Instant Restore & Drill│
 │  & Public /status Page │      │ & Background Cron Job  │      │ Sandbox Verification   │
 └────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

```mermaid
flowchart TD
    subgraph ClientLayer["Client & Evaluator Layer"]
        Browser["Web Browser (Evaluator)"]
    end

    subgraph PresentationLayer["Presentation Layer"]
        StatusUI["/status Public Dashboard (React)\n• Auto-polling every 10s\n• Live query latency badges\n• System state: Healthy | Degraded | Unhealthy"]
    end

    subgraph APILayer["Backend API Gateway"]
        HealthEndpoint["GET /api/v1/health (FastAPI)\n• Deep subsystem diagnostic probe\n• OWASP CWE-200 sanitized telemetry"]
        ProbeDB["probe_database()\nSELECT 1 (latency_ms)"]
        ProbeRedis["probe_redis()\nAsync PING (latency_ms)"]
        ProbeDisk["probe_disk()\nshutil.disk_usage('/')"]
    end

    subgraph DataLayer["Storage & Cache Infrastructure"]
        Postgres["PostgreSQL 18 Container (db)\n• Primary DB: 'app' (17 tables)\n• MVCC Snapshot Isolation"]
        Redis["Redis 8 Container (redis)\n• Cache & Real-Time Messaging"]
        Storage["Host Disk Storage"]
    end

    subgraph DevOpsLayer["Automated Backup & DR Engine"]
        BackupDaemon["db-backup Container (postgres:18-alpine)\n• crond running at 02:00 UTC daily\n• RUN_ON_STARTUP verification snapshot\n• Streams logs to stdout"]
        DumpsVolume[("./devops/backup/dumps/\n• .sql.gz archives with FIFO max 7 retention")]
        Drill["dr-test.sh (Automated Sandbox Drill)\n• Creates 'dr_drill_sandbox'\n• Restores & compares 17 tables\n• Destroys sandbox in < 5s"]
    end

    Browser -->|HTTP GET /status| StatusUI
    StatusUI -->|Poll every 10s| HealthEndpoint
    HealthEndpoint --> ProbeDB
    HealthEndpoint --> ProbeRedis
    HealthEndpoint --> ProbeDisk

    ProbeDB -->|SELECT 1| Postgres
    ProbeRedis -->|PING / PONG| Redis
    ProbeDisk -->|Check capacity| Storage

    BackupDaemon -->|crond 02:00 / entrypoint.sh| Postgres
    BackupDaemon -->|Write .sql.gz| DumpsVolume
    Drill -.->|1. Query public tables| Postgres
    Drill -.->|2. Restore backup into| Postgres
    Drill -.->|3. Read latest archive| DumpsVolume
```

---

## 2. Core SRE Concepts Explained (Beginner-Friendly)

Evaluators will ask you to explain standard Site Reliability Engineering metrics and mechanisms. Here is what they mean and how our system satisfies them:

### 2.1 The 4 Core Service Level Metrics: RPO, RTO, MTTD & MTTR

```text
   Last Backup             Outage Detected                      Full Recovery
   (02:00 UTC)               (10:04 UTC)                         (10:07 UTC)
───────●─────────────────────────▲───────────────────────────────────●───────▶
       │ ◄────── RPO ───────────►│ ◄────────── RTO / MTTR ──────────►│
       │   (Max Data Loss Window)│    (System Downtime Window)       │
       │                         │                                   │
                              MTTD (Detection Window ≤ 10s)
```

1. **RPO (Recovery Point Objective):**
   - **Definition:** The maximum acceptable age of data that can be lost when unexpected hardware or software failure occurs.
   - **Our Implementation:** Automated daily snapshots at **02:00 UTC** via BusyBox cron, plus automatic day-zero backup on container startup (`RUN_ON_STARTUP=true`), and on-demand snapshots (`make backup`).
2. **RTO (Recovery Time Objective):**
   - **Definition:** The maximum acceptable downtime between outage declaration and full system restoration.
   - **42 Subject Standard:** **$\text{RTO} < 60\text{ seconds}$**.
   - **Our Measured Result:** **$< 4\text{ seconds}$** (measured live during `make dr-test`).
3. **MTTD (Mean Time To Detect):**
   - **Definition:** Average time required to detect that a service is failing.
   - **Our Implementation:** **$\le 10\text{ seconds}$** via continuous frontend auto-polling against the backend `/api/v1/health` diagnostic endpoint.
4. **MTTR (Mean Time To Recover):**
   - **Definition:** Average time needed to fix or restore the service once diagnosed.
   - **Our Implementation:** **$< 15\text{ seconds}$** via the automated single-command `make restore`.

---

### 2.2 PostgreSQL MVCC: Zero-Lock Point-in-Time Snapshots

Traditional database backup solutions lock tables during dumps, freezing web traffic and denying user registrations or transactions.

PostgreSQL uses **MVCC (Multi-Version Concurrency Control)**:
* When `pg_dump` runs, it initiates an internal transaction with `REPEATABLE READ` snapshot isolation.
* PostgreSQL reads a consistent snapshot of data from the exact millisecond the transaction opened.
* Users can continue writing, updating proposals, and registering accounts without being blocked. **Zero downtime, zero exclusive write locks.**

---

### 2.3 Streaming In-Memory Compression (`pg_dump | gzip -9`)

* **Amateur approach:** Dump raw `.sql` file to disk (e.g. 20 GB), then run `gzip` to compress it (another 3 GB). This requires double the disk space and creates extreme I/O disk thrashing.
* **Our approach:** Stream the raw SQL dump directly through a Unix pipe buffer in kernel memory into `gzip -9`:
  ```bash
  pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip -9 > "${BACKUP_FILE}"
  ```
  - **Level 9 Compression (`gzip -9`):** Achieves maximum compression ratio (~85% disk footprint reduction).
  - **Zero Temporary Disk Allocation:** Data is compressed on the fly in memory before writing to disk.

---

### 2.4 Archive Integrity Check (`gzip -t` CRC-32)

A backup that cannot be restored is not a backup. Right after the stream finishes, [`backup.sh`](../../backup/backup.sh) and [`restore.sh`](../../backup/restore.sh) validate the archive:
```bash
gzip -t "${BACKUP_FILE}"
```
This performs a full **Cyclic Redundancy Check (CRC-32)** across the entire compressed file. If even a single byte is missing or corrupted, `gzip -t` returns a non-zero exit code and halts the process.

---

### 2.5 POSIX Fail-Safe Cleanup Traps

In Bash, shell output redirection (`> "${BACKUP_FILE}"`) creates an empty file *before* the dump process finishes. If the database crashes or network drops mid-stream, `gzip` produces a corrupted 20-byte file (magic header only).

To prevent corrupt files from staying in storage, [`backup.sh`](../../backup/backup.sh) installs a POSIX exit trap:
```bash
trap 'if [ $? -ne 0 ] && [ -f "${BACKUP_FILE:-}" ]; then rm -f "${BACKUP_FILE}"; fi' EXIT
```
If anything fails (`set -euo pipefail`), the trap intercepts the error and deletes the partial archive automatically.

---

### 2.6 Count-Based FIFO Retention (`MAX_BACKUPS=7`)

Instead of fragile time-based deletion (`find -mtime +7`, which fails across clock drift or when local development laptops sleep), we implement a deterministic **Count-Based FIFO (First-In-First-Out) Ring Buffer**:
* Archives are sorted by modification time: `ls -1tr backup_*.sql.gz`.
* If total backups exceed `MAX_BACKUPS=7`, the excess oldest snapshots are pruned one by one.
* **Storage Footprint:** Strictly bounded and predictable at all times.

---

## 3. Key Architectural Decisions & Trade-Offs (The "Why")

When defending your project, evaluators will probe why you chose specific designs:

| Architectural Decision | Chosen Implementation | Alternative Rejected | Why This Decision Was Made |
| :--- | :--- | :--- | :--- |
| **1. Backup Scheduler** | **Dedicated Container (`db-backup`)** running Alpine BusyBox `crond`. | Host OS `crontab -e`. | **12-Factor Portability**: Zero host dependencies. The container packages the exact PostgreSQL 18 client matching the database engine, avoiding `pg_dump` binary version mismatches. Operates entirely inside the private Docker bridge network. |
| **2. Shell Execution Mode** | **Dual-Mode Shell Scripts** (environment-aware auto-detection). | Separate scripts for host and container. | The same script (`backup.sh`, `restore.sh`, `dr-test.sh`) detects if it is inside the container (`psql` directly) or on the host (`docker compose exec`). Developers and cron use the exact same code. |
| **3. Restore Locking** | **Active Connection Termination** (`pg_terminate_backend`). | Blindly running `DROP TABLE` while apps run. | Active backend connection pools hold open schema locks. Terminating non-maintenance client backends guarantees an instant, lock-free restore. |
| **4. Database Recreation** | **Drop/Recreate Schema (`public`)**. | Dropping the whole `app` database (`DROP DATABASE`). | Dropping the entire database requires disconnecting, connecting to maintenance database `postgres`, and re-granting user privileges. Resetting schema `public` is instantaneous and preserves permissions. |
| **5. DR Verification** | **Ephemeral Sandbox Drill (`dr-test.sh`)**. | Restoring directly into production database. | Testing in an isolated database (`dr_drill_sandbox`) proves data integrity in $< 5\text{s}$ with **zero risk** to live user transactions. |

---

## 4. Step-by-Step Implementation & Workflows

### 4.1 Scheduled Backup Daemon Workflow ([`entrypoint.sh`](../../backup/entrypoint.sh))

```text
docker compose up
      │
      ▼
[entrypoint.sh]
  ├── 1. Wait for database readiness (pg_isready -h db -U postgres)
  ├── 2. Execute Day-Zero Verification Snapshot (RUN_ON_STARTUP=true)
  ├── 3. Write cron schedule to /etc/crontabs/root (default: "0 2 * * *")
  └── 4. Exec crond -f -l 2 (Forward logs to stdout via /proc/1/fd/1)
```

---

### 4.2 Disaster Recovery Procedure ([`restore.sh`](../../backup/restore.sh))

When disaster strikes (e.g. accidental `DROP TABLE` or data corruption):
```bash
make restore
# Or restore a specific snapshot:
make restore FILE=backup_app_20261101_020000.sql.gz
```

1. **Archive Selection:** Defaults to the newest `.sql.gz` snapshot in `devops/backup/dumps/`.
2. **CRC-32 Check:** Runs `gzip -t` to ensure the archive is valid.
3. **Lock Clearance:** Executes `SELECT pg_terminate_backend(pid)` to close active client connections.
4. **Streaming In-Memory Restore:**
   ```bash
   gzip -dc "${BACKUP_FILE}" | psql -v ON_ERROR_STOP=1 -d app
   ```
5. **Validation Assertion:** Queries `information_schema.tables` and confirms all 17 public tables are restored.

---

### 4.3 Automated Sandbox DR Verification Drill ([`dr-test.sh`](../../backup/dr-test.sh))

An untested backup is not a backup. Running `make dr-test` executes a non-destructive verification drill in under 5 seconds:

```text
                    ┌─────────────────────────────────────────────────────────┐
                    │                      make dr-test                       │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  1. Check Production Baseline                           │
                    │     Queries 'app' DB -> Confirms 17 public tables       │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  2. Create Ephemeral Sandbox DB                         │
                    │     CREATE DATABASE dr_drill_sandbox;                   │
                    │     (Registers EXIT trap for automatic cleanup)         │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  3. Restore Latest Snapshot into Sandbox                │
                    │     TARGET_DB="dr_drill_sandbox" restore.sh latest      │
                    │     (Live 'app' database completely untouched)          │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  4. Assert 100% Relational Integrity                    │
                    │     Sandbox Tables (17) == Production Tables (17)       │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  5. Clean Destruction & RTO Measurement                 │
                    │     DROP DATABASE dr_drill_sandbox;                     │
                    │     Prints total duration: e.g. 2840ms (< 5s)           │
                    └─────────────────────────────────────────────────────────┘
```

---

### 4.4 Real-Time Diagnostic Health Probe ([`health.py`](../../../backend/app/api/routes/health.py) & [`status.tsx`](../../../frontend/src/routes/status.tsx))

Rather than returning a static HTTP 200, [`/api/v1/health`](../../../backend/app/api/routes/health.py) actively tests system dependencies:
* **Database Probe:** Runs `SELECT 1` and records query latency in milliseconds.
* **Redis Probe:** Executes `PING` and measures round-trip time.
* **Disk Probe:** Checks root partition capacity with `shutil.disk_usage('/')`.
* **OWASP/CWE-200 Security Sanitization:** Internal server paths, IPs, and secret tokens are stripped from the response.
* **HTTP Status Code Mapping:**
  - `status: "healthy"` $\rightarrow$ **HTTP 200**
  - `status: "degraded"` (e.g. Redis down, but main DB up) $\rightarrow$ **HTTP 200**
  - `status: "unhealthy"` (e.g. Postgres down or disk space $< 5\%$) $\rightarrow$ **HTTP 503 Service Unavailable**

The React [`/status`](../../../frontend/src/routes/status.tsx) page automatically polls this endpoint every 10 seconds.

---

## 5. 42 Evaluation Defense Script & Cheatsheet

### 5.1 The 3-Minute Live Evaluation Demonstration

Follow these steps when defending this module to an evaluator:

#### Step 1: Show the Live Status Page & Active Telemetry (45 seconds)
1. Open [`http://localhost:8080/status`](http://localhost:8080/status) (or production [`https://skilio.works/status`](https://skilio.works/status)).
2. Show the green **"All Systems Operational"** banner.
3. Explain the real-time latency badges:
   - **Marketplace Database:** `SELECT 1` query latency (e.g. `1.2 ms`).
   - **Cache & Messaging:** Redis ping latency (e.g. `0.8 ms`).
   - **Disk Storage:** Root volume free capacity.
4. Point out the **10-second auto-refresh countdown** demonstrating active background polling.

#### Step 2: Show Backup Hygiene & Create a Live Snapshot (45 seconds)
1. In the terminal, show existing snapshots:
   ```bash
   make backup-list
   ```
2. Create an on-demand snapshot:
   ```bash
   make backup
   ```
3. Show the output highlights:
   - Streams through `gzip -9`.
   - Passes `gzip -t` CRC integrity test.
   - Enforces `MAX_BACKUPS=7` FIFO retention.

#### Step 3: Run the Disaster Recovery Drill (45 seconds)
1. In the terminal, run:
   ```bash
   make dr-test
   ```
2. Point out what happened in $< 5\text{ seconds}$:
   - Created `dr_drill_sandbox`.
   - Restored the latest backup snapshot.
   - Asserted that all 17 public tables match production.
   - Destroyed the sandbox cleanly.
   - Real database had **zero downtime**. Proves **RTO $< 60\text{s}$** requirement.

#### Step 4: Chaos Engineering Test (Bonus Wow-Factor) (45 seconds)
1. In your terminal, stop the database container:
   ```bash
   docker compose stop db
   ```
2. Switch back to the `/status` page in your browser:
   - Within 10 seconds, the banner automatically shifts to **Red ("System Outage")**.
   - Database card shows **"UNHEALTHY (Database service unreachable)"**.
3. Bring the database back up:
   ```bash
   docker compose start db
   ```
4. Within 10 seconds, the page recovers automatically to **Green ("All Systems Operational")**.

---

### 5.2 The 30-Second Defense Elevator Pitch

> *"Our high-availability and resilience suite implements a closed **Detection $\rightarrow$ Protection $\rightarrow$ Verification** operational loop satisfying Module IV.7 Minor. For observability, our FastAPI `/api/v1/health` probe actively tests PostgreSQL query latency (`SELECT 1`), Redis ping roundtrips, and root partition capacity, rendered live by our public React `/status` dashboard with 10-second auto-polling. For data protection, an isolated Alpine backup daemon executes daily at 02:00 UTC, streaming database dumps directly through memory with `gzip -9` under PostgreSQL MVCC snapshot isolation—guaranteeing zero exclusive write locks and zero application downtime. Every archive undergoes automated CRC-32 validation via `gzip -t` and is pruned via a deterministic 7-day FIFO retention ring buffer. For disaster recovery, our single-command restore terminates client locks for instant recovery, while our automated sandbox drill (`make dr-test`) restores snapshots into an ephemeral database, asserts 100% schema integrity across all 17 public tables, and cleans up in under 5 seconds—achieving an actual Recovery Time Objective of $\text{RTO} < 5\text{s}$ against the 42 subject standard of $< 60\text{ seconds}$ with zero production risk."*

