#!/usr/bin/env bash
set -euo pipefail

# Restores a pg_dump backup into the running Postgres container.
# Usage:
#   bash devops/backup/restore.sh                          # restore latest backup
#   bash devops/backup/restore.sh devops/backup/dumps/2026-09-17_22-00-00.sql.gz  # restore specific file

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dumps"

# Determine which backup to restore
if [ "${1:-}" != "" ]; then
  BACKUP_FILE="$1"
else
  # Find the most recent backup
  BACKUP_FILE=$(ls -1t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -n1 || echo "")
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: No backup file found."
  echo ""
  echo "Usage:"
  echo "  bash devops/backup/restore.sh                     # restore latest"
  echo "  bash devops/backup/restore.sh path/to/backup.sql.gz  # restore specific file"
  echo ""
  if ls -1 "${BACKUP_DIR}"/*.sql.gz &>/dev/null; then
    echo "Available backups:"
    ls -1t "${BACKUP_DIR}"/*.sql.gz | while read -r f; do
      SIZE=$(du -h "$f" | cut -f1)
      echo "  $(basename "$f")  (${SIZE})"
    done
  else
    echo "No backups found in ${BACKUP_DIR}/"
  fi
  exit 1
fi

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "⚠️  This will OVERWRITE the current database with:"
echo "   File: $(basename "$BACKUP_FILE") (${SIZE})"
echo ""

# Prompt for confirmation
read -p "Are you sure? Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

# Check that the db container is running
if ! docker compose ps --status running db --quiet 2>/dev/null | grep -q .; then
  echo "❌ Error: 'db' container is not running."
  echo "   Start it first with: docker compose up -d db"
  exit 1
fi

echo ""
echo "🔄 Restoring database..."

# Decompress and pipe into psql
gunzip -c "$BACKUP_FILE" | docker compose exec -T db psql -U postgres -d app --quiet

echo "✔  Database restored from: $(basename "$BACKUP_FILE")"
echo ""
echo "💡 Tip: Restart the backend to clear any cached state:"
echo "   docker compose restart backend"
