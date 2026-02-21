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

# ============ 1. Install Node.js 20 LTS ============
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "✅ Node.js $(node -v) installed"
else
    echo "✅ Node.js $(node -v) already installed"
fi

# ============ 2. Install PM2 ============
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

# ============ 3. Install project dependencies ============
echo ""
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_DIR"
npm install

echo "📦 Installing backend dependencies..."
cd "$SERVER_DIR"
npm install
cd "$PROJECT_DIR"

# ============ 4. Build frontend ============
echo ""
echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built → $DIST_DIR"

# ============ 5. Enable Apache modules ============
echo ""
echo "⚙️ Enabling Apache modules..."
a2enmod proxy proxy_http rewrite headers ssl 2>/dev/null || true
echo "✅ Apache modules enabled"

# ============ 6. Create Apache Virtual Host ============
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

    # React SPA — All non-file routes go to index.html
    <Directory /var/www/jerry/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

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

# Test Apache config
echo "🔍 Testing Apache config..."
apache2ctl configtest

# Restart Apache
systemctl restart apache2
echo "✅ Apache configured and restarted"

# ============ 7. Start backend with PM2 ============
echo ""
echo "🚀 Starting Node.js backend on port $NODE_PORT..."

# Stop existing if running
pm2 delete jerry-api 2>/dev/null || true

cd "$SERVER_DIR"
pm2 start index.js --name jerry-api
pm2 save

# Auto-start PM2 on system boot
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save

echo "✅ Backend running on port $NODE_PORT"

# ============ 8. Install SSL (Let's Encrypt) ============
echo ""
echo "🔒 Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-apache
fi
certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect 2>/dev/null || {
    echo "⚠️  SSL setup failed (domain DNS may not be pointing to this server yet)"
    echo "   Run this later: sudo certbot --apache -d $DOMAIN -d www.$DOMAIN"
}

# ============ Done ============
echo ""
echo "======================================"
echo "  ✅ Installation Complete!"
echo "======================================"
echo ""
echo "  🌐 Website:  http://$DOMAIN"
echo "  🔧 API:      http://$DOMAIN/api"
echo "  📁 Project:  $PROJECT_DIR"
echo "  📁 Frontend: $DIST_DIR"
echo "  📁 Backend:  $SERVER_DIR"
echo ""
echo "  📝 To update later, run:"
echo "     cd $PROJECT_DIR && ./update.sh"
echo ""
echo "  📝 To check backend status:"
echo "     pm2 status"
echo "     pm2 logs jerry-api"
echo ""
