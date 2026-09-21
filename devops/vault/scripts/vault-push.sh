#!/usr/bin/env bash
set -euo pipefail

# Uploads secrets to HCP Vault (HashiCorp Cloud Platform)
# Usage:
#   export VAULT_TOKEN="your-hcp-vault-admin-token"
#   bash devops/vault/scripts/vault-push.sh
#
# Options:
#   --dry-run   Preview what will be pushed without writing to Vault

# ─── Parse flags ────────────────────────────────────────────
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -h|--help)
      echo "Usage: bash devops/vault/scripts/vault-push.sh [--dry-run]"
      echo ""
      echo "Uploads local .env secrets to HCP Vault under secret/production/."
      echo ""
      echo "Options:"
      echo "  --dry-run   Preview secrets that will be pushed (no writes)"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

# ─── Load shared utilities ──────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/vault-common.sh"

# ─── Initialize ─────────────────────────────────────────────
vault_load_credentials
vault_configure

ENV_FILE=".env"
PUSH_OK=0
PUSH_FAILED=0

echo ""

# ─── Pre-flight: verify connectivity and token ──────────────
if ! vault_check_connection; then
  echo "" >&2
  echo -e "${RED}Cannot proceed — Vault connectivity check failed.${NC}" >&2
  exit 1
fi

echo ""

# ─── Load local .env if it exists ───────────────────────────
if [ -f "$ENV_FILE" ]; then
  echo "Reading secrets from local ${ENV_FILE} file..."
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "No .env file found. Using current environment variables..."
fi

# ─── Resolve values with fallbacks ──────────────────────────
SECRET_KEY="${SECRET_KEY:-changethis}"
FIRST_SUPERUSER="${FIRST_SUPERUSER:-admin@example.com}"
FIRST_SUPERUSER_PASSWORD="${FIRST_SUPERUSER_PASSWORD:-changethis}"

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-changethis}"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-app}"

SMTP_HOST="${SMTP_HOST:-mailpit}"
SMTP_PORT="${SMTP_PORT:-1025}"
SMTP_TLS="${SMTP_TLS:-false}"
EMAILS_FROM_EMAIL="${EMAILS_FROM_EMAIL:-info@example.com}"

CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:-}"
CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY:-}"
CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET:-}"

GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-}"
GOOGLE_REDIRECT_URI="${GOOGLE_REDIRECT_URI:-http://localhost:8000/api/v1/login/google/callback}"
GOOGLE_TOKEN_URI="${GOOGLE_TOKEN_URI:-https://oauth2.googleapis.com/token}"
GOOGLE_AUTH_URI="${GOOGLE_AUTH_URI:-https://accounts.google.com/o/oauth2/auth}"
GOOGLE_USERINFO_URL="${GOOGLE_USERINFO_URL:-https://www.googleapis.com/oauth2/v3/userinfo}"

LINKEDIN_CLIENT_ID="${LINKEDIN_CLIENT_ID:-}"
LINKEDIN_CLIENT_SECRET="${LINKEDIN_CLIENT_SECRET:-}"
LINKEDIN_REDIRECT_URI="${LINKEDIN_REDIRECT_URI:-http://localhost:8000/api/v1/login/linkedin/callback}"
LINKEDIN_AUTH_URI="${LINKEDIN_AUTH_URI:-https://www.linkedin.com/oauth/v2/authorization}"
LINKEDIN_TOKEN_URI="${LINKEDIN_TOKEN_URI:-https://www.linkedin.com/oauth/v2/accessToken}"
LINKEDIN_USERINFO_URL="${LINKEDIN_USERINFO_URL:-https://api.linkedin.com/v2/userinfo}"

# ─── Ensure KV-v2 secrets engine is enabled ─────────────────
if [ "$DRY_RUN" = false ]; then
  curl -s -X POST \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    -H "Content-Type: application/json" \
    -d '{"type": "kv", "options": {"version": "2"}}' \
    "${VAULT_ADDR}/v1/sys/mounts/secret" >/dev/null 2>&1 || true
fi

# ─── Build payloads ─────────────────────────────────────────
# Constructs JSON payloads for each secret group
APP_PAYLOAD=$(cat <<EOF
{
  "data": {
    "secret_key": "${SECRET_KEY}",
    "first_superuser": "${FIRST_SUPERUSER}",
    "first_superuser_password": "${FIRST_SUPERUSER_PASSWORD}"
  }
}
EOF
)

DB_PAYLOAD=$(cat <<EOF
{
  "data": {
    "password": "${POSTGRES_PASSWORD}",
    "host": "${DB_HOST}",
    "port": "${DB_PORT}",
    "name": "${DB_NAME}"
  }
}
EOF
)

EMAIL_PAYLOAD=$(cat <<EOF
{
  "data": {
    "smtp_host": "${SMTP_HOST}",
    "smtp_port": "${SMTP_PORT}",
    "smtp_tls": "${SMTP_TLS}",
    "from_email": "${EMAILS_FROM_EMAIL}"
  }
}
EOF
)

CLOUDINARY_PAYLOAD=$(cat <<EOF
{
  "data": {
    "cloud_name": "${CLOUDINARY_CLOUD_NAME}",
    "api_key": "${CLOUDINARY_API_KEY}",
    "api_secret": "${CLOUDINARY_API_SECRET}"
  }
}
EOF
)

GOOGLE_PAYLOAD=$(cat <<EOF
{
  "data": {
    "client_id": "${GOOGLE_CLIENT_ID}",
    "client_secret": "${GOOGLE_CLIENT_SECRET}",
    "redirect_uri": "${GOOGLE_REDIRECT_URI}",
    "token_uri": "${GOOGLE_TOKEN_URI}",
    "auth_uri": "${GOOGLE_AUTH_URI}",
    "userinfo_url": "${GOOGLE_USERINFO_URL}"
  }
}
EOF
)

LINKEDIN_PAYLOAD=$(cat <<EOF
{
  "data": {
    "client_id": "${LINKEDIN_CLIENT_ID}",
    "client_secret": "${LINKEDIN_CLIENT_SECRET}",
    "redirect_uri": "${LINKEDIN_REDIRECT_URI}",
    "auth_uri": "${LINKEDIN_AUTH_URI}",
    "token_uri": "${LINKEDIN_TOKEN_URI}",
    "userinfo_url": "${LINKEDIN_USERINFO_URL}"
  }
}
EOF
)

# ─── Dry-run or push ────────────────────────────────────────
declare -A SECRETS_MAP=(
  ["app"]="$APP_PAYLOAD"
  ["database"]="$DB_PAYLOAD"
  ["email"]="$EMAIL_PAYLOAD"
  ["cloudinary"]="$CLOUDINARY_PAYLOAD"
  ["google"]="$GOOGLE_PAYLOAD"
  ["linkedin"]="$LINKEDIN_PAYLOAD"
)

# Define order explicitly (associative arrays have no guaranteed order)
SECRET_ORDER=("app" "database" "email" "cloudinary" "google" "linkedin")

if [ "$DRY_RUN" = true ]; then
  echo -e "${CYAN}══ DRY RUN — No changes will be written to Vault ══${NC}"
  echo ""

  for name in "${SECRET_ORDER[@]}"; do
    echo -e "  ${BOLD}secret/production/${name}${NC}"
    # Show field names (not values, for security)
    if command -v jq >/dev/null 2>&1; then
      echo "${SECRETS_MAP[$name]}" | jq -r '.data | keys[]' 2>/dev/null | while read -r key; do
        local_val=$(echo "${SECRETS_MAP[$name]}" | jq -r ".data.\"$key\"" 2>/dev/null)
        if [ -z "$local_val" ]; then
          echo -e "    ${YELLOW}• ${key}: (empty)${NC}"
        else
          # Show first 4 chars + masked remainder
          masked="${local_val:0:4}$(printf '%*s' $((${#local_val} - 4)) '' | tr ' ' '•')"
          echo -e "    • ${key}: ${masked}"
        fi
      done
    else
      echo "    (install jq for field-level preview)"
    fi
    echo ""
  done

  echo -e "${CYAN}══ End dry run. Re-run without --dry-run to push. ══${NC}"
  echo ""
  exit 0
fi

# ─── Push secrets ───────────────────────────────────────────
echo "Uploading secrets to HCP Vault..."
echo ""

for name in "${SECRET_ORDER[@]}"; do
  if vault_kv_put "$name" "${SECRETS_MAP[$name]}"; then
    PUSH_OK=$((PUSH_OK + 1))
  else
    PUSH_FAILED=$((PUSH_FAILED + 1))
  fi
done

# ─── Summary ────────────────────────────────────────────────
TOTAL=$((PUSH_OK + PUSH_FAILED))
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $PUSH_FAILED -eq 0 ]; then
  echo -e "  ${GREEN}✔ All secrets pushed successfully${NC} — ${PUSH_OK}/${TOTAL} stored"
else
  echo -e "  ${YELLOW}⚠ Push completed with errors${NC} — ${PUSH_OK} succeeded, ${PUSH_FAILED} failed"
fi

echo ""
echo "  Vault path: secret/production/*"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $PUSH_FAILED -gt 0 ]; then
  exit 1
fi
