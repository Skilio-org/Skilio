#!/usr/bin/env bash
# ==============================================================================
# setup.sh — Automated Developer Environment Setup
# ==============================================================================
# 1. Verifies required host tooling (uv, bun, docker)
# 2. Installs backend dependencies (uv sync)
# 3. Installs frontend dependencies (bun install)
# 4. Starts backing database services (PostgreSQL & Redis)
# 5. Executes database migrations and seeds initial test data
# ==============================================================================

set -euo pipefail

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}      Freelancer Dev Environment Setup               ${NC}"
echo -e "${BOLD}=====================================================${NC}"

# ──────────────────────────────────────────────────────────────────────────────
# 1. Tooling Verification
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [1/5] Checking required host tooling...${NC}"

MISSING_TOOLS=0

# Check Docker
if command -v docker >/dev/null 2>&1; then
    echo -e "  [✔] Docker is installed: $(docker --version)"
    if ! docker info >/dev/null 2>&1; then
        echo -e "  ${YELLOW}[!] Warning: Docker daemon is not currently responding.${NC}"
        echo -e "      Make sure Docker / Docker Desktop is running."
    fi
else
    echo -e "  ${RED}[✘] Docker is not installed!${NC}"
    echo -e "      Install Docker: https://docs.docker.com/get-docker/"
    MISSING_TOOLS=1
fi

# Check uv (Python package manager)
if command -v uv >/dev/null 2>&1; then
    echo -e "  [✔] uv is installed: $(uv --version)"
else
    echo -e "  ${RED}[✘] uv is not installed!${NC}"
    echo -e "      Install via: ${BOLD}curl -LsSf https://astral.sh/uv/install.sh | sh${NC}"
    echo -e "      ${YELLOW}→ Then reload your shell: 'source ~/.bashrc' or reopen terminal${NC}"

    MISSING_TOOLS=1
fi

# Check bun (JavaScript runtime & package manager)
if command -v bun >/dev/null 2>&1; then
    echo -e "  [✔] bun is installed: $(bun --version)"
else
    echo -e "  ${RED}[✘] bun is not installed!${NC}"
    echo -e "      Install via: ${BOLD}curl -fsSL https://bun.sh/install | bash${NC}"
    echo -e "      ${YELLOW}→ Then reload your shell: 'source ~/.bashrc' or reopen terminal${NC}"
    MISSING_TOOLS=1
fi

# Check Node.js (Vite 8 requires Node >= v20)
NODE_OK=0
if command -v node >/dev/null 2>&1; then
    NODE_MAJOR=$(node -v 2>/dev/null | tr -d 'v' | cut -d '.' -f1 || echo 0)
    if [ "${NODE_MAJOR}" -ge 20 ]; then
        echo -e "  [✔] Node is installed: $(node -v)"
        NODE_OK=1
    fi
fi

if [ "${NODE_OK}" -eq 0 ]; then
    echo -e "  ${RED}[✘] Modern Node (>= 20) is required for Vite 8! (Detected: $(node -v 2>/dev/null || echo 'not found'))${NC}"
    echo -e "      Install standalone via: ${BOLD}mkdir -p ~/.local/bin && curl -fsSL https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz | tar -xJ -C ~/.local/bin --strip-components=2 node-v22.14.0-linux-x64/bin/node${NC}"
    MISSING_TOOLS=1
fi

if [ "${MISSING_TOOLS}" -ne 0 ]; then
    echo -e "\n${RED}[ERROR] Required tooling is missing. Please install the tools above and run 'make setup' again.${NC}"
    exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
# 2. Environment File Check
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [2/5] Checking environment configuration...${NC}"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "  ${YELLOW}[!] .env not found. Creating default .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "  [✔] Created .env (review and update secrets if necessary)."
    else
        echo -e "  ${RED}[✘] Neither .env nor .env.example was found!${NC}"
        exit 1
    fi
else
    echo -e "  [✔] .env file exists."
fi

# Ensure executable permissions for backend scripts
if [ -f backend/run_backend.sh ]; then
    chmod +x backend/run_backend.sh
fi
if [ -f backend/scripts/prestart.sh ]; then
    chmod +x backend/scripts/prestart.sh
fi

# ──────────────────────────────────────────────────────────────────────────────
# 3. Dependency Installation
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [3/5] Installing dependencies...${NC}"

echo -e "  --> Syncing Python backend virtual environment via uv..."
(cd backend && uv sync)
echo -e "  ${GREEN}[✔] Backend dependencies installed successfully.${NC}"

echo -e "  --> Installing React frontend dependencies via bun..."
(cd frontend && bun install)
echo -e "  ${GREEN}[✔] Frontend dependencies installed successfully.${NC}"

# ──────────────────────────────────────────────────────────────────────────────
# 4. Database & Backing Services Initialization
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [4/5] Starting database and backing services (Docker)...${NC}"

docker compose up -d db redis mailpit

echo -n "  --> Waiting for PostgreSQL database to be healthy..."
RETRIES=60
until docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo -n "."
    sleep 1
    RETRIES=$((RETRIES - 1))
done

echo ""
if [ $RETRIES -eq 0 ]; then
    echo -e "  ${RED}[ERROR] PostgreSQL database failed to start within 60 seconds.${NC}"
    echo -e "  ${YELLOW}Recent database logs:${NC}"
    docker compose logs --tail=20 db
    exit 1
fi
echo -e "  ${GREEN}[✔] PostgreSQL is ready and accepting connections.${NC}"

# Ensure PostgreSQL user password matches .env (in case .env was updated after Docker volume creation)
POSTGRES_PWD=$(grep -E '^POSTGRES_PASSWORD=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
if [ -n "${POSTGRES_PWD}" ]; then
    docker compose exec -T db psql -U postgres -d app -c "ALTER USER postgres WITH PASSWORD '${POSTGRES_PWD}';" >/dev/null 2>&1 || true
fi

# ──────────────────────────────────────────────────────────────────────────────
# 5. Database Migrations and Demo Data Seeding
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [5/5] Running migrations and seeding test data...${NC}"

echo -e "  --> Running Alembic database migrations (prestart.sh)..."
(cd backend && uv run bash scripts/prestart.sh)

echo -e "  --> Seeding database with 20 demo clients and freelancers..."
(cd backend && uv run python app/seed_data.py 20)
echo -e "  ${GREEN}[✔] Database migrations and seeding completed successfully.${NC}"

# ──────────────────────────────────────────────────────────────────────────────
# Completion Banner
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}      Setup completed successfully! 🚀               ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
echo -e "You can now run your local development environment with:"
echo -e "    ${BOLD}make dev${NC}"
echo -e "\nServices available:"
echo -e "  - Frontend : http://localhost:5173"
echo -e "  - Backend  : http://localhost:8000"
echo -e "  - Mailpit  : http://localhost:8025"
echo -e "  - Swagger  : http://localhost:8000/docs"
echo ""
