# Disaster Recovery (DR) Plan & Operational Procedures

This document outlines the standard operating procedures, failure scenarios, and recovery protocols for the **ft_transcendence** Freelancer platform, in compliance with the DevOps Minor Module requirements.

---

## 1. Objectives & Metrics

| Metric | Target | Description |
| :--- | :--- | :--- |
| **RTO (Recovery Time Objective)** | **< 3 minutes** | Time required to restore service availability after an outage or data loss event. |
| **RPO (Recovery Point Objective)** | **< 1 hour** | Maximum acceptable data loss window, governed by the automated backup schedule. |
| **Backup Frequency** | **Hourly (60m)** | Configurable via `BACKUP_INTERVAL_SECONDS` in `.env` / `compose.yml`. |
| **Retention Policy** | **Last 10 snapshots** | Auto-pruning keeps the 10 most recent `.sql.gz` archives in `devops/backup/dumps/`. |

---

## 2. Architecture & Components

```
                   ┌────────────────────────────────────────┐
                   │          Traefik Reverse Proxy         │
                   └───────────────────┬────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌───────────────────────┐                    ┌───────────────────────┐
     │  Frontend (/status)   │                    │     Backend API       │
     │   Live Status Page    │◄─── polls health ──│  /api/v1/utils/health │
     └───────────────────────┘                    └───────────┬───────────┘
                                                              │
                                                              ▼
                                                  ┌───────────────────────┐
                                                  │   PostgreSQL (db)     │
                                                  │  (app-db-data volume) │
                                                  └───────────▲───────────┘
                                                              │
                                                  ┌───────────┴───────────┐
                                                  │     backup-daemon     │
                                                  │  (Automated Hourly)   │
                                                  └───────────┬───────────┘
                                                              │
                                                              ▼
                                                  ┌───────────────────────┐
                                                  │ devops/backup/dumps/  │
                                                  │ (*.sql.gz archives)   │
                                                  └───────────────────────┘
```

- **Health Monitoring:** 
  - Docker Liveness: `curl -f http://localhost:8000/api/v1/utils/health-check/`
  - Deep Status Endpoint: `/api/v1/utils/health/detailed` (DB query latency, disk space, secrets)
  - Public UI: `https://<domain>/status` (or `http://localhost/status`)
- **Automated Backup Daemon:** `backup-daemon` sidecar service container running `postgres:18-alpine`.

---

## 3. Incident Scenarios & Response Procedures

### Scenario A: Database Volume Corruption or Deletion

**Incident:** The database volume was deleted (`docker volume rm freelancer_app-db-data`), corrupted, or the container failed to boot.

1. **Verify Status:**
   - Navigate to `/status`. The database indicator displays **Unhealthy** (Red) and overall status is **Outage Detected**.
2. **Recreate the Database Container:**
   ```bash
   docker compose up -d db
   ```
3. **Restore from Latest Automated Backup:**
   ```bash
   bash devops/backup/restore.sh -y
   ```
4. **Restart Dependent Services:**
   ```bash
   docker compose restart backend
   ```
5. **Verify Recovery:**
   - Refresh `/status`. The database turns **Healthy** (Green) and latency is reported in milliseconds.

---

### Scenario B: Accidental Table Drop or Corrupted Data

**Incident:** A bad migration or accidental `DROP TABLE` command occurred in production.

1. **Isolate Traffic:**
   - Stop accepting new user requests during restoration:
     ```bash
     docker compose stop backend
     ```
2. **List Available Snapshots:**
   ```bash
   ls -lh devops/backup/dumps/
   ```
3. **Restore Selected Known-Good Backup:**
   ```bash
   bash devops/backup/restore.sh devops/backup/dumps/<selected_snapshot>.sql.gz
   ```
4. **Restart Backend:**
   ```bash
   docker compose start backend
   ```
5. **Verify Data Integrity:**
   - Query key tables (users, skills, jobs) to confirm record counts match pre-incident state.

---

### Scenario C: Complete Host Failure & Bare-Metal Migration

**Incident:** The server host machine suffered catastrophic hardware failure. A new host has been provisioned.

1. **Clone Repository & Load Secrets:**
   ```bash
   git clone <repository_url>
   cd Freelancer
   make env   # Pulls production secrets from HCP Vault into .env
   ```
2. **Transfer Latest Backup:**
   - Copy the latest `.sql.gz` dump from the secondary backup storage into `devops/backup/dumps/`.
3. **Launch Stack:**
   ```bash
   docker compose -f compose.yml -f compose.deploy.yml up -d
   ```
4. **Restore Database:**
   ```bash
   bash devops/backup/restore.sh -y
   ```
5. **Full Health Check:**
   - Visit `https://<domain>/status` and ensure all subsystems report **Operational**.

---

## 4. Evaluator Verification Drill

During peer-evaluation, execute the automated drill script to demonstrate the disaster recovery procedure in under 60 seconds:

```bash
# Run the automated DR verification drill:
make dr-test
# Or directly:
bash devops/backup/dr-drill.sh
```

**What the drill does:**
1. Triggers an on-demand database snapshot.
2. Verifies gzip integrity and file size of the dump.
3. Tests database connectivity and executes restoration.
4. Verifies SQL table counts (users, skills) to guarantee zero data loss.
5. Measures and reports the RTO achieved.
