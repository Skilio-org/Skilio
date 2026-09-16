# Full CRUD on secrets under production/
path "secret/data/production/*" {
  capabilities = ["create", "read", "update", "delete"]
}

# List secrets so they can browse what exists
path "secret/metadata/production/*" {
  capabilities = ["list", "read", "delete"]
}

# Allow listing the top-level paths
path "secret/metadata/" {
  capabilities = ["list"]
}
path "secret/metadata/production" {
  capabilities = ["list"]
}
