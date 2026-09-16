#!/usr/bin/env bash
set -euo pipefail

# Where to save backups
BACKUP_DIR="devops/vault/backups"
mkdir -p "$BACKUP_DIR"

# Filename with today's date
BACKUP_FILE="$BACKUP_DIR/vault-backup-$(date +%Y-%m-%d).tar.gz"

# Stop Vault so the data isn't changing while we copy
echo "Stopping Vault..."
docker compose stop vault

# Copy the volume contents into a .tar.gz file
echo "Backing up vault-data volume..."
docker run --rm \
  -v freelancer_vault-data:/vault-data:ro \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/vault-backup-$(date +%Y-%m-%d).tar.gz" -C /vault-data .

# Restart Vault
echo "Starting Vault..."
docker compose up -d vault

echo ""
echo "Backup saved to: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
echo "REMINDER: After backup, someone must unseal Vault again (3 keys needed)"
