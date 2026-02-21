#!/bin/bash
# deploy_app.sh
# description: Copies project, installs deps, builds frontend, starts backend, configures Apache

APP_DIR="/var/www/followerjerry.com"
DOMAIN="followerjerry.com"

echo ">>> 1. Creating Project Directory ($APP_DIR)..."
mkdir -p "$APP_DIR"
# Copy from current folder (where script is run)
cp -r ./* "$APP_DIR/"
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

echo ">>> 5. Configuring Apache..."
cat > /etc/apache2/sites-available/$DOMAIN.conf <<EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $APP_DIR/dist

    <Directory $APP_DIR/dist>
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:5000/api
    ProxyPassReverse /api http://127.0.0.1:5000/api

    ErrorLog \${APACHE_LOG_DIR}/${DOMAIN}_error.log
    CustomLog \${APACHE_LOG_DIR}/${DOMAIN}_access.log combined
</VirtualHost>
EOF

a2ensite $DOMAIN.conf
systemctl reload apache2

echo ">>> 6. Securing with SSL (Certbot)..."
certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m maram24900@gmail.com

systemctl restart apache2

echo ">>> Deployment Complete! Your app should be live at https://$DOMAIN <<<"
