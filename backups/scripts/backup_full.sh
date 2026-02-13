#!/bin/bash
#
# PostgreSQL Database Backup Script
# Full backup using pg_dump
#
# Usage: ./backup_full.sh [--encrypt] [--upload-s3]
#

set -euo pipefail

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config/backup.conf"

# Logging setup
LOG_FILE="${BACKUP_DIR}/logs/backup_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "PostgreSQL Full Backup - $(date)"
echo "========================================"

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="full_backup_${DB_NAME}_${TIMESTAMP}"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"

# Check database connection
echo "[INFO] Checking database connection..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" 2>/dev/null; then
    echo "[ERROR] Cannot connect to database at ${DB_HOST}:${DB_PORT}"
    exit 1
fi

# Get database size for reporting
DB_SIZE=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs)
echo "[INFO] Database size: $DB_SIZE"

# Create full backup using pg_dump
echo "[INFO] Starting full backup..."
START_TIME=$(date +%s)

# pg_dump with custom format for better compression
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=custom \
    --compress=9 \
    --verbose \
    --file="${BACKUP_DIR}/${BACKUP_NAME}.dump" \
    --jobs=4 2>&1

if [ $? -ne 0 ]; then
    echo "[ERROR] Backup failed!"
    exit 1
fi

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.dump" | cut -f1)
echo "[INFO] Backup created: ${BACKUP_NAME}.dump (${BACKUP_SIZE})"

# Encryption
if [ "$ENCRYPT_BACKUPS" = "true" ]; then
    echo "[INFO] Encrypting backup..."
    ENCRYPTED_FILE="${BACKUP_NAME}.dump.gpg"
    
    if [ -f "$ENCRYPTION_KEY_FILE" ]; then
        gpg --symmetric --cipher-algo AES256 \
            --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
            --output "${BACKUP_DIR}/${ENCRYPTED_FILE}" \
            "${BACKUP_DIR}/${BACKUP_NAME}.dump"
        
        # Remove unencrypted backup
        rm -f "${BACKUP_DIR}/${BACKUP_NAME}.dump"
        echo "[INFO] Backup encrypted: ${ENCRYPTED_FILE}"
        FINAL_FILE="${ENCRYPTED_FILE}"
    else
        echo "[WARN] Encryption key not found, skipping encryption"
        FINAL_FILE="${BACKUP_NAME}.dump"
    fi
else
    FINAL_FILE="${BACKUP_NAME}.dump"
fi

# Calculate checksum
echo "[INFO] Creating checksum..."
CHECKSUM_FILE="${BACKUP_DIR}/${FINAL_FILE}.sha256"
sha256sum "${BACKUP_DIR}/${FINAL_FILE}" > "$CHECKSUM_FILE"
echo "[INFO] Checksum saved: ${CHECKSUM_FILE}"

# Upload to S3 if enabled
if [ "$S3_ENABLED" = "true" ]; then
    echo "[INFO] Uploading to S3..."
    if command -v aws &> /dev/null; then
        aws s3 cp "${BACKUP_DIR}/${FINAL_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/full/${FINAL_FILE}" \
            --region "$S3_REGION" \
            --storage-class STANDARD_IA
        
        aws s3 cp "${BACKUP_DIR}/${CHECKSUM_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/full/${CHECKSUM_FILE}"
        
        echo "[INFO] Backup uploaded to S3: s3://${S3_BUCKET}/${S3_PREFIX}/full/${FINAL_FILE}"
    else
        echo "[WARN] AWS CLI not installed, skipping S3 upload"
    fi
fi

# Create metadata file
METADATA_FILE="${BACKUP_DIR}/${FINAL_FILE}.meta"
cat > "$METADATA_FILE" << EOF
{
    "backup_type": "full",
    "database": "${DB_NAME}",
    "timestamp": "$(date -Iseconds)",
    "backup_file": "${FINAL_FILE}",
    "checksum_file": "${CHECKSUM_FILE}",
    "encrypted": ${ENCRYPT_BACKUPS},
    "database_size": "${DB_SIZE}",
    "backup_size": "${BACKUP_SIZE}",
    "compression": "gzip",
    "format": "pg_dump_custom"
}
EOF

# Cleanup old backups
echo "[INFO] Running retention policy..."
DAYS_TO_KEEP=$BACKUP_RETENTION_DAYS
WEEKLY_TO_KEEP=$BACKUP_RETENTION_WEEKLY

# Remove old local backups
find "${BACKUP_DIR}" -name "full_backup_*.dump*" -type f -mtime +${DAYS_TO_KEEP} -delete
find "${BACKUP_DIR}" -name "full_backup_*.meta" -type f -mtime +${DAYS_TO_KEEP} -delete
find "${BACKUP_DIR}" -name "full_backup_*.sha256" -type f -mtime +${DAYS_TO_KEEP} -delete
find "${BACKUP_DIR}" -name "backup_*.log" -type f -mtime +${DAYS_TO_KEEP} -delete

echo "[INFO] Old backups cleaned up"

# Send notification
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
export DURATION="${DURATION}"
export BACKUP_SIZE="${BACKUP_SIZE:-Unknown}"

if [ -x "${SCRIPT_DIR}/notify.sh" ]; then
    "${SCRIPT_DIR}/notify.sh" success full
else
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Database backup completed successfully!\n*Database:* ${DB_NAME}\n*Size:* ${BACKUP_SIZE}\n*Duration:* ${DURATION}s\n*File:* ${FINAL_FILE}\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
fi

echo "[INFO] Backup completed successfully!"
echo "[INFO] Duration: ${DURATION} seconds"
echo "========================================"
