#!/bin/bash
# deploy_app.sh
# description: Copies project, installs deps, builds frontend, starts backend, configures Nginx

APP_DIR="/var/www/followerjerry.com"
DOMAIN="followerjerry.com"

echo ">>> 1. Creating Project Directory ($APP_DIR)..."
mkdir -p "$APP_DIR"
# Copy from current folder (including hidden files like .env)
cp -rT . "$APP_DIR"
chown -R root:root "$APP_DIR"
cd "$APP_DIR" || exit

echo ">>> 2. Installing Backend Dependencies..."
cd server || exit
npm install
cd ..

echo ">>> 3. Installing Frontend Dependencies & Building..."
npm install
npm run build

echo ">>> 4. Starting Backend with PM2..."
cd server || exit
pm2 start index.js --name "jerry-api"
pm2 save
cd ..

echo ">>> 5. Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN www.$DOMAIN 77.42.65.87;

    root $APP_DIR/dist;
    index index.html;

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
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx

echo ">>> 6. Securing with SSL (Certbot)..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m maram24900@gmail.com || echo ">>> Cannot apply SSL yet (domain not pointing to IP). Skipping SSL for now. <<<"

systemctl restart nginx

echo ">>> Deployment Complete! Your app should be live at https://$DOMAIN <<<"
