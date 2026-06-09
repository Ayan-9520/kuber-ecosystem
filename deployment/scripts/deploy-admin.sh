#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/kuberone}"

echo "==> Deploying KuberOne Admin Panel"
cd "$APP_DIR"

pnpm install --frozen-lockfile
pnpm build --filter=@kuberone/admin

echo "==> Admin static assets deployed to apps/admin/dist"
echo "==> Nginx serves from /opt/kuberone/apps/admin/dist"
nginx -t && systemctl reload nginx

echo "==> Admin deployment complete"
