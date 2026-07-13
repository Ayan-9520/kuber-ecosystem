# Kuber Verified Professional — public web (nginx + SPA)
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web-public apps/web-public
COPY packages/shared-theme packages/shared-theme
COPY packages/shared-utils packages/shared-utils
COPY packages/shared-types packages/shared-types
COPY scripts scripts
COPY tsconfig.base.json ./

ENV CI=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN pnpm install --frozen-lockfile --ignore-scripts --filter @kuberone/web-public...
# Vite resolves workspace packages via source aliases — skip tsc in Docker for reliability
RUN pnpm --filter @kuberone/web-public run build:docker

FROM nginx:1.27-alpine AS runner
COPY docker/web-public/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web-public/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
