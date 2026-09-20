#!/usr/bin/env bash
set -euo pipefail

# Generates a Developer Read-Only Token for HCP Vault
# Usage:
#   export VAULT_TOKEN="your-hcp-admin-token"
#   bash devops/vault/scripts/vault-create-token.sh <developer-name> [ttl]

NAME="${1:?Usage: bash devops/vault/scripts/vault-create-token.sh <developer-name> [ttl]}"
TTL="${2:-720h}" # Default: 30 days (720h)

# ─── Load shared utilities ──────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/vault-common.sh"

# ─── Initialize ─────────────────────────────────────────────
vault_load_credentials
vault_configure

echo ""

# ─── Pre-flight: verify connectivity and token ──────────────
if ! vault_check_connection; then
  echo "" >&2
  echo -e "${RED}Cannot proceed — Vault connectivity check failed.${NC}" >&2
  exit 1
fi

echo ""
echo "Creating token for '${NAME}' (TTL: ${TTL}) on HCP Vault..."

RESPONSE=$(curl -s -f -X POST \
  --connect-timeout 10 \
  --max-time 15 \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
  -H "Content-Type: application/json" \
  -d "{\"policies\": [\"developer-readonly\"], \"ttl\": \"${TTL}\", \"display_name\": \"${NAME}\"}" \
  "${VAULT_ADDR}/v1/auth/token/create")

CLIENT_TOKEN=$(echo "$RESPONSE" | jq -r '.auth.client_token // empty')

if [ -z "$CLIENT_TOKEN" ]; then
  echo -e "${RED}Error: Failed to create token. Response:${NC}" >&2
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
