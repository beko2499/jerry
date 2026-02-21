#!/bin/bash
# setup_server.sh
# description: Installs Node.js, MongoDB, Nginx, and PM2

echo ">>> 1. Updating System..."
apt update && apt upgrade -y

echo ">>> 2. Installing Node.js (v20)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo ">>> 3. Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod

echo ">>> 4. Installing Nginx & Certbot..."
apt install -y nginx certbot python3-certbot-nginx
systemctl restart nginx

echo ">>> 5. Installing PM2 globally..."
npm install -g pm2

echo ">>> Server Setup Complete! <<<"
