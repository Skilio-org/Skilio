.PHONY: help setup dev up down build logs status test seed clean fclean re backup backup-list restore dr-test server-init

# Default target — show available commands
help:
	@echo ""
	@echo "  Freelancer Platform — Developer Commands"
	@echo "  ────────────────────────────────────────"
	@echo ""
	@echo "  Development:"
	@echo "    make setup        Verify tools, install deps, start DB, migrate & seed"
	@echo "    make dev          Run local dev stack (backend + frontend with merged logs)"
	@echo "    make up           Start all Docker services in background"
	@echo "    make down         Stop all Docker services"
	@echo "    make build        Rebuild all Docker container images"
	@echo "    make logs         Tail logs for all Docker services"
	@echo "    make status       Show running containers"
	@echo ""
	@echo "  Backups & Disaster Recovery:"
	@echo "    make backup       Take compressed live snapshot of PostgreSQL database"
	@echo "    make backup-list  Show inventory of available database snapshots"
	@echo "    make restore      Restore database from latest backup (or FILE=...)"
	@echo "    make dr-test      Run automated disaster recovery verification drill"
	@echo ""
	@echo "  Cloud Server & Deployment:"
	@echo "    make server-init  Bootstrap remote AWS server with Docker, 2GB Swap & tools"
	@echo ""
	@echo "  Testing & Data:"
	@echo "    make test         Run backend unit & integration test suite"
	@echo "    make seed         Seed database with mock accounts (make seed COUNT=20)"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean        Stop services → remove containers & volumes"
	@echo "    make fclean       Alias for make clean"
	@echo "    make re           Clean everything and re-run setup"
	@echo ""




# =========== Development ===================================

# One-command developer onboarding / bootstrap
setup:
	@bash devops/scripts/setup.sh

# Run local dev stack (FastAPI + React on host, DB/Redis/Mailpit in Docker)
dev:
	@bash devops/scripts/dev.sh

# Start all Docker services in background
up:
	docker compose up -d

# Stop all Docker services
down:
	docker compose down

# Rebuild all Docker container images
build:
	docker compose build

# Tail logs for all running services
logs:
	docker compose logs -f

# Show status of running containers
status:
	docker compose ps




# =========== Testing & Data ====================================

# Run backend unit and integration tests via pytest
test:
	cd backend && uv run pytest

# Seed database with mock accounts (default: 20)
COUNT ?= 20
seed:
	cd backend && uv run python app/seed_data.py $(COUNT)




# =========== Backups & Disaster Recovery ========================

# Create live compressed snapshot of PostgreSQL
backup:
	@bash devops/backup/backup.sh

# List available database backup snapshots
backup-list:
	@bash devops/backup/backup-list.sh

# Restore database from latest backup (or FILE=...)
restore:
	@bash devops/backup/restore.sh $(FILE)

# Run automated disaster recovery verification drill
dr-test:
	@bash devops/backup/dr-test.sh




# =========== Cloud Server & Deployment ==========================

SERVER_IP ?= 16.192.59.166
SSH_KEY ?= $(HOME)/Downloads/skilio-key.pem

# Bootstrap fresh remote AWS server with Docker, 2GB Swap & tools
server-init:
	@chmod 400 $(SSH_KEY) 2>/dev/null || true
	@ssh -i $(SSH_KEY) ubuntu@$(SERVER_IP) 'sudo bash -s' < devops/scripts/server-init.sh




# =========== Cleanup ===========================================

# Stop everything and remove volumes
clean:
	docker compose down -v
	@echo "All containers and volumes removed."

fclean: clean

re: clean setup





# ─── HCP Vault (Temporarily Disabled) ───────────────────────
# env:
# 	@bash devops/vault/scripts/vault-pull.sh
#
# env-dev:
# 	@bash devops/vault/scripts/vault-pull.sh --allow-fallbacks
#
# push:
# 	@bash devops/vault/scripts/vault-push.sh
#
# push-dry:
# 	@bash devops/vault/scripts/vault-push.sh --dry-run
#
# token:
# 	@bash devops/vault/scripts/vault-create-token.sh $(NAME) $(TTL)
