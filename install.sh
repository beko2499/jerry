#!/bin/bash
# ============================================================
#  Jerry Store — Full Installation Script (Apache + Node.js)
#  Domain: followerjerry.com
#  Run: chmod +x install.sh && sudo ./install.sh
# ============================================================

set -e

DOMAIN="followerjerry.com"
PROJECT_DIR="/var/www/jerry"
DIST_DIR="$PROJECT_DIR/dist"
SERVER_DIR="$PROJECT_DIR/server"
NODE_PORT=5000

echo ""
echo "======================================"
echo "  🚀 Jerry Store — Full Installation"
echo "  Domain: $DOMAIN"
echo "======================================"
echo ""

# ============ 1. Update system ============
echo "📦 Updating system packages..."
apt-get update -y
apt-get install -y curl wget gnupg software-properties-common dos2unix

# ============ 2. Install MongoDB 7 ============
if ! command -v mongod &> /dev/null; then
    echo ""
    echo "📦 Installing MongoDB 7..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update -y
    apt-get install -y mongodb-org

    # Start and enable MongoDB
    systemctl start mongod
    systemctl enable mongod
    echo "✅ MongoDB 7 installed and running"
else
    echo "✅ MongoDB already installed"
    systemctl start mongod 2>/dev/null || true
fi

# Verify MongoDB is running
if systemctl is-active --quiet mongod; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  Starting MongoDB..."
    systemctl start mongod
fi

# ============ 3. Install Node.js 20 LTS ============
if ! command -v node &> /dev/null; then
    echo ""
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "✅ Node.js $(node -v) installed"
else
    echo "✅ Node.js $(node -v) already installed"
fi

# ============ 4. Install PM2 ============
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

# ============ 5. Create .env file ============
echo ""
if [ ! -f "$SERVER_DIR/.env" ]; then
    echo "📝 Creating server/.env file..."

    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -hex 32)

    cat > "$SERVER_DIR/.env" << ENVFILE
MONGO_URI=mongodb://localhost:27017/jerry
PORT=$NODE_PORT
EMAIL_USER=maram24900@gmail.com
EMAIL_PASS=iaen xwam ymlj yuuz
EMAIL_FROM=Jerry Store <maram24900@gmail.com>
NOWPAYMENTS_API_KEY=QC99FWD-K7HM4Y2-QA2HYQ4-1A65S3V
APP_URL=https://$DOMAIN
JWT_SECRET=$JWT_SECRET
ENVFILE

    echo "✅ .env file created with secure JWT_SECRET"
else
    echo "✅ .env file already exists — skipping"
fi

# ============ 6. Install dependencies ============
echo ""
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_DIR"
npm install

echo "📦 Installing backend dependencies..."
cd "$SERVER_DIR"
npm install
cd "$PROJECT_DIR"

# ============ 7. Build frontend ============
echo ""
echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built → $DIST_DIR"

# ============ 8. Seed database (initial data) ============
echo ""
if [ -f "$SERVER_DIR/seed.js" ]; then
    echo "🌱 Seeding database with initial data..."
    cd "$SERVER_DIR"
    node seed.js 2>/dev/null || echo "⚠️  Seed skipped (may already exist)"
    cd "$PROJECT_DIR"
fi

# ============ 9. Enable Apache modules ============
echo ""
echo "⚙️ Enabling Apache modules..."
a2enmod proxy proxy_http rewrite headers ssl 2>/dev/null || true
echo "✅ Apache modules enabled"

# ============ 10. Create Apache Virtual Host ============
echo ""
echo "📝 Creating Apache config for $DOMAIN..."

cat > /etc/apache2/sites-available/$DOMAIN.conf << 'APACHE_CONF'
<VirtualHost *:80>
    ServerName followerjerry.com
    ServerAlias www.followerjerry.com

    # Frontend — React built files
    DocumentRoot /var/www/jerry/dist

    <Directory /var/www/jerry/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # React SPA — All non-file routes go to index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Uploaded files
    Alias /uploads /var/www/jerry/server/uploads
    <Directory /var/www/jerry/server/uploads>
        Options -Indexes
        Require all granted
    </Directory>

    # API — Reverse proxy to Node.js backend
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:5000/api
    ProxyPassReverse /api http://127.0.0.1:5000/api

    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"

    ErrorLog ${APACHE_LOG_DIR}/jerry-error.log
    CustomLog ${APACHE_LOG_DIR}/jerry-access.log combined
</VirtualHost>
APACHE_CONF

# Enable the site and disable default
a2ensite $DOMAIN.conf 2>/dev/null || true
a2dissite 000-default.conf 2>/dev/null || true

# Test and restart Apache
echo "🔍 Testing Apache config..."
apache2ctl configtest
systemctl restart apache2
echo "✅ Apache configured and restarted"

# ============ 11. Start backend with PM2 ============
echo ""
echo "🚀 Starting Node.js backend..."

pm2 delete jerry-api 2>/dev/null || true
cd "$SERVER_DIR"
pm2 start index.js --name jerry-api
pm2 save

# Auto-start PM2 on system reboot
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save
echo "✅ Backend running on port $NODE_PORT"

# ============ 12. SSL Certificate (Let's Encrypt) ============
echo ""
echo "🔒 Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-apache
fi
certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect 2>/dev/null || {
    echo ""
    echo "⚠️  SSL setup failed — domain DNS may not point to this server yet"
    echo "   After DNS is configured, run:"
    echo "   sudo certbot --apache -d $DOMAIN -d www.$DOMAIN"
}

# ============ 13. Set permissions ============
echo ""
echo "🔐 Setting file permissions..."
chown -R www-data:www-data "$DIST_DIR"
chmod -R 755 "$DIST_DIR"
mkdir -p "$SERVER_DIR/uploads"
chown -R www-data:www-data "$SERVER_DIR/uploads"

# ============ Done ============
echo ""
echo "======================================"
echo "  ✅ Installation Complete!"
echo "======================================"
echo ""
echo "  🌐 Website:    http://$DOMAIN"
echo "  🔧 API:        http://$DOMAIN/api"
echo "  🗄️  Database:   MongoDB (jerry)"
echo "  📁 Project:    $PROJECT_DIR"
echo "  📁 Frontend:   $DIST_DIR"
echo "  📁 Backend:    $SERVER_DIR"
echo "  📁 Uploads:    $SERVER_DIR/uploads"
echo ""
echo "  Useful commands:"
echo "  ─────────────────────────────────────"
echo "  ./update.sh              Update website"
echo "  pm2 status               Check backend status"
echo "  pm2 logs jerry-api       View backend logs"
echo "  pm2 restart jerry-api    Restart backend"
echo "  mongosh jerry            Open database shell"
echo "  systemctl status mongod  Check MongoDB status"
echo "  systemctl status apache2 Check Apache status"
echo ""
