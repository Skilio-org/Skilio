#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# entrypoint.sh — PostgreSQL Backup Service Entrypoint
# ──────────────────────────────────────────────────────────────────────────────
# Waits for database to be ready, runs first backup if needed, sets up
# the cron schedule, and shows logs.

set -euo pipefail

# Text colors
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Settings and defaults
POSTGRES_HOST="${POSTGRES_HOST:-db}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-app}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
export PGPASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD}}"
BACKUP_SCHEDULE="${BACKUP_SCHEDULE:-0 2 * * *}"
BACKUP_DIR="${BACKUP_DIR:-/dumps}"
BACKUP_MAX_COUNT="${BACKUP_MAX_COUNT:-7}"
RUN_ON_STARTUP="${RUN_ON_STARTUP:-true}"

echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}   Starting PostgreSQL Backup Service...             ${NC}"
echo -e "${BOLD}=====================================================${NC}"
echo -e "  Database Host  : ${CYAN}${POSTGRES_HOST}:${POSTGRES_PORT}${NC}"
echo -e "  Database       : ${CYAN}${POSTGRES_DB}${NC}"
echo -e "  User           : ${CYAN}${POSTGRES_USER}${NC}"
echo -e "  Schedule       : ${CYAN}${BACKUP_SCHEDULE}${NC}"
echo -e "  Keep Backups   : ${CYAN}Max ${BACKUP_MAX_COUNT} files${NC}"
echo -e "  Backup Folder  : ${CYAN}${BACKUP_DIR}${NC}"
echo -e "  Run on Startup : ${CYAN}${RUN_ON_STARTUP}${NC}"
echo -e "${BOLD}─────────────────────────────────────────────────────${NC}"

# Make sure the backup folder exists
mkdir -p "${BACKUP_DIR}"

# Wait for database to be ready
echo -e "\n${BLUE}==> Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT} to be ready...${NC}"
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; do
    sleep 2
done
echo -e "  ${GREEN}[✔] PostgreSQL is ready.${NC}"

# Run first backup on startup if enabled
if [ "${RUN_ON_STARTUP}" = "true" ]; then
    echo -e "\n${BLUE}==> Running first backup on startup...${NC}"
    /usr/local/bin/backup.sh || echo -e "${YELLOW}[!] First backup had an error, but continuing to run scheduled backups.${NC}"
fi

# Create cron script with saved environment variables
cat << EOF > /usr/local/bin/cron-backup.sh
#!/usr/bin/env bash
set -euo pipefail
export POSTGRES_HOST="${POSTGRES_HOST}"
export POSTGRES_PORT="${POSTGRES_PORT}"
export POSTGRES_USER="${POSTGRES_USER}"
export POSTGRES_DB="${POSTGRES_DB}"
export PGPASSWORD="${PGPASSWORD}"
export BACKUP_DIR="${BACKUP_DIR}"
export BACKUP_MAX_COUNT="${BACKUP_MAX_COUNT}"

/usr/local/bin/backup.sh
EOF
chmod +x /usr/local/bin/cron-backup.sh

# Set up the cron schedule in crontab
mkdir -p /etc/crontabs
echo "${BACKUP_SCHEDULE} /usr/local/bin/cron-backup.sh > /proc/1/fd/1 2> /proc/1/fd/2" > /etc/crontabs/root

echo -e "\n${GREEN}[✔] Cron schedule set (${BACKUP_SCHEDULE}).${NC}"
echo -e "${BLUE}==> Starting background backup service (crond)...${NC}\n"

# Run crond in foreground
exec crond -f -l 2
