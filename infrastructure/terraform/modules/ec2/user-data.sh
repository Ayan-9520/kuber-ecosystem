#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y docker.io docker-compose-v2 nginx git curl

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

mkdir -p ${app_dir}
chown ubuntu:ubuntu ${app_dir}

# Clone and deploy via CI/CD — placeholder bootstrap
echo "KuberOne EC2 node ready. Run deployment/scripts/deploy-backend.sh via CI/CD."
