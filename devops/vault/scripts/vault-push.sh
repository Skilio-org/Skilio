#!/usr/bin/env bash
set -euo pipefail

# Uploads secrets to HCP Vault (HashiCorp Cloud Platform)
# Usage:
#   export VAULT_ADDR="https://your-hcp-cluster.hashicorp.cloud:8200"
#   export VAULT_TOKEN="your-hcp-vault-token"
#   export VAULT_NAMESPACE="admin"
#   bash devops/vault/scripts/vault-push.sh

# Load local .env.vault file if present
if [ -f ".env.vault" ]; then
  set -a
  source ".env.vault"
  set +a
elif [ -f "devops/vault/.credentials/vault.env" ]; then
  set -a
  source "devops/vault/.credentials/vault.env"
  set +a
fi

ENV_FILE=".env"
VAULT_ADDR="${VAULT_ADDR:-https://vault-cluster-public-vault-f91a1ccc.eecb9a06.z1.hashicorp.cloud:8200}"
VAULT_TOKEN="${VAULT_TOKEN:?VAULT_TOKEN environment variable must be set to your HCP Vault admin token}"
VAULT_NAMESPACE="${VAULT_NAMESPACE:-admin}"

VAULT_ADDR="${VAULT_ADDR%/}"

echo "Connecting to HCP Vault at $VAULT_ADDR (Namespace: $VAULT_NAMESPACE)..."

# Load local .env if it exists
if [ -f "$ENV_FILE" ]; then
  echo "Reading secrets from local $ENV_FILE file..."
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "No .env file found. Using current environment variables..."
fi

# Fallback values if variables are unset
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

# Ensure KV-v2 secrets engine is enabled at secret/
curl -s -X POST \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
  -H "Content-Type: application/json" \
  -d '{"type": "kv", "options": {"version": "2"}}' \
  "${VAULT_ADDR}/v1/sys/mounts/secret" >/dev/null 2>&1 || true

# Helper function to post JSON payload to HCP Vault KV-v2 endpoint
post_secret_json() {
  local path="$1"
  local json_payload="$2"
  local url="${VAULT_ADDR}/v1/secret/data/production/${path}"

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "${json_payload}" \
    "${url}")

  local http_code
  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo "✔ Successfully stored secret/production/${path}"
  else
    echo "❌ Error storing secret/production/${path} (HTTP $http_code)" >&2
    echo "$response" | sed '$d' >&2
  fi
}

echo "Uploading secrets to HCP Vault..."

# 1. App secrets
post_secret_json "app" "$(cat <<EOF
{
  "data": {
    "secret_key": "${SECRET_KEY}",
    "first_superuser": "${FIRST_SUPERUSER}",
    "first_superuser_password": "${FIRST_SUPERUSER_PASSWORD}"
  }
}
EOF
)"

# 2. Database secrets
post_secret_json "database" "$(cat <<EOF
{
  "data": {
    "password": "${POSTGRES_PASSWORD}",
    "host": "${DB_HOST}",
    "port": "${DB_PORT}",
    "name": "${DB_NAME}"
  }
}
EOF
)"

# 3. Email secrets
post_secret_json "email" "$(cat <<EOF
{
  "data": {
    "smtp_host": "${SMTP_HOST}",
    "smtp_port": "${SMTP_PORT}",
    "smtp_tls": "${SMTP_TLS}",
    "from_email": "${EMAILS_FROM_EMAIL}"
  }
}
EOF
)"

# 4. Cloudinary secrets
post_secret_json "cloudinary" "$(cat <<EOF
{
  "data": {
    "cloud_name": "${CLOUDINARY_CLOUD_NAME}",
    "api_key": "${CLOUDINARY_API_KEY}",
    "api_secret": "${CLOUDINARY_API_SECRET}"
  }
}
EOF
)"

# 5. Google OAuth secrets
post_secret_json "google" "$(cat <<EOF
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
)"

# 6. LinkedIn OAuth secrets
post_secret_json "linkedin" "$(cat <<EOF
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
)"

echo ""
echo "All secrets pushed to HCP Vault under 'secret/production/'!"
