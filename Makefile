.PHONY: help dev up down env push logs status clean

# Default target — show available commands
help:
	@echo ""
	@echo "  Freelancer Project (HCP Vault Integrated)"
	@echo "  ────────────────────────────────────────"
	@echo ""
	@echo "  Development:"
	@echo "    make dev          Pull secrets from HCP Vault → start all services"
	@echo "    make up           Start all services (assumes .env exists)"
	@echo "    make down         Stop all services"
	@echo "    make logs         Tail logs for all services"
	@echo "    make status       Show running containers"
	@echo ""
	@echo "  HCP Vault:"
	@echo "    make env          Pull secrets from HCP Vault → generate .env"
	@echo "    make push         Upload local .env secrets to HCP Vault"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean        Stop everything + remove containers & volumes"
	@echo ""

# ─── Development ────────────────────────────────────────────

# Full startup: pull secrets from HCP Vault → start everything
dev: env up

# Start all services
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

# ─── HCP Vault ──────────────────────────────────────────────

# Pull secrets from HCP Vault into .env
env:
	@bash devops/vault/scripts/vault-pull.sh

# Upload local .env secrets up to HCP Vault
push:
	@bash devops/vault/scripts/vault-push.sh

# ─── Cleanup ────────────────────────────────────────────────

# Stop everything and remove volumes
clean:
	docker compose down -v
	@echo "All containers and volumes removed."
