#!/usr/bin/env sh
set -eu

# Automated Backup Daemon for ft_transcendence
# Periodically dumps Postgres DB, compresses it, and prunes older archives.

POSTGRES_HOST="${POSTGRES_HOST:-db}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-app}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-3600}"
KEEP_LAST="${BACKUP_KEEP_LAST:-10}"

mkdir -p "$BACKUP_DIR"

echo "====================================================="
echo " Starting Automated Backup Daemon"
echo " Target DB: ${POSTGRES_USER}@${POSTGRES_HOST}:5432/${POSTGRES_DB}"
echo " Backup interval: ${INTERVAL}s | Retention: Keep last ${KEEP_LAST}"
echo "====================================================="

# Wait for PostgreSQL server to be ready
echo "Waiting for PostgreSQL database at ${POSTGRES_HOST}:5432..."
until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q; do
  sleep 2
done
echo "PostgreSQL is ready. Automated backup scheduler active."

perform_backup() {
  TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
  FILENAME="${TIMESTAMP}_auto.sql.gz"
  TARGET_PATH="${BACKUP_DIR}/${FILENAME}"

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting automated database backup..."

  export PGPASSWORD="$POSTGRES_PASSWORD"
  if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" --clean --if-exists "$POSTGRES_DB" | gzip > "$TARGET_PATH"; then
    SIZE=$(du -h "$TARGET_PATH" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup successfully created: ${FILENAME} (${SIZE})"

    # Prune old archives beyond retention policy
    TOTAL=$(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l)
    if [ "$TOTAL" -gt "$KEEP_LAST" ]; then
      REMOVE_COUNT=$((TOTAL - KEEP_LAST))
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pruning ${REMOVE_COUNT} old backup(s) exceeding retention limit of ${KEEP_LAST}..."
      ls -1t "${BACKUP_DIR}"/*.sql.gz | tail -n "$REMOVE_COUNT" | while read -r old_file; do
        rm -f "$old_file"
        echo "  Deleted: $(basename "$old_file")"
      done
    fi
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: pg_dump backup failed!" >&2
  fi
}

# Run first backup on startup
perform_backup

# Continuous loop
while true; do
  sleep "$INTERVAL"
  perform_backup
done
