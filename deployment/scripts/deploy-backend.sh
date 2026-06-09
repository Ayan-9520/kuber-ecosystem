#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/kuberone}"
ENV="${1:-production}"

echo "==> Deploying KuberOne Backend ($ENV)"
cd "$APP_DIR"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building packages and backend"
pnpm build --filter=@kuberone/backend...

echo "==> Running database migrations"
pnpm db:migrate:deploy

echo "==> Restarting PM2"
pm2 startOrReload deployment/pm2/ecosystem.config.cjs --env "$ENV"
pm2 save

echo "==> Backend deployment complete"
