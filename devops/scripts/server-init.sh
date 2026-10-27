#!/usr/bin/env bash


set -euo pipefail


BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'


# Ensure script is run with root / sudo permissions
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${YELLOW}[!] This script needs root permissions. Running with sudo...${NC}"
    exec sudo bash "$0" "$@"
fi


TARGET_USER="${SUDO_USER:-ubuntu}"
APP_DIR="/opt/skilio"


# 1. System Package Updates & Installing required tools
echo -e "\n${BLUE}==> [1/4] Updating system packages...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    make \
    ufw

echo -e "  ${GREEN}[✔] Base system packages are up to date.${NC}"


# 2. Linux Swap File
echo -e "\n${BLUE}==> [2/4] Checking Linux Swap memory...${NC}"

if [ -f /swapfile ]; then
    echo -e "  ${GREEN}[✔] Swap file (/swapfile) already exists.${NC}"
else
    echo -e "  Creating 2 GB swap file to prevent out-of-memory crashes..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
    swapon /swapfile

    # Save swap in /etc/fstab so it turns on automatically on reboot
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    # Tune swappiness (10 means Linux uses real RAM first, swap only if needed)
    sysctl vm.swappiness=10 >/dev/null
    if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
        echo 'vm.swappiness=10' >> /etc/sysctl.conf
    fi

    echo -e "  ${GREEN}[✔] 2 GB Swap file successfully activated.${NC}"
fi


# 3. Docker & Docker Compose v2 Installation (Ubuntu Native)
echo -e "\n${BLUE}==> [3/4] Checking Docker installation...${NC}"

if command -v docker >/dev/null 2>&1; then
    echo -e "  ${GREEN}[✔] Docker is already installed: $(docker --version)${NC}"
else
    echo -e "  Installing Docker and Compose from Ubuntu repositories..."
    apt-get install -y --no-install-recommends docker.io docker-compose-v2

    # Configure overlay2 storage driver to ensure cAdvisor container telemetry compatibility
    mkdir -p /etc/docker
    if [ ! -f /etc/docker/daemon.json ]; then
        echo '{"storage-driver": "overlay2"}' > /etc/docker/daemon.json
    fi

    # Enable and start Docker service
    systemctl enable --now docker >/dev/null 2>&1 || true

    echo -e "  ${GREEN}[✔] Docker Engine and Compose plugin installed successfully.${NC}"
fi


# 4. User Permissions & Application Directory Setup
echo -e "\n${BLUE}==> [4/4] Configuring user access and application directory...${NC}"

# Allow target user to run docker commands without sudo
if id -u "${TARGET_USER}" >/dev/null 2>&1; then
    usermod -aG docker "${TARGET_USER}"
    echo -e "  ${GREEN}[✔] Added user '${TARGET_USER}' to the docker group.${NC}"
fi

# Create application directory with proper ownership
mkdir -p "${APP_DIR}"
if id -u "${TARGET_USER}" >/dev/null 2>&1; then
    chown -R "${TARGET_USER}:${TARGET_USER}" "${APP_DIR}"
fi
chmod 755 "${APP_DIR}"
echo -e "  ${GREEN}[✔] Directory '${APP_DIR}' is ready for '${TARGET_USER}'.${NC}"


echo -e "\n${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}      Server Bootstrap Completed Successfully!       ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
