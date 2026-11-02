#!/usr/bin/env bash

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/opt/skilio}"
cd "${APP_DIR}"

COMPOSE="docker compose -f compose.yml -f compose.deploy.yml"

echo -e "\n${BLUE}==> [1/4] Building updated Docker containers...${NC}"
${COMPOSE} build backend

echo -e "\n${BLUE}==> [2/4] Running database migrations...${NC}"
${COMPOSE} run --rm backend bash scripts/prestart.sh

echo -e "\n${BLUE}==> [3/4] Recreating backend container with updated image...${NC}"
${COMPOSE} up -d --wait --force-recreate --no-deps backend

echo -e "\n${BLUE}==> [4/4] Pruning dangling Docker image layers...${NC}"
docker image prune -f

echo -e "\n${GREEN}✔ Backend container updated and deployed successfully!${NC}"
