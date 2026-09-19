.PHONY: help dev up down env push logs status clean backup restore

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
	@echo "  Database:"
	@echo "    make backup       Dump the Postgres database to a .sql.gz file"
	@echo "    make restore      Restore the database from the latest (or given) backup"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean        Backup DB → stop everything → remove containers & volumes"
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

# ─── Database ───────────────────────────────────────────────

# Backup the database to a compressed SQL dump
backup:
	@bash devops/backup/backup.sh

# Restore the database from the latest (or given) backup
restore:
	@bash devops/backup/restore.sh $(FILE)

# ─── Cleanup ────────────────────────────────────────────────

# Backup first, then stop everything and remove volumes
clean: backup
	docker compose down -v
	@echo "All containers and volumes removed."
