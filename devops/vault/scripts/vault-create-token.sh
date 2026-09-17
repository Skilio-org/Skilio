#!/usr/bin/env bash
set -euo pipefail

# Generates a Developer Read-Only Token for HCP Vault
# Usage:
#   export VAULT_ADDR="https://your-hcp-cluster.hashicorp.cloud:8200"
#   export VAULT_TOKEN="your-hcp-admin-token"
#   export VAULT_NAMESPACE="admin"
#   bash devops/vault/scripts/vault-create-token.sh <developer-name> [ttl]

NAME="${1:?Usage: bash devops/vault/scripts/vault-create-token.sh <developer-name> [ttl]}"
TTL="${2:-720h}" # Default: 30 days (720h)

VAULT_ADDR="${VAULT_ADDR:-https://vault-cluster-public-vault-f91a1ccc.eecb9a06.z1.hashicorp.cloud:8200}"
VAULT_TOKEN="${VAULT_TOKEN:?VAULT_TOKEN environment variable must be set to your HCP Vault admin token}"
VAULT_NAMESPACE="${VAULT_NAMESPACE:-admin}"

VAULT_ADDR="${VAULT_ADDR%/}"

echo "Creating token for '$NAME' (TTL: $TTL) on HCP Vault..."

RESPONSE=$(curl -s -f -X POST \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
  -H "Content-Type: application/json" \
  -d "{\"policies\": [\"developer-readonly\"], \"ttl\": \"${TTL}\", \"display_name\": \"${NAME}\"}" \
  "${VAULT_ADDR}/v1/auth/token/create")

CLIENT_TOKEN=$(echo "$RESPONSE" | jq -r '.auth.client_token // empty')

if [ -z "$CLIENT_TOKEN" ]; then
  echo "Error: Failed to create token. Response:" >&2
  echo "$RESPONSE" >&2
  exit 1
fi

echo ""
echo "=========================================================="
echo "  Developer Token Created for: $NAME"
echo "  Token: $CLIENT_TOKEN"
echo "  Validity: $TTL"
echo "=========================================================="
echo ""
echo "Send this token to $NAME. They can export it as VAULT_TOKEN to run vault-pull.sh."
