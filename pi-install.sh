#!/usr/bin/env bash
set -euo pipefail
if [[ $EUID -ne 0 ]]; then echo 'Run with sudo bash /boot/firmware/sentinel-weight-room/pi-install.sh'; exit 1; fi
source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
install_dir=/opt/sentinel-weight-room
if [[ "$source_dir" != "$install_dir" ]]; then
  if [[ -e "$install_dir" ]]; then echo "$install_dir already exists. Use the update instructions in RASPBERRY_PI.md."; exit 1; fi
  mkdir -p "$install_dir"
  cp -a "$source_dir/." "$install_dir/"
fi
cd "$install_dir"
if [[ ! -f .env ]]; then
  echo 'Set a server access password (at least 16 characters; letters, digits, . _ - only).'
  read -r -s -p 'Password: ' sentinel_password; echo
  read -r -s -p 'Repeat password: ' sentinel_repeat; echo
  if [[ "$sentinel_password" != "$sentinel_repeat" || ! "$sentinel_password" =~ ^[A-Za-z0-9._-]{16,}$ ]]; then echo 'Passwords do not match or do not meet the format.'; exit 1; fi
  read -r -p "Browser address [http://$(hostname).local:3000]: " sentinel_origin
  sentinel_origin="${sentinel_origin:-http://$(hostname).local:3000}"
  if [[ ! "$sentinel_origin" =~ ^https?://[A-Za-z0-9.-]+(:[0-9]+)?$ ]]; then echo 'Enter an HTTP or HTTPS origin without a path.'; exit 1; fi
  umask 077
  if [[ "$sentinel_origin" == https://* ]]; then
    printf 'SENTINEL_PASSWORD=%s\nPUBLIC_ORIGIN=%s\nBIND_ADDRESS=127.0.0.1\nCOOKIE_SECURE=true\n' "$sentinel_password" "$sentinel_origin" > .env
  else
    echo 'HTTP is for trusted LAN testing. Configure HTTPS and student permissions before using private records.'
    printf 'SENTINEL_PASSWORD=%s\nPUBLIC_ORIGIN=%s\nBIND_ADDRESS=0.0.0.0\nCOOKIE_SECURE=false\n' "$sentinel_password" "$sentinel_origin" > .env
  fi
  unset sentinel_password sentinel_repeat
fi
apt-get update
apt-get install -y docker.io docker-compose
systemctl enable --now docker
if docker compose version >/dev/null 2>&1; then docker compose up -d --build; else docker-compose up -d --build; fi
echo 'Sentinel is starting. Open the PUBLIC_ORIGIN address in /opt/sentinel-weight-room/.env.'
echo 'For status: cd /opt/sentinel-weight-room && sudo docker compose ps'
