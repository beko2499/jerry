#!/bin/bash
# clean_server.sh
# Warning: This script completely formats the existing server for the Jerry Store project.
# It removes EVERYTHING: Node, PM2, MongoDB, Nginx, Apache, SSL, and all project files.

echo ">>> WARNING: THIS SCRIPT WILL WIPE THE ENTIRE SERVER CLEAN <<<"
echo ">>> Sleeping for 10 seconds. Press Ctrl+C to cancel. <<<"
sleep 10

echo "1. Stopping and deleting all PM2 processes..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null
pm2 unstartup 2>/dev/null
npm uninstall -g pm2 2>/dev/null
rm -rf ~/.pm2

echo "2. Completely removing MongoDB..."
systemctl stop mongod 2>/dev/null
apt-get purge -y mongodb-org* 2>/dev/null
apt-get autoremove -y
rm -rf /var/log/mongodb
rm -rf /var/lib/mongodb
rm -f /etc/apt/sources.list.d/mongodb-org*.list

echo "3. Completely removing Node.js & NPM..."
apt-get purge -y nodejs npm 2>/dev/null
apt-get autoremove -y
rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node_modules
rm -rf /etc/apt/sources.list.d/nodesource.list

echo "4. Removing Nginx..."
systemctl stop nginx 2>/dev/null
apt-get purge -y nginx nginx-common 2>/dev/null
apt-get autoremove -y
rm -rf /etc/nginx

echo "5. Removing Apache..."
systemctl stop apache2 2>/dev/null
apt-get purge -y apache2 apache2-utils apache2-bin apache2.2-common 2>/dev/null
apt-get autoremove -y
rm -rf /etc/apache2

echo "6. Removing Certbot (SSL)..."
apt-get purge -y certbot python3-certbot-nginx python3-certbot-apache 2>/dev/null
apt-get autoremove -y
rm -rf /etc/letsencrypt
rm -rf /var/lib/letsencrypt

echo "7. Removing Git..."
apt-get purge -y git 2>/dev/null
apt-get autoremove -y

echo "8. Deleting ALL project folders from /var/www/..."
rm -rf /var/www/*

echo "9. Cleaning up system packages..."
apt-get autoremove -y
apt-get clean

echo ">>> Server is now completely factory reset. <<<"
echo ">>> Next: run setup_server.sh, then deploy_app.sh <<<"
