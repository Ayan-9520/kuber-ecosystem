#!/usr/bin/env bash
set -euo pipefail

echo "==> KuberOne Monorepo Setup"

if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm@9
fi

echo "==> Installing dependencies"
pnpm install

echo "==> Copying environment files"
for env_file in .env.example apps/backend/.env.example apps/admin/.env.example apps/mobile-customer/.env.example apps/mobile-dsa/.env.example database/.env.example; do
  target="${env_file/.env.example/.env.local}"
  if [ -f "$env_file" ] && [ ! -f "$target" ]; then
    cp "$env_file" "$target"
    echo "  Created $target"
  fi
done

echo "==> Generating Prisma client"
pnpm db:generate

echo "==> Building shared packages"
pnpm build --filter=@kuberone/shared-types --filter=@kuberone/shared-utils --filter=@kuberone/shared-config --filter=@kuberone/shared-validation --filter=@kuberone/database

echo "==> Setup complete"
echo "    Run: pnpm dev:backend"
echo "    Run: pnpm dev:admin"
echo "    Run: pnpm dev:mobile-customer"
