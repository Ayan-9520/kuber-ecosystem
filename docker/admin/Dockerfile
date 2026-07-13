# KuberOne CRM Admin — Docker full-stack (nginx + API proxy)
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/admin apps/admin
COPY packages/ packages/
COPY scripts scripts
COPY openapi openapi
COPY postman postman
COPY tsconfig.base.json ./

ENV CI=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm install --frozen-lockfile --ignore-scripts --filter @kuberone/admin...
# Vite resolves workspace packages via source aliases — skip tsc in Docker for reliability
RUN pnpm --filter @kuberone/admin run build:docker

FROM nginx:1.27-alpine AS runner
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
