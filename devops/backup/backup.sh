#!/usr/bin/env bash

set -euo pipefail

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
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
export PGPASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD}}"
MAX_BACKUPS="${BACKUP_MAX_COUNT:-7}"

BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/dumps}"

# Make sure the backup folder exists
mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILENAME="backup_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Delete backup file if the script exits with an error
trap 'if [ $? -ne 0 ] && [ -f "${BACKUP_FILE:-}" ]; then rm -f "${BACKUP_FILE}"; fi' EXIT

echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}          PostgreSQL Database Backup                 ${NC}"
echo -e "${BOLD}=====================================================${NC}"
echo -e "  Database       : ${CYAN}${POSTGRES_DB}${NC}"
echo -e "  User           : ${CYAN}${POSTGRES_USER}${NC}"
echo -e "  Keep Backups   : ${CYAN}Max ${MAX_BACKUPS} files${NC}"
echo -e "  Save To        : ${CYAN}${BACKUP_FILE}${NC}"
echo -e "${BOLD}─────────────────────────────────────────────────────${NC}"

# ──────────────────────────────────────────────────────────────────────────────
# 1. Dump database and compress with gzip
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [1/3] Dumping database and compressing with gzip...${NC}"
START_TIME=$(date +%s%N)

# Check if running inside a container or on the host computer
if [ -n "${POSTGRES_HOST:-}" ] && command -v pg_dump >/dev/null 2>&1; then
    # Running inside container with direct network access to DB
    pg_dump \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT:-5432}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges | gzip -9 > "${BACKUP_FILE}"
elif command -v docker >/dev/null 2>&1; then
    # Running on host computer using Docker Compose
    cd "${ROOT_DIR}"
    if [ -z "$(docker compose ps --status running -q db 2>/dev/null)" ]; then
        echo -e "${RED}[ERROR] Database service 'db' is not running!${NC}" >&2
        echo -e "  Start it first with: ${BOLD}make up${NC}\n" >&2
        exit 1
    fi
    docker compose exec -T db pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges | gzip -9 > "${BACKUP_FILE}"
else
    echo -e "${RED}[ERROR] Neither pg_dump nor docker was found in PATH!${NC}" >&2
    exit 1
fi

END_TIME=$(date +%s%N)
DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))

# ──────────────────────────────────────────────────────────────────────────────
# 2. Check the backup file
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [2/3] Checking backup file for errors...${NC}"

if [ ! -f "${BACKUP_FILE}" ] || [ ! -s "${BACKUP_FILE}" ]; then
    echo -e "${RED}[ERROR] Backup file was not created or is empty: ${BACKUP_FILE}${NC}" >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Test the file with gzip to verify CRC checksum
if gzip -t "${BACKUP_FILE}" >/dev/null 2>&1; then
    FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo -e "  ${GREEN}[✔] File check passed (CRC verified, size: ${FILE_SIZE}, time: ${DURATION_MS}ms)${NC}"
else
    echo -e "${RED}[ERROR] Corrupted file detected! gzip test failed.${NC}" >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
# 3. Delete old backups (keep latest MAX_BACKUPS files)
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}==> [3/3] Cleaning up old backups (keeping latest ${MAX_BACKUPS} files)...${NC}"

TOTAL_BACKUPS=$(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l)

if [ "${TOTAL_BACKUPS}" -gt "${MAX_BACKUPS}" ]; then
    EXCESS=$((TOTAL_BACKUPS - MAX_BACKUPS))
    echo -e "  [i] Found ${TOTAL_BACKUPS} backups (limit is ${MAX_BACKUPS}). Deleting ${EXCESS} oldest file(s)..."
    for old_file in $(ls -1tr "${BACKUP_DIR}"/backup_*.sql.gz | head -n "${EXCESS}"); do
        rm -f "${old_file}"
        echo -e "  ${YELLOW}[-] Deleted oldest backup: $(basename "${old_file}")${NC}"
    done
else
    echo -e "  [i] All backups are within the limit (${TOTAL_BACKUPS}/${MAX_BACKUPS} files). Nothing to delete."
fi

# ──────────────────────────────────────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}      Backup Completed Successfully!                 ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
echo -e "  File Name      : ${BOLD}${BACKUP_FILENAME}${NC}"
echo -e "  Saved To       : ${BACKUP_FILE}"
echo -e "  Size           : ${FILE_SIZE}"
echo -e "  Total Backups  : $(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l) saved"
echo -e "${GREEN}${BOLD}=====================================================${NC}\n"
