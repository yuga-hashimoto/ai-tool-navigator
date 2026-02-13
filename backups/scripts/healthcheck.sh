#!/bin/bash
#
# Healthcheck script for backup monitoring
# Used by Docker HEALTHCHECK or cron monitoring
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config/backup.conf"

# Check last backup age
LATEST_BACKUP=$(find "${BACKUP_DIR}" -name "full_backup_*.dump*" -type f | sort -r | head -1 2>/dev/null || echo "")

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No backups found!"
    exit 1
fi

BACKUP_AGE=$(stat -f "%m" -t "%s" "$LATEST_BACKUP" 2>/dev/null || stat -c "%Y" "$LATEST_BACKUP" 2>/dev/null || echo "0")
NOW=$(date +%s)
AGE_HOURS=$(( (NOW - BACKUP_AGE) / 3600 ))

# Check if backup is less than 28 hours old
if [ "$AGE_HOURS" -gt 28 ]; then
    echo "WARNING: Latest backup is ${AGE_HOURS} hours old!"
    exit 1
fi

# Check encryption key exists
if [ "$ENCRYPT_BACKUPS" = "true" ] && [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
    echo "ERROR: Encryption key not found!"
    exit 1
fi

# Check S3 connectivity if enabled
if [ "$S3_ENABLED" = "true" ]; then
    if ! aws s3 ls "s3://${S3_BUCKET}/" > /dev/null 2>&1; then
        echo "WARNING: Cannot connect to S3 bucket!"
        exit 1
    fi
fi

echo "OK: Backup health check passed. Latest backup: ${AGE_HOURS} hours ago."
exit 0
