#!/usr/bin/env bash
set -e

# Skilio Platform Moroccan Seeder Wrapper
# Usage:
#   ./scripts/seeder.sh local
#   ./scripts/seeder.sh prod
#   ./scripts/seeder.sh local --clean
#   ./scripts/seeder.sh prod --dry-run

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}/backend"

if command -v uv >/dev/null 2>&1; then
    exec uv run python -m app.seeder "$@"
elif [ -d "${ROOT_DIR}/.venv" ]; then
    exec "${ROOT_DIR}/.venv/bin/python" -m app.seeder "$@"
else
    exec python -m app.seeder "$@"
fi

