#!/usr/bin/env bash

set -euo pipefail

# Text colors
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Find script and project folders
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load settings from .env file if it exists
if [ -f "${ROOT_DIR}/.env" ]; then
    source "${ROOT_DIR}/.env" 2>/dev/null || true
fi

# Settings and default values
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-app}"
export PGPASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD:-}}"

TARGET_DB="${TARGET_DB:-${POSTGRES_DB}}"
BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/dumps}"

# Choose which backup file to restore
SELECTED_BACKUP="${1:-}"

if [ -z "${SELECTED_BACKUP}" ]; then
    # No argument given: automatically use the latest backup
    BACKUP_FILE=$(ls -1tr "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | tail -n 1 || true)
elif [ -f "${SELECTED_BACKUP}" ]; then
    # Full path was provided
    BACKUP_FILE="${SELECTED_BACKUP}"
elif [ -f "${BACKUP_DIR}/${SELECTED_BACKUP}" ]; then
    # Only filename was provided
    BACKUP_FILE="${BACKUP_DIR}/${SELECTED_BACKUP}"
else
    echo -e "${RED}[ERROR] Backup file not found: ${SELECTED_BACKUP}${NC}" >&2
    exit 1
fi

if [ -z "${BACKUP_FILE:-}" ] || [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}[ERROR] No backup file found to restore in: ${BACKUP_DIR}${NC}" >&2
    echo -e "  Run ${BOLD}make backup${NC} to create a backup first.\n" >&2
    exit 1
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}          PostgreSQL Database Restore                ${NC}"
echo -e "${BOLD}=====================================================${NC}"
echo -e "  Target Database : ${CYAN}${TARGET_DB}${NC}"
echo -e "  User            : ${CYAN}${POSTGRES_USER}${NC}"
echo -e "  Restore From    : ${CYAN}$(basename "${BACKUP_FILE}")${NC} (${FILE_SIZE})"
echo -e "${BOLD}─────────────────────────────────────────────────────${NC}"


# Check the backup file before restoring
echo -e "\n${BLUE}==> [1/3] Checking backup file for errors...${NC}"

if ! gzip -t "${BACKUP_FILE}" >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Corrupted file detected! gzip test failed.${NC}" >&2
    exit 1
fi
echo -e "  ${GREEN}[✔] File check passed (valid gzip archive).${NC}"


# Check database status and close active connections
echo -e "\n${BLUE}==> [2/3] Checking database and closing active connections...${NC}"

# Detect if running inside container or on the host computer
if [ -n "${POSTGRES_HOST:-}" ] && command -v psql >/dev/null 2>&1; then
    # Inside container close connections and stream directly into psql
    psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT:-5432}" \
        -U "${POSTGRES_USER}" \
        -d postgres \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
    echo -e "  ${GREEN}[✔] Active connections closed.${NC}"

    echo -e "\n${BLUE}==> [3/3] Restoring database tables and data...${NC}"
    gzip -dc "${BACKUP_FILE}" | psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT:-5432}" \
        -U "${POSTGRES_USER}" \
        -d "${TARGET_DB}" \
        -v ON_ERROR_STOP=1 >/dev/null
    echo -e "  ${GREEN}[✔] Database restored successfully.${NC}"

    TABLE_COUNT=$(psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER}" -d "${TARGET_DB}" -t -A -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "Unknown")

elif command -v docker >/dev/null 2>&1; then
    # On host computer verify container is running
    cd "${ROOT_DIR}"
    if [ -z "$(docker compose ps --status running -q db 2>/dev/null)" ]; then
        echo -e "${RED}[ERROR] Database service 'db' is not running!${NC}" >&2
        echo -e "  Start it first with: ${BOLD}make up${NC}\n" >&2
        exit 1
    fi

    # Close active connections so restore is not blocked
    docker compose exec -T db psql \
        -U "${POSTGRES_USER}" \
        -d postgres \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
    echo -e "  ${GREEN}[✔] Active connections closed.${NC}"

    echo -e "\n${BLUE}==> [3/3] Restoring database tables and data...${NC}"
    gzip -dc "${BACKUP_FILE}" | docker compose exec -T db psql \
        -U "${POSTGRES_USER}" \
        -d "${TARGET_DB}" \
        -v ON_ERROR_STOP=1 >/dev/null
    echo -e "  ${GREEN}[✔] Database restored successfully.${NC}"

    TABLE_COUNT=$(docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${TARGET_DB}" -t -A -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "Unknown")

else
    echo -e "${RED}[ERROR] Neither psql nor docker was found in PATH!${NC}" >&2
    exit 1
fi

echo -e "\n${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}      Restore Completed Successfully!                ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
echo -e "  Restored From  : ${BOLD}$(basename "${BACKUP_FILE}")${NC}"
echo -e "  Target Database: ${TARGET_DB}"
echo -e "  Tables Found   : ${TABLE_COUNT} public tables"
echo -e "${GREEN}${BOLD}=====================================================${NC}\n"
