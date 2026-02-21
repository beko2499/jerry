#!/bin/bash
# clean_server.sh
# Warning: This script completely formats the existing server for the Jerry Store project.

echo ">>> WARNING: THIS SCRIPT WILL WIPE ALL JERRY STORE DATA <<<"
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

echo "4. Removing old Apache configs for followerjerry.com..."
a2dissite followerjerry.com.conf
rm -f /etc/apache2/sites-available/followerjerry.com.conf
systemctl reload apache2

echo ">>> Server cleaning complete! <<<"
