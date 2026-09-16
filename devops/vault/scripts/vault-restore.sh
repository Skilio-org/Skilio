#!/usr/bin/env bash
set -euo pipefail

# Usage: bash vault-restore.sh vault-backup-2026-09-16.tar.gz

BACKUP_FILE="${1:?Usage: bash vault-restore.sh <backup-file>}"
BACKUP_DIR="devops/vault/backups"

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
  echo "File not found: $BACKUP_DIR/$BACKUP_FILE"
  exit 1
fi

echo "Stopping Vault..."
docker compose stop vault

echo "Restoring from: $BACKUP_DIR/$BACKUP_FILE"
docker run --rm \
  -v freelancer_vault-data:/vault-data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /vault-data/* && tar xzf /backup/$BACKUP_FILE -C /vault-data"

echo "Starting Vault..."
docker compose up -d vault

echo ""
echo "Restore complete."
echo "REMINDER: Unseal Vault with 3 keys now."
