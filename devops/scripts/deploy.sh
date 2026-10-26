#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# deploy.sh — Production Zero-Touch Deployment & Container Swap Script
# ──────────────────────────────────────────────────────────────────────────────
# Rebuilds the backend container, runs database schema migrations, and
# swaps the running container with the new image cleanly and idempotently.
#
# Designed to be invoked directly on the host or remotely via SSH:
#   bash /opt/skilio/devops/scripts/deploy.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Text colors for clean terminal output
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/opt/skilio}"
cd "${APP_DIR}"

COMPOSE="docker compose -f compose.yml -f compose.deploy.yml"

echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}         Deploying Skilio Production Backend         ${NC}"
echo -e "${BOLD}=====================================================${NC}"
echo -e "  App Directory  : ${CYAN}${APP_DIR}${NC}"
echo -e "${BOLD}─────────────────────────────────────────────────────${NC}"

echo -e "\n${BLUE}==> [1/4] Building updated Docker containers...${NC}"
${COMPOSE} build backend

echo -e "\n${BLUE}==> [2/4] Running database schema migrations...${NC}"
# Use -T to disable pseudo-TTY allocation and prevent standard input hijacking
${COMPOSE} run -T --rm backend bash scripts/prestart.sh

echo -e "\n${BLUE}==> [3/4] Recreating backend container with updated image...${NC}"
${COMPOSE} up -d --wait --force-recreate --no-deps backend

echo -e "\n${BLUE}==> [4/4] Pruning dangling Docker image layers...${NC}"
docker image prune -f

echo -e "\n${GREEN}✔ Backend container updated and deployed successfully!${NC}"
