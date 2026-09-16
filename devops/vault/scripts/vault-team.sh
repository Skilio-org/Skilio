#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-myroot}"
CONTAINER="${VAULT_CONTAINER:-vault}"

v() {
  docker compose exec -e VAULT_ADDR="$VAULT_ADDR" -e VAULT_TOKEN="$VAULT_TOKEN" "$CONTAINER" vault "$@"
}

ACTION="${1:-help}"

case "$ACTION" in

  setup)
    # Load the secrets-manager policy into Vault
    docker compose exec -T "$CONTAINER" sh -c 'cat > /home/vault/secrets-manager.hcl' < devops/vault/policies/secrets-manager.hcl
    v policy write secrets-manager /home/vault/secrets-manager.hcl
    echo "Policy 'secrets-manager' loaded."
    ;;

  add)
    # Create a token for a team member
    NAME="${2:?Usage: $0 add <name> [ttl]}"
    TTL="${3:-720h}"   # default 30 days
    TOKEN=$(v token create \
      -policy="secrets-manager" \
      -display-name="$NAME" \
      -ttl="$TTL" \
      -field=token)
    echo ""
    echo "=== Token for $NAME ==="
    echo "$TOKEN"
    echo ""
    echo "Expires in: $TTL"
    echo ""
    echo "Send this to $NAME privately (Signal, WhatsApp, in person)."
    echo "They use it to log in to the Vault UI or CLI."
    ;;

  list)
    # List existing tokens (accessors)
    v list auth/token/accessors
    ;;

  revoke)
    # Revoke a team member's token
    TOKEN="${2:?Usage: $0 revoke <token>}"
    v token revoke "$TOKEN"
    echo "Token revoked."
    ;;

  help|*)
    echo "Vault Team Management"
    echo ""
    echo "Usage:"
    echo "  $0 setup              Load the secrets-manager policy"
    echo "  $0 add <name> [ttl]   Create a token for a team member (default: 30 days)"
    echo "  $0 revoke <token>     Revoke a team member's token"
    echo "  $0 list               List all active token accessors"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 add alice"
    echo "  $0 add bob 168h       # 7 days"
    echo "  $0 revoke hvs.abc123"
    ;;

esac
