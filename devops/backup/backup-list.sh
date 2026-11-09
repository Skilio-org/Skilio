#!/usr/bin/env bash

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ -f "${ROOT_DIR}/.env" ]; then
    source "${ROOT_DIR}/.env" 2>/dev/null || true
fi

BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/dumps}"
MAX_BACKUPS="${BACKUP_MAX_COUNT:-7}"

echo -e "${BOLD}======================================================================${NC}"
echo -e "${BOLD}           PostgreSQL Backups List                                    ${NC}"
echo -e "${BOLD}======================================================================${NC}"
echo -e "  Backup Folder  : ${CYAN}${BACKUP_DIR}${NC}"
echo -e "  Keep Limit     : ${CYAN}Max ${MAX_BACKUPS} files${NC}"
echo -e "${BOLD}──────────────────────────────────────────────────────────────────────${NC}"

# Check if backup folder exists
if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "  ${YELLOW}[!] Backup folder does not exist yet.${NC}"
    echo -e "  Run ${BOLD}make backup${NC} to create your first backup.\n"
    exit 0
fi

# Count backup files
TOTAL=$(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l)

if [ "${TOTAL}" -eq 0 ]; then
    echo -e "  ${YELLOW}[!] No backup files found.${NC}"
    echo -e "  Run ${BOLD}make backup${NC} to create your first backup.\n"
    exit 0
fi

# Print table header
printf "  ${BOLD}%-4s %-38s %-10s %-20s %-10s${NC}\n" "#" "BACKUP FILE" "SIZE" "CREATED DATE" "STATUS"
printf "  ${DIM}%-4s %-38s %-10s %-20s %-10s${NC}\n" "----" "--------------------------------------" "---------" "-------------------" "----------"

# List files from oldest to newest
IDX=1
for file in $(ls -1tr "${BACKUP_DIR}"/backup_*.sql.gz); do
    FILENAME=$(basename "${file}")
    SIZE=$(du -h "${file}" | cut -f1)
    CREATED=$(date -r "${file}" "+%Y-%m-%d %H:%M:%S")

    TAG=""
    if [ "${IDX}" -eq "${TOTAL}" ]; then
        TAG="${GREEN}[LATEST]${NC}"
    fi

    printf "  %-4s %-38s %-10s %-20s %-10b\n" "${IDX}" "${FILENAME}" "${SIZE}" "${CREATED}" "${TAG}"
    IDX=$((IDX + 1))
done

TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
echo -e "${BOLD}──────────────────────────────────────────────────────────────────────${NC}"
echo -e "  Total Backups  : ${BOLD}${TOTAL}${NC} / ${MAX_BACKUPS} (Total size: ${TOTAL_SIZE})"
echo -e "  Tip: Run ${BOLD}make backup${NC} to create a backup, or ${BOLD}make restore${NC} to restore."
echo -e "${BOLD}======================================================================${NC}\n"
