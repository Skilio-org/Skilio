#!/usr/bin/env bash
# ==============================================================================
# dev.sh — Hybrid Local Development Runner
# ==============================================================================
# 1. Verifies .env exists (creates from .env.example if missing)
# 2. Ensures backing Docker services (db, redis, mailpit) are running
# 3. Launches Backend & Frontend concurrently (merged colored logs & auto-shutdown)
# ==============================================================================

set -euo pipefail

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"
export PATH="${HOME}/.local/bin:${HOME}/.bun/bin:${PATH}"

echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}      Starting Freelancer Development Stack          ${NC}"
echo -e "${BOLD}=====================================================${NC}"

# ──────────────────────────────────────────────────────────────────────────────
# 1. Environment Verification
# ──────────────────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}[!] Warning: .env not found. Creating from .env.example...${NC}"
        cp .env.example .env
    else
        echo -e "${RED}[ERROR] Neither .env nor .env.example was found!${NC}" >&2
        exit 1
    fi
fi

# Ensure run_backend script has execute permissions
if [ -f backend/run_backend.sh ]; then
    chmod +x backend/run_backend.sh
fi

# ──────────────────────────────────────────────────────────────────────────────
# 2. Start Backing Infrastructure (Docker)
# ──────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}==> [1/2] Ensuring database, redis, and mailpit are running in Docker...${NC}"
docker compose up -d db redis mailpit

# ──────────────────────────────────────────────────────────────────────────────
# 3. Launch Frontend and Backend Concurrently (Merged Logs)
# ──────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}==> [2/2] Launching Backend and Frontend concurrently...${NC}"
echo -e "    ${BOLD}Backend${NC}  : http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo -e "    ${BOLD}Frontend${NC} : http://localhost:5173"
echo -e "    ${BOLD}Mailpit${NC}  : http://localhost:8025"
echo -e "    Press ${BOLD}Ctrl+C${NC} to stop both servers simultaneously.\n"

# Verify bun is installed
if ! command -v bun >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] 'bun' is required to run the frontend!${NC}"
    echo -e "        Install via: ${BOLD}curl -fsSL https://bun.sh/install | bash${NC}"
    echo -e "        Or run: ${BOLD}make setup${NC}"
    exit 1
fi

# Verify Node version (Vite 8 requires Node >= v20)
if command -v node >/dev/null 2>&1; then
    NODE_MAJOR=$(node -v 2>/dev/null | tr -d 'v' | cut -d '.' -f1 || echo 0)
    if [ "${NODE_MAJOR}" -lt 20 ]; then
        echo -e "${RED}[ERROR] Node >= 20 is required for Vite 8 (detected $(node -v))!${NC}"
        echo -e "        Please run ${BOLD}make setup${NC} to configure your environment."
        exit 1
    fi
else
    echo -e "${RED}[ERROR] Node is not installed!${NC}"
    echo -e "        Please run ${BOLD}make setup${NC} to configure your environment."
    exit 1
fi

# Clean process termination on Ctrl+C or script exit
cleanup() {
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

# Launch backend and frontend concurrently with live colored prefixes
(cd backend && ./run_backend.sh 2>&1 | sed -u "s/^/$(printf "${BLUE}${BOLD}[backend]${NC}  ")/") &
(cd frontend && bun run dev 2>&1 | sed -u "s/^/$(printf "${MAGENTA}${BOLD}[frontend]${NC} ")/") &

wait
