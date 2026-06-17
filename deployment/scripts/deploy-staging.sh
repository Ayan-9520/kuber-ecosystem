#!/usr/bin/env bash
set -euo pipefail

# KuberOne Staging Deployment — full validation pipeline
APP_DIR="${APP_DIR:-/opt/kuberone}"
BRANCH="${1:-staging}"
STAGING_API_URL="${STAGING_API_URL:-https://staging-api.kuberone.com}"

echo "==> KuberOne Staging Deploy (branch: $BRANCH)"
cd "$APP_DIR"

git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Quality gates"
node scripts/prisma-migration-gate.mjs
node scripts/openapi-validate.mjs
node scripts/error-deployment-gate.mjs || true

echo "==> Install & build"
pnpm install --frozen-lockfile
pnpm --filter @kuberone/database generate
pnpm lint
pnpm typecheck
pnpm build

echo "==> Tests"
pnpm test
pnpm test:integration
pnpm test:mobile
pnpm security:test
pnpm perf:smoke || true

echo "==> Database migrate & seed"
pnpm db:migrate:deploy
pnpm db:seed

echo "==> Restart services"
pm2 startOrReload deployment/pm2/ecosystem.config.cjs --env staging
pm2 save

echo "==> Health checks"
for path in /health /health/live /health/ready; do
  curl -sf "${STAGING_API_URL}${path}" || { echo "Health check failed: $path"; exit 1; }
done
curl -sf "${STAGING_API_URL}/api/v1/monitoring/health/deep" || echo "Deep health warning (non-blocking)"

echo "==> Staging deployment complete"
