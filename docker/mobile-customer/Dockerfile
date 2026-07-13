# KuberOne Customer App — Expo web export + nginx
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ARG EXPO_PUBLIC_API_BASE_URL=/api/v1
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL
ENV EXPO_PUBLIC_APP_ENV=development
ENV CI=true
ENV EXPO_OFFLINE=1
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/mobile-customer apps/mobile-customer
COPY packages packages
COPY scripts scripts
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile --ignore-scripts --filter @kuberone/mobile-customer...
RUN pnpm --filter @kuberone/shared-types --filter @kuberone/shared-theme --filter @kuberone/shared-validation --filter @kuberone/shared-utils run build
RUN pnpm --filter @kuberone/mobile-customer run build:docker

FROM nginx:1.27-alpine AS runner
COPY docker/mobile-customer/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/mobile-customer/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
