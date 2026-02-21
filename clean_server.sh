#!/bin/bash
# clean_server.sh
# Warning: This script completely formats the existing server for the Jerry Store project.

echo ">>> WARNING: THIS SCRIPT WILL WIPE ALL JERRY Store DATA <<<"
echo ">>> Sleeping for 5 seconds. Press Ctrl+C to cancel. <<<"
sleep 5

echo "1. Stopping and deleting all PM2 processes..."
pm2 stop all
pm2 delete all
pm2 save --force

echo "2. Dropping MongoDB database (jerry)..."
mongosh jerry --eval "db.dropDatabase()"

echo "3. Removing old project folder..."
rm -rf /var/www/followerjerry.com

echo "4. Removing old Nginx configs for followerjerry.com..."
rm -f /etc/nginx/sites-available/followerjerry.com
rm -f /etc/nginx/sites-enabled/followerjerry.com
systemctl reload nginx

echo "5. Removing Apache (if installed recently)..."
systemctl stop apache2
apt-get purge apache2 apache2-utils apache2-bin apache2.2-common -y
apt-get autoremove -y

echo ">>> Server cleaning complete! <<<"
