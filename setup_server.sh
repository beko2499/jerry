#!/bin/bash
# setup_server.sh
# Installs all server dependencies: Git, Node.js, MongoDB, Nginx, Certbot, PM2

set -e

echo ">>> 1. Updating System..."
apt update && apt upgrade -y

echo ">>> 2. Installing Git..."
apt install -y git

echo ">>> 3. Installing Node.js (v20)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo ">>> 4. Installing MongoDB (6.0)..."
apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod

echo ">>> 5. Installing Nginx & Certbot..."
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx

echo ">>> 6. Installing PM2 globally..."
npm install -g pm2

echo ">>> Server Setup Complete! <<<"
echo ">>> Next: run deploy_app.sh <<<"
