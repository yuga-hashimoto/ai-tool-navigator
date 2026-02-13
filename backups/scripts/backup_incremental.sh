#!/bin/bash
#
# Incremental Backup Script using pg_basebackup
# Requires WAL archiving to be enabled
#
# Usage: ./backup_incremental.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config/backup.conf"

LOG_FILE="${BACKUP_DIR}/logs/incremental_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "PostgreSQL Incremental Backup - $(date)"
echo "========================================"

# Check prerequisites
if [ "$ENABLE_INCREMENTAL" != "true" ]; then
    echo "[WARN] Incremental backups are disabled"
    exit 0
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR_INC="${BACKUP_DIR}/incremental/${TIMESTAMP}"

# Create incremental backup directory
mkdir -p "$BACKUP_DIR_INC"

echo "[INFO] Starting incremental backup with pg_basebackup..."

# Use pg_basebackup for incremental/base backup
pg_basebackup -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
    -D "$BACKUP_DIR_INC/base" \
    --wal-method=stream \
    --checkpoint=fast \
    --progress \
    --verbose \
    --compress=gzip 2>&1

if [ $? -ne 0 ]; then
    echo "[ERROR] Incremental backup failed!"
    exit 1
fi

# Create backup label
cat > "${BACKUP_DIR_INC}/backup_label" << EOF
Incremental Backup
Timestamp: $(date -Iseconds)
Database: ${DB_NAME}
Type: pg_basebackup
EOF

# Compress and create archive
ARCHIVE_NAME="incremental_backup_${TIMESTAMP}.tar.gz"
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "${BACKUP_DIR}/incremental" "$TIMESTAMP"

# Cleanup incremental directory
rm -rf "${BACKUP_DIR}/incremental/${TIMESTAMP}"

BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${ARCHIVE_NAME}" | cut -f1)
echo "[INFO] Incremental backup created: ${ARCHIVE_NAME} (${BACKUP_SIZE})"

# Encrypt if enabled
if [ "$ENCRYPT_BACKUPS" = "true" ]; then
    echo "[INFO] Encrypting incremental backup..."
    if [ -f "$ENCRYPTION_KEY_FILE" ]; then
        gpg --symmetric --cipher-algo AES256 \
            --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
            --output "${BACKUP_DIR}/${ARCHIVE_NAME}.gpg" \
            "${BACKUP_DIR}/${ARCHIVE_NAME}"
        
        rm -f "${BACKUP_DIR}/${ARCHIVE_NAME}"
        ARCHIVE_NAME="${ARCHIVE_NAME}.gpg"
        echo "[INFO] Backup encrypted"
    fi
fi

# Upload to S3
if [ "$S3_ENABLED" = "true" ]; then
    echo "[INFO] Uploading to S3..."
    if command -v aws &> /dev/null; then
        aws s3 cp "${BACKUP_DIR}/${ARCHIVE_NAME}" \
            "s3://${S3_BUCKET}/${S3_PREFIX}/incremental/${ARCHIVE_NAME}" \
            --region "$S3_REGION"
        echo "[INFO] Uploaded to S3"
    fi
fi

echo "[INFO] Incremental backup completed!"
echo "========================================"
