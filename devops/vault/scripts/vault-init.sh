#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-myroot}"
CONTAINER="${VAULT_CONTAINER:-vault}"

v() {
  docker compose exec -e VAULT_ADDR="$VAULT_ADDR" -e VAULT_TOKEN="$VAULT_TOKEN" "$CONTAINER" vault "$@"
}

# Wait for Vault to be ready
echo "Waiting for Vault..."
until v status > /dev/null 2>&1; do
  sleep 1
done
echo "Vault is ready."

# Enable KV-v2 secrets engine (idempotent)
if ! v secrets list -format=json | grep -q '"secret/"'; then
  v secrets enable -path=secret kv-v2
  echo "KV-v2 secrets engine enabled."
else
  echo "KV-v2 secrets engine already enabled."
fi

# Store all project secrets (organized by category)

v kv put secret/production/app \
  secret_key="changethis" \
  first_superuser="admin@example.com" \
  first_superuser_password="changethis"
echo "App secrets stored."

v kv put secret/production/database \
  username="postgres" \
  password="changethis" \
  host="db" \
  port="5432" \
  name="app"
echo "Database secrets stored."

v kv put secret/production/email \
  smtp_host="mailpit" \
  smtp_port="1025" \
  smtp_tls="false" \
  from_email="info@example.com"
echo "Email secrets stored."

v kv put secret/production/cloudinary \
  cloud_name="example.fhmrask.getitfromclaudinary.org" \
  api_key="example.fhmrask.getitfromclaudinary.org" \
  api_secret="example.fhmrask.getitfromclaudinary.org"
echo "Cloudinary secrets stored."

v kv put secret/production/google \
  client_id="id" \
  client_secret="changethis" \
  redirect_uri="http://localhost:8000/api/v1/login/google/callback" \
  token_uri="https://oauth2.googleapis.com/token" \
  auth_uri="https://accounts.google.com/o/oauth2/auth" \
  userinfo_url="https://www.googleapis.com/oauth2/v3/userinfo"
echo "Google OAuth secrets stored."

# Write policy inline (avoids docker cp UID issues)
docker compose exec -T "$CONTAINER" sh -c 'cat > /home/vault/app-readonly.hcl' < devops/vault/policies/app-readonly.hcl
v policy write app-readonly /home/vault/app-readonly.hcl
echo "Policy 'app-readonly' written."

# Enable AppRole auth (idempotent)
if ! v auth list -format=json | grep -q '"approle/"'; then
  v auth enable approle
  echo "AppRole auth enabled."
else
  echo "AppRole auth already enabled."
fi

# Configure AppRole role
v write auth/approle/role/app-readonly-role \
  token_policies="app-readonly" \
  token_ttl=1h \
  token_max_ttl=4h \
  secret_id_ttl=24h
echo "AppRole role 'app-readonly-role' configured."

# Retrieve credentials
ROLE_ID=$(v read -field=role_id auth/approle/role/app-readonly-role/role-id)
SECRET_ID=$(v write -field=secret_id -f auth/approle/role/app-readonly-role/secret-id)

echo ""
echo "=== AppRole Credentials ==="
echo "ROLE_ID=$ROLE_ID"
echo "SECRET_ID=$SECRET_ID"

# Save credentials for other scripts/services
mkdir -p devops/vault/.credentials
cat > devops/vault/.credentials/approle.env <<EOF
VAULT_ROLE_ID=$ROLE_ID
VAULT_SECRET_ID=$SECRET_ID
EOF

echo "Credentials saved to devops/vault/.credentials/approle.env"
