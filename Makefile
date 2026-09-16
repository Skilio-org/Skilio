.PHONY: help dev up down env logs status clean vault-init vault-seed vault-team vault-backup

# Default target — show available commands
help:
	@echo ""
	@echo "  Freelancer Project"
	@echo "  ────────────────────────────────────────"
	@echo ""
	@echo "  Development:"
	@echo "    make dev          Start everything (Vault → .env → all services)"
	@echo "    make up           Start all services (assumes .env exists)"
	@echo "    make down         Stop all services"
	@echo "    make logs         Tail logs for all services"
	@echo "    make status       Show running containers"
	@echo ""
	@echo "  Vault:"
	@echo "    make env          Pull secrets from Vault → generate .env"
	@echo "    make vault-init   Populate Vault with secrets + policies + AppRole"
	@echo "    make vault-seed   First-time setup: init Vault + generate .env"
	@echo "    make vault-team   Show team management commands"
	@echo "    make vault-backup Back up Vault data"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean        Stop everything + remove volumes (⚠ destroys data)"
	@echo ""

# ─── Development ────────────────────────────────────────────

# Full startup: Vault first → pull secrets → start everything
dev: _vault-up env up

# Start all services (assumes .env exists)
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Tail logs
logs:
	docker compose logs -f

# Show running containers
status:
	docker compose ps

# ─── Vault ──────────────────────────────────────────────────

# Start only Vault and wait for it to be healthy
_vault-up:
	@docker compose up -d vault
	@echo "Waiting for Vault to be healthy..."
	@until docker compose exec -e VAULT_ADDR=http://127.0.0.1:8200 vault vault status > /dev/null 2>&1; do sleep 1; done
	@echo "Vault is ready."

# Pull secrets from Vault into .env
env:
	@bash devops/vault/scripts/vault-env.sh

# Populate Vault with secrets, policies, AppRole
vault-init:
	@bash devops/vault/scripts/vault-init.sh

# First-time full setup: start Vault, init, generate .env
vault-seed: _vault-up vault-init env
	@echo ""
	@echo "Vault seeded and .env generated. Run 'make up' to start everything."

# Team management helper
vault-team:
	@bash devops/vault/scripts/vault-team.sh help

# Backup Vault data
vault-backup:
	@bash devops/vault/scripts/vault-backup.sh

# ─── Cleanup ────────────────────────────────────────────────

# Stop everything and remove volumes (destructive!)
clean:
	docker compose down -v
	@echo "All containers and volumes removed."
