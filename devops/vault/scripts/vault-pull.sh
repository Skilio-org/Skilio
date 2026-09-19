#!/usr/bin/env bash
set -euo pipefail

# Pulls secrets from hosted HCP Vault (HashiCorp Cloud Platform) and generates .env
# Usage:
#   export VAULT_ADDR="https://your-hcp-cluster.hashicorp.cloud:8200"
#   export VAULT_TOKEN="your-hcp-vault-token"
#   export VAULT_NAMESPACE="admin"
#   bash devops/vault/scripts/vault-pull.sh

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

VAULT_ADDR="${VAULT_ADDR:-https://vault-cluster-public-vault-f91a1ccc.eecb9a06.z1.hashicorp.cloud:8200}"
VAULT_TOKEN="${VAULT_TOKEN:?VAULT_TOKEN must be set as an environment variable or defined in .env.vault}"
VAULT_NAMESPACE="${VAULT_NAMESPACE:-admin}"
ENV_FILE=".env"

VAULT_ADDR="${VAULT_ADDR%/}"

# Look up who this token belongs to
TOKEN_INFO=$(curl -s \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
  "${VAULT_ADDR}/v1/auth/token/lookup-self" 2>/dev/null || echo "")

if [ -n "$TOKEN_INFO" ] && command -v jq >/dev/null 2>&1; then
  TOKEN_DISPLAY_NAME=$(echo "$TOKEN_INFO" | jq -r '.data.display_name // empty')
  TOKEN_POLICIES=$(echo "$TOKEN_INFO" | jq -r '.data.policies // [] | join(", ")')
elif [ -n "$TOKEN_INFO" ] && command -v python3 >/dev/null 2>&1; then
  TOKEN_DISPLAY_NAME=$(echo "$TOKEN_INFO" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('display_name', ''))" 2>/dev/null || echo "")
  TOKEN_POLICIES=$(echo "$TOKEN_INFO" | python3 -c "import sys, json; data=json.load(sys.stdin); print(', '.join(data.get('data', {}).get('policies', [])))" 2>/dev/null || echo "")
fi

TOKEN_DISPLAY_NAME="${TOKEN_DISPLAY_NAME:-unknown}"
TOKEN_POLICIES="${TOKEN_POLICIES:-unknown}"

echo "Connecting to HCP Vault at $VAULT_ADDR"
echo "  Namespace: $VAULT_NAMESPACE"
echo "  Token identity: $TOKEN_DISPLAY_NAME (policies: $TOKEN_POLICIES)"

# Helper function to query KV-v2 secrets via HTTP REST API
get_secret_json() {
  local path="$1"
  local url="${VAULT_ADDR}/v1/secret/data/production/${path}"

  local response
  response=$(curl -s -f \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -H "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    "${url}" 2>/dev/null || echo "")

  if [ -z "$response" ]; then
    echo "Warning: Could not fetch secret at 'secret/production/${path}'. Ensure path exists and token has access." >&2
  fi
  echo "$response"
}

# Helper function to extract a field value from JSON
json_field() {
  local json="$1"
  local field="$2"
  if [ -z "$json" ]; then
    echo ""
    return
  fi

  if command -v jq >/dev/null 2>&1; then
    echo "$json" | jq -r ".data.data.\"$field\" // empty"
  elif command -v python3 >/dev/null 2>&1; then
    echo "$json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('data', {}).get('$field', ''))"
  else
    echo "Error: Neither jq nor python3 is installed." >&2
    exit 1
  fi
}

echo "Pulling secrets from HCP Vault..."

APP_JSON=$(get_secret_json "app")
DB_JSON=$(get_secret_json "database")
EMAIL_JSON=$(get_secret_json "email")
CLOUDINARY_JSON=$(get_secret_json "cloudinary")
GOOGLE_JSON=$(get_secret_json "google")
LINKEDIN_JSON=$(get_secret_json "linkedin")

SECRET_KEY=$(json_field "$APP_JSON" secret_key)
FIRST_SUPERUSER=$(json_field "$APP_JSON" first_superuser)
FIRST_SUPERUSER_PASSWORD=$(json_field "$APP_JSON" first_superuser_password)

POSTGRES_PASSWORD=$(json_field "$DB_JSON" password)
DB_HOST=$(json_field "$DB_JSON" host)
DB_PORT=$(json_field "$DB_JSON" port)
DB_NAME=$(json_field "$DB_JSON" name)

SMTP_HOST=$(json_field "$EMAIL_JSON" smtp_host)
SMTP_PORT=$(json_field "$EMAIL_JSON" smtp_port)
SMTP_TLS=$(json_field "$EMAIL_JSON" smtp_tls)
EMAILS_FROM_EMAIL=$(json_field "$EMAIL_JSON" from_email)

CLOUDINARY_CLOUD_NAME=$(json_field "$CLOUDINARY_JSON" cloud_name)
CLOUDINARY_API_KEY=$(json_field "$CLOUDINARY_JSON" api_key)
CLOUDINARY_API_SECRET=$(json_field "$CLOUDINARY_JSON" api_secret)

GOOGLE_CLIENT_ID=$(json_field "$GOOGLE_JSON" client_id)
GOOGLE_CLIENT_SECRET=$(json_field "$GOOGLE_JSON" client_secret)
GOOGLE_REDIRECT_URI=$(json_field "$GOOGLE_JSON" redirect_uri)
GOOGLE_TOKEN_URI=$(json_field "$GOOGLE_JSON" token_uri)
GOOGLE_AUTH_URI=$(json_field "$GOOGLE_JSON" auth_uri)
GOOGLE_USERINFO_URL=$(json_field "$GOOGLE_JSON" userinfo_url)

LINKEDIN_CLIENT_ID=$(json_field "$LINKEDIN_JSON" client_id)
LINKEDIN_CLIENT_SECRET=$(json_field "$LINKEDIN_JSON" client_secret)
LINKEDIN_REDIRECT_URI=$(json_field "$LINKEDIN_JSON" redirect_uri)
LINKEDIN_AUTH_URI=$(json_field "$LINKEDIN_JSON" auth_uri)
LINKEDIN_TOKEN_URI=$(json_field "$LINKEDIN_JSON" token_uri)
LINKEDIN_USERINFO_URL=$(json_field "$LINKEDIN_JSON" userinfo_url)

# Fallbacks for missing values
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

# Write .env file
cat > "$ENV_FILE" <<EOF
FASTAPI_ENV=development

PROJECT_NAME="Freelancer"

SECRET_KEY=$SECRET_KEY
FIRST_SUPERUSER=$FIRST_SUPERUSER
FIRST_SUPERUSER_PASSWORD=$FIRST_SUPERUSER_PASSWORD

# Emails
SMTP_HOST=$SMTP_HOST
EMAILS_FROM_EMAIL=$EMAILS_FROM_EMAIL
SMTP_TLS=$SMTP_TLS
SMTP_PORT=$SMTP_PORT

# Postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Cloudinary
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

# Google OAuth 2
GOOGLE_USERINFO_URL=$GOOGLE_USERINFO_URL
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI
GOOGLE_TOKEN_URI=$GOOGLE_TOKEN_URI
GOOGLE_AUTH_URI=$GOOGLE_AUTH_URI

# LinkedIn OAuth 2
LINKEDIN_CLIENT_ID=$LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET=$LINKEDIN_CLIENT_SECRET
LINKEDIN_REDIRECT_URI=$LINKEDIN_REDIRECT_URI
LINKEDIN_AUTH_URI=$LINKEDIN_AUTH_URI
LINKEDIN_TOKEN_URI=$LINKEDIN_TOKEN_URI
LINKEDIN_USERINFO_URL=$LINKEDIN_USERINFO_URL
EOF

echo ""
echo "✔ .env file generated successfully from HCP Vault."
