#!/bin/bash

# Database backup script for Life Vault
# This script creates a timestamped backup before redeployment

set -e

# Configuration
DB_CONTAINER="life-vault-db"
DB_NAME="family_health_tracker"
DB_USER="postgres"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/life_vault_backup_${TIMESTAMP}.sql"

echo "🔄 Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "❌ Database container $DB_CONTAINER is not running"
    exit 1
fi

# Create backup
echo "📦 Creating backup: $BACKUP_FILE"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # Keep only the last 5 backups
    echo "🧹 Cleaning old backups (keeping last 5)..."
    ls -t "$BACKUP_DIR"/life_vault_backup_*.sql | tail -n +6 | xargs -r rm
    
    echo "📊 Backup summary:"
    ls -lh "$BACKUP_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "✅ Database backup completed successfully!"
