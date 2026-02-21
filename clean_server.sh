#!/bin/bash
# clean_server.sh
# Warning: This script completely formats the existing server for the Jerry Store project.
# It removes EVERYTHING: Node, PM2, MongoDB, Apache, Nginx, and all project files.

echo ">>> WARNING: THIS SCRIPT WILL WIPE THE ENTIRE SERVER CLEAN <<<"
echo ">>> Sleeping for 10 seconds. Press Ctrl+C to cancel. <<<"
sleep 10

echo "1. Stopping and deleting all PM2 processes..."
pm2 stop all
pm2 delete all
npm uninstall -g pm2
rm -rf ~/.pm2

echo "2. Completely removing MongoDB..."
systemctl stop mongod
apt-get purge -y mongodb-org*
apt-get autoremove -y
rm -r /var/log/mongodb
rm -r /var/lib/mongodb

echo "3. Completely removing Node.js & NPM..."
apt-get purge -y nodejs npm
apt-get autoremove -y
rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node_modules
rm -rf /etc/apt/sources.list.d/nodesource.list

echo "4. Removing old Nginx..."
systemctl stop nginx
apt-get purge -y nginx nginx-common
apt-get autoremove -y
rm -rf /etc/nginx

echo "5. Removing old Apache..."
systemctl stop apache2
apt-get purge -y apache2 apache2-utils apache2-bin apache2.2-common
apt-get autoremove -y
rm -rf /etc/apache2

echo "6. Removing Certbot (SSL)..."
apt-get purge -y certbot python3-certbot-nginx python3-certbot-apache
apt-get autoremove -y
rm -rf /etc/letsencrypt
rm -rf /var/lib/letsencrypt

echo "7. Deleting ALL project folders from /var/www/..."
rm -rf /var/www/*

echo "8. Cleaning up system packages..."
apt-get autoremove -y
apt-get clean

echo ">>> Server is now completely factory reset. <<<"
