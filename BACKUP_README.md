# 🔒 Life Vault Backup & Deployment System

This system ensures your data is safe during deployments and provides easy recovery options.

## 📦 Backup System

### Automatic Backup
- **Before every deployment**: Database is automatically backed up
- **Location**: `./backups/` directory
- **Format**: `life_vault_backup_YYYYMMDD_HHMMSS.sql`
- **Retention**: Last 5 backups are kept automatically

### Manual Backup
```bash
# Create a backup now
./backup-db.sh
```

### Manual Restore
```bash
# Restore from latest backup
./restore-db.sh

# Restore from specific backup
./restore-db.sh ./backups/life_vault_backup_20250824_151500.sql
```

## 🚀 Safe Deployment

### Using Safe Deployment Script
```bash
# This will backup, deploy, and verify everything
./deploy-safe.sh
```

### Manual Deployment Steps
1. **Create backup**:
   ```bash
   ./backup-db.sh
   ```

2. **Deploy in Portainer**:
   - Go to your stack
   - Click "Update the stack"
   - Upload `docker-compose.prod.yml`
   - Check "Pull and redeploy existing images"
   - Deploy

3. **Verify deployment**:
   - Check container status
   - Test the application

## 🛡️ Data Protection Features

### Database Initialization Fix
- ✅ **No more data loss**: Database only initializes if tables don't exist
- ✅ **Safe redeployment**: Existing data is preserved
- ✅ **Automatic detection**: Checks if database is already initialized

### Backup Features
- ✅ **Timestamped backups**: Each backup has unique timestamp
- ✅ **Automatic cleanup**: Keeps only last 5 backups
- ✅ **Easy restore**: One-command restore process
- ✅ **Safe restore**: Confirms before overwriting data

## 📋 File Structure

```
life-vault/
├── backup-db.sh          # Create database backup
├── restore-db.sh         # Restore from backup
├── deploy-safe.sh        # Safe deployment script
├── backups/              # Backup files directory
│   ├── life_vault_backup_20250824_151500.sql
│   ├── life_vault_backup_20250824_152000.sql
│   └── ...
└── BACKUP_README.md      # This file
```

## 🔧 Troubleshooting

### If deployment fails
1. Check container logs: `docker-compose -f docker-compose.prod.yml logs`
2. Restore from backup: `./restore-db.sh`
3. Try deployment again

### If backup fails
1. Check if database container is running: `docker ps | grep life-vault-db`
2. Start database: `docker-compose -f docker-compose.prod.yml up -d postgres`
3. Try backup again: `./backup-db.sh`

### If restore fails
1. Stop backend: `docker-compose -f docker-compose.prod.yml stop backend`
2. Try restore again: `./restore-db.sh`
3. Start backend: `docker-compose -f docker-compose.prod.yml up -d backend`

## 💡 Best Practices

1. **Always use safe deployment**: `./deploy-safe.sh`
2. **Test after deployment**: Verify your data is intact
3. **Keep backups**: Don't delete the backups directory
4. **Monitor space**: Backups can use significant disk space
5. **Regular testing**: Test restore process periodically

## 🆘 Emergency Recovery

If everything goes wrong:

1. **Stop all containers**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

2. **Restore from backup**:
   ```bash
   ./restore-db.sh
   ```

3. **Start services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify data**:
   - Check if users exist
   - Verify family members
   - Test functionality

---

**Your data is now safe! 🎉**
