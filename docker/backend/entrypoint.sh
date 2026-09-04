#!/bin/sh
set -e

echo "[kuberone-api] Waiting for MySQL..."
until nc -z mysql 3306; do
  sleep 2
done
echo "[kuberone-api] MySQL is up"

if [ -n "$REDIS_URL" ]; then
  echo "[kuberone-api] Waiting for Redis..."
  until nc -z redis 6379; do
    sleep 1
  done
  echo "[kuberone-api] Redis is up"
fi

cd /app

if [ "$DOCKER_RUN_MIGRATIONS" = "true" ]; then
  echo "[kuberone-api] Running Prisma migrations..."
  node node_modules/prisma/build/index.js migrate deploy --schema=database/prisma/schema
fi

if [ "$DOCKER_SEED_ON_START" = "true" ] && [ ! -f /app/apps/backend/storage/.seeded ]; then
  echo "[kuberone-api] Seeding database (first run)..."
  mkdir -p /app/apps/backend/storage
  SEED_FILE="database/prisma/seeds/dev.seed.ts"
  if [ "$APP_ENV" = "production" ] && [ -f database/prisma/seeds/production.seed.ts ]; then
    SEED_FILE="database/prisma/seeds/production.seed.ts"
  fi
  if node scripts/tsx.mjs "$SEED_FILE"; then
    touch /app/apps/backend/storage/.seeded
    echo "[kuberone-api] Seed completed ($SEED_FILE)"
  else
    echo "[kuberone-api] Seed skipped or failed — API will still start"
  fi
fi

# Local document uploads land on the named volume mounted at apps/backend/storage
mkdir -p /app/apps/backend/storage/documents
export DOCUMENT_STORAGE_PATH="${DOCUMENT_STORAGE_PATH:-/app/apps/backend/storage/documents}"

echo "[kuberone-api] Starting API server..."
exec "$@"
