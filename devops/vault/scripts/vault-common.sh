#!/usr/bin/env bash
# vault-common.sh — Shared configuration and utilities for HCP Vault scripts
# Source this file from other vault scripts: source "$(dirname "${BASH_SOURCE[0]}")/vault-common.sh"

# ─── Colors ─────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  NC='\033[0m' # No Color
else
  RED='' GREEN='' YELLOW='' CYAN='' BOLD='' NC=''
fi

# ─── Load Vault credentials ─────────────────────────────────
# Searches for credentials in order: .env.vault (project root), devops/vault/.credentials/vault.env
vault_load_credentials() {
  if [ -f ".env.vault" ]; then
    set -a
    source ".env.vault"
    set +a
  elif [ -f "devops/vault/.credentials/vault.env" ]; then
    set -a
    source "devops/vault/.credentials/vault.env"
    set +a
  fi
}

# ─── Default configuration ──────────────────────────────────
# Single source of truth for the HCP Vault cluster address
VAULT_DEFAULT_ADDR="https://vault-cluster-public-vault-f91a1ccc.eecb9a06.z1.hashicorp.cloud:8200"

# ─── Set Vault variables ────────────────────────────────────
# Call after vault_load_credentials() to finalize environment
vault_configure() {
  VAULT_ADDR="${VAULT_ADDR:-$VAULT_DEFAULT_ADDR}"
  VAULT_ADDR="${VAULT_ADDR%/}" # Strip trailing slash
  VAULT_TOKEN="${VAULT_TOKEN:?VAULT_TOKEN must be set as an environment variable or defined in .env.vault}"
  VAULT_NAMESPACE="${VAULT_NAMESPACE:-admin}"
}

# ─── Connectivity check ─────────────────────────────────────
# Verifies: (1) Vault is reachable, (2) token is valid
# Returns 0 on success, 1 on failure
vault_check_connection() {
  echo -e "${CYAN}Connecting to HCP Vault at ${VAULT_ADDR}${NC}"
  echo -e "  Namespace: ${VAULT_NAMESPACE}"

  # 1. Check reachability via sys/health (unauthenticated endpoint)
  local health_response health_http_code
  health_response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    "${VAULT_ADDR}/v1/sys/health" 2>/dev/null || echo -e "\n000")

  health_http_code=$(echo "$health_response" | tail -n1)

  if [ "$health_http_code" = "000" ]; then
    echo -e "${RED}✗ Cannot reach Vault at ${VAULT_ADDR}${NC}" >&2
    echo -e "  Check your network connection and VAULT_ADDR." >&2
    return 1
  fi

  # sys/health returns 200 (initialized+unsealed), 429 (standby), 472 (DR secondary),
  # 473 (perf standby), 501 (not initialized), 503 (sealed)
  if [ "$health_http_code" = "501" ]; then
    echo -e "${RED}✗ Vault is not initialized (HTTP $health_http_code)${NC}" >&2
    return 1
  elif [ "$health_http_code" = "503" ]; then
    echo -e "${RED}✗ Vault is sealed (HTTP $health_http_code)${NC}" >&2
    return 1
  fi

  echo -e "  ${GREEN}✔ Vault is reachable (HTTP $health_http_code)${NC}"

  # 2. Validate token via token/lookup-self
  local token_response token_http_code
  token_response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    "${VAULT_ADDR}/v1/auth/token/lookup-self" 2>/dev/null || echo -e "\n000")

  token_http_code=$(echo "$token_response" | tail -n1)
  local token_body
  token_body=$(echo "$token_response" | sed '$d')

  if [ "$token_http_code" = "000" ]; then
    echo -e "${RED}✗ Token validation request failed${NC}" >&2
    return 1
  elif [ "$token_http_code" = "403" ]; then
    echo -e "${RED}✗ Token is invalid or expired (HTTP 403)${NC}" >&2
    echo -e "  Obtain a new token from your HCP Vault admin." >&2
    return 1
  elif [ "$token_http_code" -ge 400 ]; then
    echo -e "${RED}✗ Token lookup failed (HTTP $token_http_code)${NC}" >&2
    return 1
  fi

  # Extract token identity for display
  local display_name policies
  display_name=$(json_field_raw "$token_body" '.data.display_name // "unknown"')
  policies=$(json_field_raw "$token_body" '.data.policies // [] | join(", ")')

  echo -e "  ${GREEN}✔ Token valid${NC} — identity: ${BOLD}${display_name}${NC} (policies: ${policies})"
  return 0
}

# ─── JSON helpers ────────────────────────────────────────────

# Extract a raw jq expression from JSON. Falls back to python3 if jq is unavailable.
# Usage: json_field_raw "$json_string" '.data.display_name // "fallback"'
json_field_raw() {
  local json="$1"
  local jq_expr="$2"
  if [ -z "$json" ]; then
    echo ""
    return
  fi

  if command -v jq >/dev/null 2>&1; then
    echo "$json" | jq -r "$jq_expr" 2>/dev/null || echo ""
  elif command -v python3 >/dev/null 2>&1; then
    # Fallback: only supports simple .data.data.FIELD extractions
    echo "$json" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    parts = '''$jq_expr'''.replace(' // ', '||').split('.')
    result = data
    for p in parts:
        if p and p != '\"\"' and '||' not in p and '[' not in p:
            result = result.get(p, '')
            if result == '': break
    print(result if result else '')
except: print('')
" 2>/dev/null || echo ""
  else
    echo "Error: Neither jq nor python3 is installed." >&2
    exit 1
  fi
}

# Extract a field from a KV-v2 secret response (navigates .data.data.FIELD)
# Usage: kv2_field "$json_response" "field_name"
kv2_field() {
  local json="$1"
  local field="$2"
  if [ -z "$json" ]; then
    echo ""
    return
  fi

  if command -v jq >/dev/null 2>&1; then
    echo "$json" | jq -r ".data.data.\"$field\" // empty" 2>/dev/null || echo ""
  elif command -v python3 >/dev/null 2>&1; then
    echo "$json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('data', {}).get('$field', ''))" 2>/dev/null || echo ""
  else
    echo "Error: Neither jq nor python3 is installed." >&2
    exit 1
  fi
}

# ─── KV-v2 API helpers ──────────────────────────────────────

# Fetch a KV-v2 secret and return the response body + HTTP status.
# On failure, prints a warning and returns empty string.
# Usage: result=$(vault_kv_get "app")
vault_kv_get() {
  local path="$1"
  local url="${VAULT_ADDR}/v1/secret/data/production/${path}"

  local raw_response http_code body
  raw_response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    "${url}" 2>/dev/null || echo -e "\n000")

  http_code=$(echo "$raw_response" | tail -n1)
  body=$(echo "$raw_response" | sed '$d')

  if [ "$http_code" = "000" ]; then
    echo -e "  ${RED}✗ secret/production/${path} — network error${NC}" >&2
    echo ""
    return 1
  elif [ "$http_code" = "404" ]; then
    echo -e "  ${YELLOW}⚠ secret/production/${path} — not found (HTTP 404)${NC}" >&2
    echo ""
    return 1
  elif [ "$http_code" = "403" ]; then
    echo -e "  ${RED}✗ secret/production/${path} — permission denied (HTTP 403)${NC}" >&2
    echo ""
    return 1
  elif [ "$http_code" -ge 400 ]; then
    echo -e "  ${RED}✗ secret/production/${path} — error (HTTP $http_code)${NC}" >&2
    echo ""
    return 1
  fi

  echo -e "  ${GREEN}✔ secret/production/${path}${NC}" >&2
  echo "$body"
  return 0
}

# Post a KV-v2 secret. Returns 0 on success, 1 on failure.
# Usage: vault_kv_put "app" '{"data": {"key": "value"}}'
vault_kv_put() {
  local path="$1"
  local json_payload="$2"
  local url="${VAULT_ADDR}/v1/secret/data/production/${path}"

  local raw_response http_code
  raw_response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "${json_payload}" \
    "${url}" 2>/dev/null || echo -e "\n000")

  http_code=$(echo "$raw_response" | tail -n1)

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}✔ secret/production/${path}${NC}"
    return 0
  elif [ "$http_code" = "000" ]; then
    echo -e "  ${RED}✗ secret/production/${path} — network error${NC}" >&2
    return 1
  elif [ "$http_code" = "403" ]; then
    echo -e "  ${RED}✗ secret/production/${path} — permission denied (HTTP 403)${NC}" >&2
    return 1
  else
    echo -e "  ${RED}✗ secret/production/${path} — error (HTTP $http_code)${NC}" >&2
    return 1
  fi
}
