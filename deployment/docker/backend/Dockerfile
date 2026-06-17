# KuberOne Backend API — multi-stage production image
# Registry: ghcr.io/kuberfinserve/kuberone-backend | docker.io/kuberfinserve/kuberone-backend | ECR

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/ packages/
COPY database/package.json database/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/backend apps/backend
COPY database database
COPY tsconfig.base.json ./
RUN pnpm --filter @kuberone/database generate
RUN pnpm build --filter=@kuberone/backend...

FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S kuberone && adduser -S kuberone -u 1001
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/database ./database
USER kuberone
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/health/live || exit 1
CMD ["node", "apps/backend/dist/server.js"]
