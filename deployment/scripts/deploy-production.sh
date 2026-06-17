#!/usr/bin/env bash
set -euo pipefail

# KuberOne Production Deployment — full validation + go-live gates
APP_DIR="${APP_DIR:-/opt/kuberone}"
STRATEGY="${DEPLOY_STRATEGY:-blue-green}"
PROD_API_URL="${PRODUCTION_API_URL:-https://api.kuberone.com}"

echo "==> KuberOne Production Deploy (strategy: $STRATEGY)"
cd "$APP_DIR"

echo "==> Go-Live gates"
node scripts/production-go-live-gate.mjs
node scripts/error-deployment-gate.mjs
node scripts/prisma-migration-gate.mjs

echo "==> Pre-deploy backup"
echo "    Trigger via POST /api/v1/backups scope=DATABASE before migrate"

git fetch origin
git checkout main
git pull origin main

echo "==> Build & validate"
pnpm install --frozen-lockfile
pnpm --filter @kuberone/database generate
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:integration
pnpm security:test

echo "==> Database migrate"
pnpm db:migrate:deploy

echo "==> Deploy ($STRATEGY)"
case "$STRATEGY" in
  blue-green)
    echo "Deploying to inactive slot, then switching traffic"
  ;;
  rolling)
    echo "Rolling update with health checks between instances"
  ;;
esac

pm2 startOrReload deployment/pm2/ecosystem.config.cjs --env production
pm2 save

cd deployment/monitoring && docker compose -f docker-compose.monitoring.yml up -d
cd "$APP_DIR"

echo "==> Post-deploy validation"
PRODUCTION_API_URL="$PROD_API_URL" node scripts/production-deploy-validate.mjs

echo "==> Production deployment complete"
