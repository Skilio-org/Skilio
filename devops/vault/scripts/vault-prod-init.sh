#!/usr/bin/env bash
set -euo pipefail

# Production Vault initialization — run ONCE after first deploy
# This generates unseal keys and a root token
# SAVE THE OUTPUT SECURELY — you cannot recover unseal keys later

COMPOSE_FILES="-f compose.yml -f compose.deploy.yml"

echo "Waiting for Vault container..."
until docker compose $COMPOSE_FILES exec vault vault status -format=json 2>/dev/null | grep -q '"initialized"'; do
  sleep 2
done

echo "Initializing Vault..."
docker compose $COMPOSE_FILES exec vault vault operator init \
  -key-shares=5 \
  -key-threshold=3 \
  -format=json > devops/vault/.credentials/vault-init.json

echo ""
echo "========================================="
echo "  SAVE THESE KEYS SECURELY"
echo "  They will NOT be shown again!"
echo "========================================="
cat devops/vault/.credentials/vault-init.json
echo ""
echo "To unseal Vault, run 3 of the 5 unseal keys:"
echo "  docker compose $COMPOSE_FILES exec vault vault operator unseal <KEY>"
