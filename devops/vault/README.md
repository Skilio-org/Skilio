# HashiCorp Vault (HCP) — Secrets Management & Development Guide

This repository integrates with **HashiCorp Cloud Platform (HCP) Vault** to securely store, manage, and distribute environment configurations and secrets without committing `.env` files to version control.

---

## Table of Contents

1. [Architecture & Secret Layout](#architecture--secret-layout)
2. [Prerequisites & Authentication](#prerequisites--authentication)
3. [Quick Start for Developers](#quick-start-for-developers)
4. [Available Commands](#available-commands)
5. [Managing Team Tokens](#managing-team-tokens)
6. [Updating & Pushing Secrets (Admin)](#updating--pushing-secrets-admin)
7. [Running a Standalone Local Vault Dev Server (Offline Mode)](#running-a-standalone-local-vault-dev-server-offline-mode)
8. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architecture & Secret Layout

* **Cluster Type**: HCP Vault Dedicated (Managed Cloud)
* **Default Cluster URL**: `https://vault-cluster-public-vault-f91a1ccc.eecb9a06.z1.hashicorp.cloud:8200`
* **Namespace**: `admin`
* **Secrets Engine**: KV Version 2 (`kv-v2`) mounted at `secret/`
* **Root Path**: `secret/data/production/`

### Secret Groups

| Path | Keys | Purpose |
| :--- | :--- | :--- |
| `secret/data/production/app` | `secret_key`, `first_superuser`, `first_superuser_password` | Application encryption & initial admin account |
| `secret/data/production/database` | `password`, `host`, `port`, `name` | PostgreSQL connection parameters |
| `secret/data/production/email` | `smtp_host`, `smtp_port`, `smtp_tls`, `from_email` | Mail delivery / Mailpit settings |
| `secret/data/production/cloudinary` | `cloud_name`, `api_key`, `api_secret` | Media asset storage |
| `secret/data/production/google` | `client_id`, `client_secret`, `redirect_uri`, `token_uri`, `auth_uri`, `userinfo_url` | Google OAuth 2.0 social login |
| `secret/data/production/linkedin` | `client_id`, `client_secret`, `redirect_uri`, `auth_uri`, `token_uri`, `userinfo_url` | LinkedIn OAuth 2.0 social login |

---

## Prerequisites & Authentication

Vault scripts automatically search for credentials in the following order:

1. **`.env.vault`** in the repository root:
   ```bash
   VAULT_TOKEN="hvs.CAES..."
   ```
2. **`devops/vault/.credentials/vault.env`**
3. **Environment Variable**: `export VAULT_TOKEN="hvs.CAES..."`

Optional overrides:
* `VAULT_ADDR` — overrides the default HCP Vault endpoint.
* `VAULT_NAMESPACE` — defaults to `admin`.

---

## Quick Start for Developers

1. **Obtain a developer token** from your team administrator.
2. **Save your token** in the project root:
   ```bash
   echo 'VAULT_TOKEN="your-token-here"' > .env.vault
   ```
3. **Generate your local `.env` and start the stack**:
   ```bash
   make dev
   ```
   *This command pulls secrets from Vault into `.env` and boots all Docker services (`docker compose up -d`).*

---

## Available Commands

The following `make` targets and bash scripts are available:

### Daily Development

```bash
# Pull secrets and immediately start all containers
make dev

# Pull secrets from HCP Vault into .env with fallback defaults for missing keys (Recommended)
make env-dev

# Strict secret pull (fails if critical values like SECRET_KEY or POSTGRES_PASSWORD are missing)
make env
```

### Direct Script Execution
If you are on Windows Git Bash, WSL, or macOS/Linux:

```bash
# Pull with safe local development fallbacks
bash devops/vault/scripts/vault-pull.sh --allow-fallbacks

# Strict pull
bash devops/vault/scripts/vault-pull.sh
```

---

## Managing Team Tokens

Administrators can issue read-only, time-bound tokens scoped specifically for developers.

### Developer Read-Only Policy
Permissions are defined in [`devops/vault/policies/developer-readonly.hcl`](./policies/developer-readonly.hcl), granting:
* Read & list access on `secret/data/production/*`
* Metadata listing on `secret/metadata/production/*`
* No write, delete, or administrative privileges.

### Generate a Developer Token

```bash
# Generate token for a developer (defaults to 720h / 30 days)
make token NAME=john_doe

# Specify custom TTL (e.g., 90 days)
make token NAME=john_doe TTL=2160h

# Or call the script directly:
bash devops/vault/scripts/vault-create-token.sh john_doe 720h
```

Share the output token securely with the developer to place in their `.env.vault`.

---

## Updating & Pushing Secrets (Admin)

When updating configuration keys locally and pushing them to Vault:

```bash
# 1. Preview changes before pushing (Dry Run)
make push-dry
# Or: bash devops/vault/scripts/vault-push.sh --dry-run

# 2. Upload values from local .env to HCP Vault
make push
# Or: bash devops/vault/scripts/vault-push.sh
```

---

## Running a Standalone Local Vault Dev Server (Offline Mode)

If working without HCP internet connectivity or testing changes in complete isolation:

### 1. Launch a Local Vault Server

**Option A: Via Docker**
```bash
docker run -d --name vault-dev \
  -p 8200:8200 \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=root' \
  hashicorp/vault
```

**Option B: Via Vault CLI**
```bash
vault server -dev -dev-root-token-id="root"
```

### 2. Configure Local Shell Environment
```bash
export VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_TOKEN="root"
export VAULT_NAMESPACE=""  # Local dev mode does not use HCP namespaces
```

### 3. Initialize Engines and Seed Sample Secrets
```bash
# Enable KV-v2 engine
vault secrets enable -path=secret kv-v2

# Populate app secrets
vault kv put secret/production/app \
  secret_key="local-dev-secret-key" \
  first_superuser="admin@example.com" \
  first_superuser_password="changethis"

# Populate database secrets
vault kv put secret/production/database \
  password="changethis" \
  host="db" \
  port="5432" \
  name="app"

# Populate email secrets
vault kv put secret/production/email \
  smtp_host="mailpit" \
  smtp_port="1025" \
  smtp_tls="false" \
  from_email="info@example.com"
```

### 4. Pull to `.env`
```bash
bash devops/vault/scripts/vault-pull.sh --allow-fallbacks
```

---

## Troubleshooting & FAQ

### `✗ Token is invalid or expired (HTTP 403)`
* **Cause**: Your token expired or was revoked.
* **Fix**: Request a renewed token from an administrator (`make token NAME=<your-name>`) and update `.env.vault`.

### `✗ Cannot reach Vault at https://...`
* **Cause**: DNS resolution failure or network firewall blocking port 8200.
* **Fix**: Verify your internet connection, verify `VAULT_ADDR` matches the cluster address, or run a standalone local dev container as described above.

### `✗ Critical secrets are empty and --allow-fallbacks was not set`
* **Cause**: Some secret paths in HCP Vault are missing or uninitialized.
* **Fix**: For local development, run `make env-dev` or pass `--allow-fallbacks` to use safe development defaults.

### `Error: Neither jq nor python3 is installed`
* **Cause**: The parsing utilities require either `jq` or `python3`/`python` to process JSON payloads.
* **Fix**: Install `jq` via your package manager (`winget install jqlang.jq`, `brew install jq`, or `apt install jq`) or ensure `python3` is in your `PATH`.
