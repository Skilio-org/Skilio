.PHONY: help dev up down env env-dev push push-dry token logs status clean backup restore backup-logs dr-test

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
	@echo "    make env-dev      Pull secrets (use fallback defaults for missing values)"
	@echo "    make push         Upload local .env secrets to HCP Vault"
	@echo "    make push-dry     Preview what will be pushed (no writes)"
	@echo "    make token        Create a read-only token (make token NAME=dev1 [TTL=720h])"
	@echo ""
	@echo "  Database & Disaster Recovery:"
	@echo "    make backup       Dump the Postgres database to a .sql.gz file"
	@echo "    make restore      Restore the database from the latest (or given) backup"
	@echo "    make backup-logs  View live logs from the automated backup daemon"
	@echo "    make dr-test      Run automated Disaster Recovery (DR) verification drill"
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

# Pull secrets with fallback defaults for local development
env-dev:
	@bash devops/vault/scripts/vault-pull.sh --allow-fallbacks

# Upload local .env secrets up to HCP Vault
push:
	@bash devops/vault/scripts/vault-push.sh

# Preview what will be pushed without writing
push-dry:
	@bash devops/vault/scripts/vault-push.sh --dry-run

# Create a developer read-only token in HCP Vault
token:
	@bash devops/vault/scripts/vault-create-token.sh $(NAME) $(TTL)

# ─── Database ───────────────────────────────────────────────

# Backup the database to a compressed SQL dump
backup:
	@bash devops/backup/backup.sh

# Restore the database from the latest (or given) backup
restore:
	@bash devops/backup/restore.sh $(FILE)

# Tail logs from the automated backup daemon
backup-logs:
	docker compose logs -f backup-daemon

# Run automated Disaster Recovery (DR) verification drill
dr-test:
	@bash devops/backup/dr-drill.sh

# ─── Cleanup ────────────────────────────────────────────────

# Backup first, then stop everything and remove volumes
clean: backup
	docker compose down -v
	@echo "All containers and volumes removed."
