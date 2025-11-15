# Blog Admin Deployment Guide

This guide covers deploying the Blog Admin React application to AWS S3 with Nginx and PM2.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js and npm installed
- PM2 installed globally (`npm install -g pm2`)
- Nginx installed (for EC2 deployment)

## Deployment Options

### Option 1: AWS S3 Static Website Hosting

1. **Configure your S3 bucket name in `deploy.sh`:**
   ```bash
   # Edit deploy.sh and update:
   BUCKET_NAME="your-actual-bucket-name"
   REGION="your-aws-region"
   ```

2. **Run the deployment:**
   ```bash
   npm run deploy:s3
   ```

### Option 2: EC2 with Nginx and PM2

1. **Update configuration files:**
   - Edit `ecosystem.config.js` with your server details
   - Edit `nginx.conf` with your domain name
   - Edit `deploy-ec2.sh` with your server paths

2. **Deploy to EC2:**
   ```bash
   npm run deploy:ec2
   ```

## Manual Deployment Steps

### For S3 Deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload to S3 with proper MIME types:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   ```

3. Set proper MIME types for JavaScript files:
   ```bash
   aws s3 cp dist/ s3://your-bucket-name/ --recursive --exclude "*" --include "*.js" --content-type "application/javascript" --metadata-directive REPLACE
   ```

### For EC2 Deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy files to your server:
   ```bash
   scp -r dist/ user@your-server:/var/www/blog-admin/
   ```

3. Configure Nginx:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/blog-admin
   sudo ln -s /etc/nginx/sites-available/blog-admin /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## Troubleshooting MIME Type Issues

The configuration files include specific settings to fix MIME type issues:

- **Nginx**: Proper Content-Type headers for JavaScript files
- **S3**: Correct MIME type metadata for uploaded files
- **Vite**: Optimized build configuration

## Monitoring

- **PM2**: `pm2 monit` to monitor your application
- **Nginx**: `sudo nginx -t` to test configuration
- **Logs**: Check `/var/www/blog-admin/logs/` for application logs

## Security Notes

- Ensure your S3 bucket has proper CORS configuration
- Use HTTPS in production
- Configure proper security headers in Nginx
- Keep your dependencies updated
