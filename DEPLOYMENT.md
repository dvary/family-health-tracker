# Life Vault Production Deployment Guide

## 🚀 Overview

This guide explains how to deploy Life Vault in production using pre-built Docker images, similar to how Immich and other production applications work.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Portainer (optional, but recommended)
- GitHub account with Container Registry access

## 🔧 Setup Options

### Option 1: Using Pre-built Images (Recommended)

1. **Use the production compose file:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Deploy specific version:**
   ```bash
   LIFE_VAULT_VERSION=v1.0.0 docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Use the deployment script:**
   ```bash
   ./deploy-prod.sh v1.0.0
   ```

### Option 2: Portainer Deployment

1. **In Portainer:**
   - Go to Stacks
   - Create new stack
   - Upload `docker-compose.prod.yml`
   - Set environment variable: `LIFE_VAULT_VERSION=latest`

2. **For updates:**
   - Change `LIFE_VAULT_VERSION` to new version
   - Redeploy stack
   - **No data loss** - volumes are preserved

## 🏗️ Building Images

### Automatic (GitHub Actions)

Images are automatically built and pushed to GitHub Container Registry when you push to the `main` branch.

### Manual Build

```bash
# Build and push images
docker build -t ghcr.io/dvary/life-vault-backend:latest ./backend
docker build -t ghcr.io/dvary/life-vault-frontend:latest ./frontend
docker build -t ghcr.io/dvary/life-vault-nginx:latest -f nginx.Dockerfile .

# Push to registry
docker push ghcr.io/dvary/life-vault-backend:latest
docker push ghcr.io/dvary/life-vault-frontend:latest
docker push ghcr.io/dvary/life-vault-nginx:latest
```

## 🔄 Updating the Application

### Safe Update Process

1. **Backup your data (optional but recommended):**
   ```bash
   docker run --rm -v life-vault_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .
   ```

2. **Update to new version:**
   ```bash
   LIFE_VAULT_VERSION=v1.1.0 docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify deployment:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

## 🛡️ Data Protection

### Volumes

The following data is preserved across deployments:
- `postgres_data`: Database files
- `uploads_data`: Uploaded files

### Environment Variables

Create a `.env` file for sensitive data:
```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-domain.com
```

## 🔍 Troubleshooting

### Check Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Check Service Health
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

## 📊 Benefits of This Approach

✅ **No Data Loss**: Volumes are preserved during updates
✅ **Fast Deployments**: No need to rebuild from source
✅ **Version Control**: Easy to rollback to previous versions
✅ **Production Ready**: Similar to enterprise applications
✅ **CI/CD Friendly**: Automated builds and deployments

## 🆚 Comparison

| Method | Build Time | Data Safety | Deployment Speed |
|--------|------------|-------------|------------------|
| Source Build | 5-10 minutes | ❌ Risk of data loss | 🐌 Slow |
| Pre-built Images | 30 seconds | ✅ Safe | ⚡ Fast |
