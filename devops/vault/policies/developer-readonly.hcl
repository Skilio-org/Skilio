# Developer Read-Only Policy for HCP Vault Dedicated
# Grants read access to production secrets for developers
# Apply with: vault policy write developer-readonly devops/vault/policies/developer-readonly.hcl

# Read secret values under production/*
path "secret/data/production/*" {
  capabilities = ["read", "list"]
}

# Read metadata (version history, custom metadata) for production secrets
path "secret/metadata/production/*" {
  capabilities = ["list", "read"]
}

# Browse the root of the secret/ engine in the UI/CLI
path "secret/metadata/" {
  capabilities = ["list"]
}

# Browse the production/ folder in the UI/CLI
path "secret/metadata/production" {
  capabilities = ["list"]
}

# Read subkeys (partial key listing without values) — KV-v2 feature
path "secret/subkeys/production/*" {
  capabilities = ["read"]
}
