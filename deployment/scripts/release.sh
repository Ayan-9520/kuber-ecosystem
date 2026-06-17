#!/usr/bin/env bash
set -euo pipefail

# KuberOne Release Script
# Usage: bash deployment/scripts/release.sh <version> [branch]
# Example: bash deployment/scripts/release.sh 1.1.0 release/1.1.0

VERSION="${1:?Version required (e.g. 1.1.0)}"
BRANCH="${2:-release/$VERSION}"
APP_DIR="${APP_DIR:-/opt/kuberone}"

echo "==> KuberOne Release $VERSION from $BRANCH"
cd "$APP_DIR"

git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Running quality gates"
node scripts/prisma-migration-gate.mjs
node scripts/openapi-validate.mjs

echo "==> Building all targets"
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm test

echo "==> Tagging release"
git tag -a "v$VERSION" -m "KuberOne release v$VERSION"
git push origin "v$VERSION"

echo "==> Generating changelog snippet"
git log "$(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~20)..HEAD" --pretty=format:'- %s' > "release-notes-v$VERSION.md"

echo "==> Release $VERSION prepared. Push tag and trigger production deploy workflow."
