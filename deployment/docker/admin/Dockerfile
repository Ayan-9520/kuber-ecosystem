# KuberOne CRM Admin — nginx static + SPA
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/admin apps/admin
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=@kuberone/admin...

FROM nginx:1.27-alpine AS runner
COPY deployment/docker/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
