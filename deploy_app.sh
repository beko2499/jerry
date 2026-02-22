#!/bin/bash
# deploy_app.sh
# Clones the project from GitHub, installs deps, builds frontend, starts backend, configures Nginx.
# This script is fully automated — no manual steps required.

set -e

REPO="https://github.com/beko2499/jerry.git"
APP_DIR="/var/www/followerjerry.com"
DOMAIN="followerjerry.com"
SERVER_IP="173.212.206.92"

# ===== .env configuration (embedded so no manual file needed) =====
ENV_CONTENT='MONGO_URI=mongodb://localhost:27017/jerry
PORT=5000
EMAIL_USER=maram24900@gmail.com
EMAIL_PASS=iaen xwam ymlj yuuz
EMAIL_FROM=Jerry Store <maram24900@gmail.com>
NOWPAYMENTS_API_KEY=QC99FWD-K7HM4Y2-QA2HYQ4-1A65S3V
APP_URL=https://followerjerry.com
JWT_SECRET=j3rry_s3cur3_k3y_2024_x9f2m1p7q4w8z0'

echo ">>> 1. Cloning Project from GitHub..."
rm -rf "$APP_DIR"
git clone "$REPO" "$APP_DIR"
cd "$APP_DIR" || exit 1

echo ">>> 2. Creating .env file for backend..."
echo "$ENV_CONTENT" > server/.env
echo "   .env created at server/.env"

echo ">>> 3. Installing Backend Dependencies..."
cd server
npm install
cd ..

echo ">>> 4. Installing Frontend Dependencies & Building..."
npm install
npm run build

echo ">>> 5. Creating uploads directory..."
mkdir -p server/uploads

echo ">>> 6. Starting Backend with PM2..."
cd server
pm2 delete jerry-api 2>/dev/null || true
pm2 start index.js --name "jerry-api"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
cd ..

echo ">>> 7. Seeding Admin Account & Default Data..."
cd "$APP_DIR/server"
node seed.js
cd "$APP_DIR"

echo ">>> 8. Configuring Nginx..."

# Create TWO separate server blocks: one for IP, one for domain
# This prevents Certbot from breaking IP access when it modifies the domain block
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
# Server block for IP access (HTTP only — always works)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $SERVER_IP;

    root $APP_DIR/dist;
    index index.html;
    client_max_body_size 100M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}

# Server block for domain (Certbot will modify this to add SSL)
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/dist;
    index index.html;
    client_max_body_size 100M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ">>> 9. Securing with SSL (Certbot)..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m maram24900@gmail.com || echo ">>> Cannot apply SSL yet (domain not pointing to IP). Skipping. <<<"

systemctl restart nginx

echo ""
echo "=== Deployment Complete! ==="
echo "  App: http://$SERVER_IP"
echo "  Domain: https://$DOMAIN"
echo "  PM2: pm2 status"
echo "==========================="
