#!/bin/bash

# AWS S3 Deployment Script for Blog Admin
# Make sure to install AWS CLI and configure it with your credentials

set -e

# Configuration
BUCKET_NAME="your-s3-bucket-name"  # Replace with your actual S3 bucket name
REGION="us-east-1"  # Replace with your AWS region
DIST_DIR="dist"
CLOUDFRONT_DISTRIBUTION_ID="your-cloudfront-distribution-id"  # Optional: if using CloudFront

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building the application..."
npm run build

# Check if build was successful
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Upload to S3
echo "📤 Uploading to S3 bucket: $BUCKET_NAME"

# Upload all files with proper MIME types
aws s3 sync $DIST_DIR/ s3://$BUCKET_NAME/ \
    --region $REGION \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML files with no-cache
aws s3 sync $DIST_DIR/ s3://$BUCKET_NAME/ \
    --region $REGION \
    --cache-control "no-cache, no-store, must-revalidate" \
    --include "*.html" \
    --include "*.json"

# Set proper MIME types for JavaScript files
aws s3 cp $DIST_DIR/ s3://$BUCKET_NAME/ \
    --region $REGION \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

# Set proper MIME types for CSS files
aws s3 cp $DIST_DIR/ s3://$BUCKET_NAME/ \
    --region $REGION \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE

# Configure S3 bucket for static website hosting
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html

# Set bucket policy for public read access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Clean up
rm bucket-policy.json

# Invalidate CloudFront cache if using CloudFront
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is available at: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
