#!/usr/bin/env bash
# Bootstrap KuberOne API on Hostinger KVM 2 (Ubuntu 22.04/24.04)
# Run as root on the VPS AFTER DNS A record api.kuberone.online → this server IP.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Ayan-9520/kuber-ecosystem.git}"
APP_DIR="${APP_DIR:-/opt/kuberone}"
DOMAIN="${API_DOMAIN:-api.kuberone.online}"

echo "==> Installing Docker if missing"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

echo "==> Clone / update repo at ${APP_DIR}"
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "${APP_DIR}/.git" ]; then
  git -C "$APP_DIR" fetch --all
  git -C "$APP_DIR" checkout main
  git -C "$APP_DIR" pull --ff-only origin main
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
ENV_FILE="deployment/docker/.env.vps"
if [ ! -f "$ENV_FILE" ]; then
  cp deployment/docker/env.vps.example "$ENV_FILE"
  echo "Created $ENV_FILE — edit secrets BEFORE continuing:"
  echo "  nano $ENV_FILE"
  exit 1
fi

# Fail early if placeholders remain
if grep -q 'CHANGE_ME_' "$ENV_FILE"; then
  echo "ERROR: Replace all CHANGE_ME_ values in $ENV_FILE first."
  exit 1
fi

echo "==> Building and starting VPS stack (MySQL + Redis + API + worker + Caddy)"
docker compose -f deployment/docker/docker-compose.vps.yml --env-file "$ENV_FILE" up -d --build

echo "==> Waiting for health"
for i in $(seq 1 60); do
  if curl -sf "https://${DOMAIN}/health/live" >/dev/null 2>&1; then
    echo "OK: https://${DOMAIN}/health/live"
    docker compose -f deployment/docker/docker-compose.vps.yml --env-file "$ENV_FILE" ps
    exit 0
  fi
  sleep 5
done

echo "WARN: HTTPS health not ready yet. Check:"
echo "  docker compose -f deployment/docker/docker-compose.vps.yml --env-file $ENV_FILE logs -f"
exit 1
