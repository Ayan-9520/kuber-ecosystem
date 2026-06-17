# KuberOne Monitoring Stack — Prometheus + Grafana bundle
FROM prom/prometheus:v2.54.1 AS prometheus
FROM grafana/grafana:11.2.0 AS grafana

FROM alpine:3.20
RUN apk add --no-cache bash curl
COPY --from=prometheus /bin/prometheus /usr/local/bin/prometheus
COPY --from=grafana /usr/share/grafana /usr/share/grafana
COPY deployment/monitoring/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
COPY deployment/monitoring/grafana/provisioning /etc/grafana/provisioning
COPY deployment/monitoring/grafana/dashboards /var/lib/grafana/dashboards
COPY deployment/docker/monitoring/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 9090 3000
ENTRYPOINT ["/entrypoint.sh"]
