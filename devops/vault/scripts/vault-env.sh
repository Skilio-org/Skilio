#!/usr/bin/env bash
set -euo pipefail

# Pulls secrets from Vault and generates the .env file
# Usage: bash devops/vault/scripts/vault-env.sh

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-myroot}"
CONTAINER="${VAULT_CONTAINER:-vault}"
ENV_FILE=".env"

v() {
  docker compose exec -e VAULT_ADDR="$VAULT_ADDR" -e VAULT_TOKEN="$VAULT_TOKEN" "$CONTAINER" vault "$@" 2>/dev/null
}

# Get a single field from a secret path
get() {
  v kv get -field="$2" "secret/production/$1"
}

# Wait for Vault
echo "Connecting to Vault..."
until v status > /dev/null 2>&1; do
  sleep 1
done

echo "Pulling secrets from Vault..."

# Read all secrets
SECRET_KEY=$(get app secret_key)
FIRST_SUPERUSER=$(get app first_superuser)
FIRST_SUPERUSER_PASSWORD=$(get app first_superuser_password)

POSTGRES_PASSWORD=$(get database password)
DB_HOST=$(get database host)
DB_PORT=$(get database port)
DB_NAME=$(get database name)

SMTP_HOST=$(get email smtp_host)
SMTP_PORT=$(get email smtp_port)
SMTP_TLS=$(get email smtp_tls)
EMAILS_FROM_EMAIL=$(get email from_email)

CLOUDINARY_CLOUD_NAME=$(get cloudinary cloud_name)
CLOUDINARY_API_KEY=$(get cloudinary api_key)
CLOUDINARY_API_SECRET=$(get cloudinary api_secret)

GOOGLE_CLIENT_ID=$(get google client_id)
GOOGLE_CLIENT_SECRET=$(get google client_secret)
GOOGLE_REDIRECT_URI=$(get google redirect_uri)
GOOGLE_TOKEN_URI=$(get google token_uri)
GOOGLE_AUTH_URI=$(get google auth_uri)
GOOGLE_USERINFO_URL=$(get google userinfo_url)

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
EOF

echo ""
echo ".env file generated from Vault."
echo "You can now run: docker compose up"
