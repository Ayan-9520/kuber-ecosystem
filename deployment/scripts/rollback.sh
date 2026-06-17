#!/usr/bin/env bash
set -euo pipefail

# KuberOne Rollback Script
# Usage: bash deployment/scripts/rollback.sh <component> <target-version> [environment]
# Components: backend | admin | worker | monitoring | all

APP_DIR="${APP_DIR:-/opt/kuberone}"
COMPONENT="${1:?Component required: backend|admin|worker|monitoring|all}"
TARGET_VERSION="${2:?Target version/tag required}"
ENV="${3:-production}"
STRATEGY="${ROLLBACK_STRATEGY:-rolling}"

echo "==> KuberOne Rollback: $COMPONENT → $TARGET_VERSION ($ENV, strategy=$STRATEGY)"
cd "$APP_DIR"

rollback_git() {
  local tag="$1"
  echo "==> Checking out version $tag"
  git fetch --tags origin
  git checkout "$tag"
}

rollback_backend() {
  rollback_git "$TARGET_VERSION"
  pnpm install --frozen-lockfile
  pnpm build --filter=@kuberone/backend...
  if [ "${SKIP_DB_MIGRATE:-false}" != "true" ]; then
    echo "==> Database rollback: restore from backup before migrate if schema changed"
    echo "    See deployment/docs/DATABASE_ROLLBACK.md"
  fi
  pm2 startOrReload deployment/pm2/ecosystem.config.cjs --env "$ENV"
}

rollback_admin() {
  rollback_git "$TARGET_VERSION"
  pnpm install --frozen-lockfile
  pnpm build --filter=@kuberone/admin...
  pm2 reload kuberone-admin --env "$ENV" || pm2 startOrReload deployment/pm2/ecosystem.config.cjs --env "$ENV"
}

rollback_worker() {
  rollback_git "$TARGET_VERSION"
  pnpm install --frozen-lockfile
  pnpm build --filter=@kuberone/backend...
  pm2 reload kuberone-worker --env "$ENV" || true
}

rollback_monitoring() {
  cd deployment/monitoring
  docker compose -f docker-compose.monitoring.yml pull || true
  docker compose -f docker-compose.monitoring.yml up -d
}

case "$COMPONENT" in
  backend) rollback_backend ;;
  admin) rollback_admin ;;
  worker) rollback_worker ;;
  monitoring) rollback_monitoring ;;
  all)
    rollback_backend
    rollback_admin
    rollback_worker
    rollback_monitoring
    ;;
  *) echo "Unknown component: $COMPONENT"; exit 1 ;;
esac

pm2 save
echo "==> Rollback complete: $COMPONENT @ $TARGET_VERSION"
