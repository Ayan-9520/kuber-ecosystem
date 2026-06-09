#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"

if [ "$MODE" = "deploy" ]; then
  pnpm db:migrate:deploy
else
  pnpm db:migrate
fi
