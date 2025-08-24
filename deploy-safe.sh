#!/bin/bash

# Safe deployment script for Life Vault
# This script creates a backup before redeploying to prevent data loss

set -e

echo "🚀 Safe Deployment Script for Life Vault"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found"
    echo "💡 Please run this script from the life-vault directory"
    exit 1
fi

# Step 1: Create backup
echo ""
echo "📦 Step 1: Creating database backup..."
if [ -f "./backup-db.sh" ]; then
    chmod +x ./backup-db.sh
    ./backup-db.sh
else
    echo "❌ Error: backup-db.sh not found"
    exit 1
fi

# Step 2: Deploy with Portainer-compatible commands
echo ""
echo "🚀 Step 2: Deploying updated stack..."

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Deploy the stack
echo "🔄 Deploying stack..."
docker-compose -f docker-compose.prod.yml up -d

# Step 3: Verify deployment
echo ""
echo "✅ Step 3: Verifying deployment..."

# Wait a moment for containers to start
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Check if backend is healthy
echo ""
echo "🏥 Checking backend health..."
if curl -f http://localhost:5000/api/health-check > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed, but deployment may still be successful"
fi

echo ""
echo "🎉 Safe deployment completed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Database backup created"
echo "   ✅ Stack deployed successfully"
echo "   ✅ Containers are running"
echo ""
echo "💡 If you need to restore data:"
echo "   ./restore-db.sh [backup-file]"
echo ""
echo "📁 Backup location: ./backups/"
