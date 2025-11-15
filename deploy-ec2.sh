#!/bin/bash

# EC2 Deployment Script with Nginx and PM2
# Run this script on your EC2 instance

set -e

echo "🚀 Starting EC2 deployment process..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install serve for static file serving
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    sudo npm install -g serve
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
fi

# Create application directory
APP_DIR="/var/www/blog-admin"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files (assuming you've uploaded them)
echo "📁 Setting up application files..."
# You would typically copy your built files here
# cp -r dist/* $APP_DIR/

# Create logs directory
sudo mkdir -p $APP_DIR/logs
sudo chown -R $USER:$USER $APP_DIR/logs

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/blog-admin
sudo ln -sf /etc/nginx/sites-available/blog-admin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start/restart services
echo "🔄 Starting services..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at your server's public IP"
echo "📊 Monitor your app with: pm2 monit"
