#!/usr/bin/env bash
set -euo pipefail

# KuberOne EC2 bootstrap — Ubuntu 22.04 LTS
# Run as root or with sudo

echo "==> Installing system dependencies"
apt-get update
apt-get install -y curl git nginx build-essential

echo "==> Installing Node.js 20 via nvm"
export NVM_DIR="/root/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
npm install -g pnpm@9 pm2

echo "==> Creating application directories"
mkdir -p /opt/kuberone
mkdir -p /var/log/kuberone
chown -R www-data:www-data /var/log/kuberone

echo "==> Configuring Nginx"
cp /opt/kuberone/deployment/nginx/kuberone.conf /etc/nginx/sites-available/kuberone
ln -sf /etc/nginx/sites-available/kuberone /etc/nginx/sites-enabled/kuberone
nginx -t && systemctl reload nginx

echo "==> EC2 setup complete"
echo "    Clone repo to /opt/kuberone and run deployment/scripts/deploy-backend.sh"
