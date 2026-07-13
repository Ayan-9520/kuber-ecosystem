# KuberOne gateway — reverse proxy (API + Admin)
FROM nginx:1.27-alpine
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/gateway-health || exit 1
CMD ["nginx", "-g", "daemon off;"]
