#!/usr/bin/env bash
set -euo pipefail

echo "Starting Vault..."
docker compose up -d vault

echo "Generating .env from Vault..."
bash devops/vault/scripts/vault-env.sh

echo "Starting all services..."
docker compose up "$@"
