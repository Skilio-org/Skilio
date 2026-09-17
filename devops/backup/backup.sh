#!/usr/bin/env bash
set -euo pipefail

# Creates a compressed pg_dump backup from the running Postgres container.
# Usage:
#   bash devops/backup/backup.sh              # uses defaults
#   bash devops/backup/backup.sh mybackup     # custom label
#   KEEP_LAST=5 bash devops/backup/backup.sh  # keep only 5 backups

LABEL="${1:-}"
KEEP_LAST="${KEEP_LAST:-10}"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dumps"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"

if [ -n "$LABEL" ]; then
  FILENAME="${TIMESTAMP}_${LABEL}.sql.gz"
else
  FILENAME="${TIMESTAMP}.sql.gz"
fi

mkdir -p "$BACKUP_DIR"

echo "🗄  Backing up database..."
echo "   Container: db | Database: app | User: postgres"

# Check that the db container is running
if ! docker compose ps --status running db --quiet 2>/dev/null | grep -q .; then
  echo "❌ Error: 'db' container is not running."
  echo "   Start it first with: docker compose up -d db"
  exit 1
fi

# Run pg_dump inside the container and compress locally
docker compose exec -T db pg_dump -U postgres --clean --if-exists app \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "✔  Backup saved: devops/backup/dumps/${FILENAME} (${SIZE})"

# Prune old backups, keeping the most recent $KEEP_LAST
TOTAL=$(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l)
if [ "$TOTAL" -gt "$KEEP_LAST" ]; then
  REMOVE_COUNT=$((TOTAL - KEEP_LAST))
  ls -1t "${BACKUP_DIR}"/*.sql.gz | tail -n "$REMOVE_COUNT" | while read -r old; do
    rm "$old"
    echo "🗑  Pruned old backup: $(basename "$old")"
  done
fi

echo ""
echo "Backups on disk: $(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l) / max ${KEEP_LAST}"
