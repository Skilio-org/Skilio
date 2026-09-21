#!/usr/bin/env bash
set -euo pipefail

# Pulls secrets from hosted HCP Vault (HashiCorp Cloud Platform) and generates .env
# Usage:
#   export VAULT_TOKEN="your-hcp-vault-token"
#   bash devops/vault/scripts/vault-pull.sh
#
# Options:
#   --allow-fallbacks   Use default fallback values for missing secrets (for local dev)

# ─── Parse flags ────────────────────────────────────────────
ALLOW_FALLBACKS=false
for arg in "$@"; do
  case "$arg" in
    --allow-fallbacks) ALLOW_FALLBACKS=true ;;
    -h|--help)
      echo "Usage: bash devops/vault/scripts/vault-pull.sh [--allow-fallbacks]"
      echo ""
      echo "Pulls secrets from HCP Vault and generates a .env file."
      echo ""
      echo "Options:"
      echo "  --allow-fallbacks   Use default values for missing secrets (local dev only)"
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
SECRETS_OK=0
SECRETS_FAILED=0
WARNINGS=()

echo ""

# ─── Pre-flight: verify connectivity and token ──────────────
if ! vault_check_connection; then
  echo "" >&2
  echo -e "${RED}Cannot proceed — Vault connectivity check failed.${NC}" >&2
  exit 1
fi

echo ""
echo "Pulling secrets from HCP Vault..."
echo ""

# ─── Fetch all secret groups ────────────────────────────────
# Each fetch either succeeds (stores JSON) or fails (stores empty, prints warning)
# We avoid $() subshells for the counters to persist correctly.

_vault_fetch() {
  local name="$1"
  local var_name="$2"
  local result
  if result=$(vault_kv_get "$name"); then
    SECRETS_OK=$((SECRETS_OK + 1))
    eval "$var_name=\$result"
  else
    SECRETS_FAILED=$((SECRETS_FAILED + 1))
    WARNINGS+=("secret/production/${name}")
    eval "$var_name=''"
  fi
}

_vault_fetch "app" APP_JSON
_vault_fetch "database" DB_JSON
_vault_fetch "email" EMAIL_JSON
_vault_fetch "cloudinary" CLOUDINARY_JSON
_vault_fetch "google" GOOGLE_JSON
_vault_fetch "linkedin" LINKEDIN_JSON

# ─── Extract individual fields ──────────────────────────────
SECRET_KEY=$(kv2_field "$APP_JSON" "secret_key")
FIRST_SUPERUSER=$(kv2_field "$APP_JSON" "first_superuser")
FIRST_SUPERUSER_PASSWORD=$(kv2_field "$APP_JSON" "first_superuser_password")

POSTGRES_PASSWORD=$(kv2_field "$DB_JSON" "password")
DB_HOST=$(kv2_field "$DB_JSON" "host")
DB_PORT=$(kv2_field "$DB_JSON" "port")
DB_NAME=$(kv2_field "$DB_JSON" "name")

SMTP_HOST=$(kv2_field "$EMAIL_JSON" "smtp_host")
SMTP_PORT=$(kv2_field "$EMAIL_JSON" "smtp_port")
SMTP_TLS=$(kv2_field "$EMAIL_JSON" "smtp_tls")
EMAILS_FROM_EMAIL=$(kv2_field "$EMAIL_JSON" "from_email")

CLOUDINARY_CLOUD_NAME=$(kv2_field "$CLOUDINARY_JSON" "cloud_name")
CLOUDINARY_API_KEY=$(kv2_field "$CLOUDINARY_JSON" "api_key")
CLOUDINARY_API_SECRET=$(kv2_field "$CLOUDINARY_JSON" "api_secret")

GOOGLE_CLIENT_ID=$(kv2_field "$GOOGLE_JSON" "client_id")
GOOGLE_CLIENT_SECRET=$(kv2_field "$GOOGLE_JSON" "client_secret")
GOOGLE_REDIRECT_URI=$(kv2_field "$GOOGLE_JSON" "redirect_uri")
GOOGLE_TOKEN_URI=$(kv2_field "$GOOGLE_JSON" "token_uri")
GOOGLE_AUTH_URI=$(kv2_field "$GOOGLE_JSON" "auth_uri")
GOOGLE_USERINFO_URL=$(kv2_field "$GOOGLE_JSON" "userinfo_url")

LINKEDIN_CLIENT_ID=$(kv2_field "$LINKEDIN_JSON" "client_id")
LINKEDIN_CLIENT_SECRET=$(kv2_field "$LINKEDIN_JSON" "client_secret")
LINKEDIN_REDIRECT_URI=$(kv2_field "$LINKEDIN_JSON" "redirect_uri")
LINKEDIN_AUTH_URI=$(kv2_field "$LINKEDIN_JSON" "auth_uri")
LINKEDIN_TOKEN_URI=$(kv2_field "$LINKEDIN_JSON" "token_uri")
LINKEDIN_USERINFO_URL=$(kv2_field "$LINKEDIN_JSON" "userinfo_url")

# ─── Apply fallbacks (only if --allow-fallbacks was passed) ─
FALLBACK_USED=false

apply_fallback() {
  local var_name="$1"
  local fallback_value="$2"
  local current_value="${!var_name}"

  if [ -z "$current_value" ]; then
    if [ "$ALLOW_FALLBACKS" = true ]; then
      eval "$var_name=\"$fallback_value\""
      FALLBACK_USED=true
    fi
  fi
}

apply_fallback SECRET_KEY "changethis"
apply_fallback FIRST_SUPERUSER "admin@example.com"
apply_fallback FIRST_SUPERUSER_PASSWORD "changethis"
apply_fallback POSTGRES_PASSWORD "changethis"
apply_fallback DB_HOST "db"
apply_fallback DB_PORT "5432"
apply_fallback DB_NAME "app"
apply_fallback SMTP_HOST "mailpit"
apply_fallback SMTP_PORT "1025"
apply_fallback SMTP_TLS "false"
apply_fallback EMAILS_FROM_EMAIL "info@example.com"

# ─── Check for empty critical values ────────────────────────
EMPTY_CRITICAL=()
[ -z "$SECRET_KEY" ] && EMPTY_CRITICAL+=("SECRET_KEY")
[ -z "$POSTGRES_PASSWORD" ] && EMPTY_CRITICAL+=("POSTGRES_PASSWORD")
[ -z "$FIRST_SUPERUSER" ] && EMPTY_CRITICAL+=("FIRST_SUPERUSER")
[ -z "$FIRST_SUPERUSER_PASSWORD" ] && EMPTY_CRITICAL+=("FIRST_SUPERUSER_PASSWORD")

if [ ${#EMPTY_CRITICAL[@]} -gt 0 ] && [ "$ALLOW_FALLBACKS" = false ]; then
  echo ""
  echo -e "${RED}✗ Critical secrets are empty and --allow-fallbacks was not set:${NC}" >&2
  for var in "${EMPTY_CRITICAL[@]}"; do
    echo -e "  ${RED}• ${var}${NC}" >&2
  done
  echo "" >&2
  echo -e "  To use default dev values, re-run with: ${BOLD}--allow-fallbacks${NC}" >&2
  echo -e "  To fix, ensure the secrets exist in HCP Vault under secret/production/" >&2
  exit 1
fi

# ─── Write .env file (all values quoted for safety) ─────────
cat > "$ENV_FILE" <<EOF
FASTAPI_ENV=development

PROJECT_NAME="Freelancer"

SECRET_KEY="${SECRET_KEY}"
FIRST_SUPERUSER="${FIRST_SUPERUSER}"
FIRST_SUPERUSER_PASSWORD="${FIRST_SUPERUSER_PASSWORD}"

# Emails
SMTP_HOST="${SMTP_HOST}"
EMAILS_FROM_EMAIL="${EMAILS_FROM_EMAIL}"
SMTP_TLS="${SMTP_TLS}"
SMTP_PORT="${SMTP_PORT}"

# Postgres
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Cloudinary
CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}"
CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY}"
CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET}"

# Google OAuth 2
GOOGLE_USERINFO_URL="${GOOGLE_USERINFO_URL}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"
GOOGLE_REDIRECT_URI="${GOOGLE_REDIRECT_URI}"
GOOGLE_TOKEN_URI="${GOOGLE_TOKEN_URI}"
GOOGLE_AUTH_URI="${GOOGLE_AUTH_URI}"

# LinkedIn OAuth 2
LINKEDIN_CLIENT_ID="${LINKEDIN_CLIENT_ID}"
LINKEDIN_CLIENT_SECRET="${LINKEDIN_CLIENT_SECRET}"
LINKEDIN_REDIRECT_URI="${LINKEDIN_REDIRECT_URI}"
LINKEDIN_AUTH_URI="${LINKEDIN_AUTH_URI}"
LINKEDIN_TOKEN_URI="${LINKEDIN_TOKEN_URI}"
LINKEDIN_USERINFO_URL="${LINKEDIN_USERINFO_URL}"
EOF

# ─── Summary ────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $SECRETS_FAILED -eq 0 ]; then
  echo -e "  ${GREEN}✔ .env generated successfully${NC} — ${SECRETS_OK}/${SECRETS_OK} secret groups fetched"
else
  echo -e "  ${YELLOW}⚠ .env generated with warnings${NC} — ${SECRETS_OK} fetched, ${SECRETS_FAILED} failed"
  echo ""
  echo -e "  ${YELLOW}Failed secret paths:${NC}"
  for w in "${WARNINGS[@]}"; do
    echo -e "    ${YELLOW}• ${w}${NC}"
  done
fi

if [ "$FALLBACK_USED" = true ]; then
  echo ""
  echo -e "  ${YELLOW}⚠ Some values used dev fallback defaults (--allow-fallbacks)${NC}"
fi

echo ""
echo -e "  Output: ${BOLD}${ENV_FILE}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
