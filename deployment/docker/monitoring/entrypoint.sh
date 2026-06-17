#!/bin/sh
set -e
prometheus --config.file=/etc/prometheus/prometheus.yml --storage.tsdb.path=/prometheus &
GF_PATHS_PROVISIONING=/etc/grafana/provisioning /usr/share/grafana/bin/grafana-server \
  --homepath=/usr/share/grafana cfg:default.paths.data=/var/lib/grafana &
wait
