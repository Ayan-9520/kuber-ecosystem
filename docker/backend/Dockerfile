# KuberOne Backend API — Docker full-stack image (migrate on start)
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/backend/package.json apps/backend/
COPY packages/ packages/
COPY database/package.json database/
ENV CI=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_OPTIONS=--max-old-space-size=8192
# Only backend workspace graph — smaller install, less OOM risk
RUN pnpm install --frozen-lockfile --ignore-scripts --filter @kuberone/backend...
RUN pnpm rebuild prisma @prisma/client

FROM deps AS build
COPY apps/backend apps/backend
COPY database database
COPY scripts scripts
COPY tsconfig.base.json ./
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN find packages database apps/backend -name '*.tsbuildinfo' -delete 2>/dev/null || true
RUN pnpm --filter @kuberone/database generate
RUN pnpm --filter @kuberone/shared-types build \
  && pnpm --filter @kuberone/shared-config build \
  && pnpm --filter @kuberone/shared-validation build \
  && pnpm --filter @kuberone/shared-utils build
RUN npm install -g esbuild@0.25.0 \
  && mkdir -p database/dist \
  && esbuild database/src/index.ts --outfile=database/dist/index.js --platform=node --format=esm --packages=external \
  && printf '%s\n' \
    "import type { PrismaClient } from '@prisma/client';" \
    "export { PrismaClient } from '@prisma/client';" \
    "export type * from '@prisma/client';" \
    "export declare const prisma: PrismaClient;" \
    "export declare function disconnectDatabase(): Promise<void>;" \
    > database/dist/index.d.ts
RUN node scripts/docker-link-workspaces.mjs
RUN pnpm --filter @kuberone/backend run build:docker
FROM node:20-alpine AS runner
RUN apk add --no-cache netcat-openbsd wget
RUN addgroup -g 1001 -S kuberone && adduser -S kuberone -u 1001
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/database ./database
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/.npmrc ./.npmrc
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY docker/backend/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh && mkdir -p /app/apps/backend/storage && chown -R kuberone:kuberone /app/apps/backend/storage

USER kuberone
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=8 \
  CMD wget -qO- http://localhost:4000/health/live || exit 1
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "apps/backend/dist/server.js"]
