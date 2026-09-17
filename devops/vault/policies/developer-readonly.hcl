# Developer Read-Only Policy for HCP Vault
# Grants read access to production secrets and listing capabilities for browsing in UI/CLI

path "secret/data/production/*" {
  capabilities = ["read"]
}

path "secret/metadata/production/*" {
  capabilities = ["list", "read"]
}

path "secret/metadata/" {
  capabilities = ["list"]
}

path "secret/metadata/production" {
  capabilities = ["list"]
}
