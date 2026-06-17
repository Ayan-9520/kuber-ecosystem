# KuberOne Background Workers (automation, content, backup)
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
ENV AUTOMATION_WORKER_ENABLED=true
ENV CONTENT_WORKER_ENABLED=true
ENV BACKUP_WORKER_ENABLED=true
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/database ./database
USER kuberone
CMD ["node", "apps/backend/dist/server.js"]
