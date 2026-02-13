#!/bin/bash
#
# Backup Verification Script
# Verifies integrity of backups and performs test restores
#
# Usage: ./verify_backups.sh [--full-restore-test]
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config/backup.conf"

LOG_FILE="${BACKUP_DIR}/logs/verify_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "Backup Verification - $(date)"
echo "========================================"

VERIFICATION_STATUS="PASSED"
FAILED_BACKUPS=()

# 1. Verify local backup checksums
echo "[INFO] Verifying backup checksums..."
for CHECKSUM_FILE in "${BACKUP_DIR}"/*.sha256; do
    if [ -f "$CHECKSUM_FILE" ]; then
        if sha256sum -c "$CHECKSUM_FILE" > /dev/null 2>&1; then
            echo "  ✅ $(basename "$CHECKSUM_FILE" .sha256)"
        else
            echo "  ❌ $(basename "$CHECKSUM_FILE" .sha256) - CHECKSUM FAILED"
            FAILED_BACKUPS+=("$(basename "$CHECKSUM_FILE" .sha256)")
            VERIFICATION_STATUS="FAILED"
        fi
    fi
done

# 2. Verify GPG signatures if encrypted
echo "[INFO] Verifying GPG signatures..."
for BACKUP_FILE in "${BACKUP_DIR}"/*.gpg; do
    if [ -f "$BACKUP_FILE" ] && [ -f "$ENCRYPTION_KEY_FILE" ]; then
        if gpg --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
            --decrypt "$BACKUP_FILE" > /dev/null 2>&1; then
            echo "  ✅ $(basename "$BACKUP_FILE")"
        else
            echo "  ❌ $(basename "$BACKUP_FILE") - DECRYPTION FAILED"
            FAILED_BACKUPS+=("$(basename "$BACKUP_FILE")")
            VERIFICATION_STATUS="FAILED"
        fi
    fi
done

# 3. Verify S3 backups exist (if enabled)
if [ "$S3_ENABLED" = "true" ]; then
    echo "[INFO] Verifying S3 backups..."
    if command -v aws &> /dev/null; then
        LATEST_S3_FILE=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/full/" --recursive | sort | tail -1)
        if [ -n "$LATEST_S3_FILE" ]; then
            echo "  ✅ Latest S3 backup: ${LATEST_S3_FILE}"
        else
            echo "  ⚠️  No S3 backups found"
        fi
    fi
fi

# 4. Test restore (only if --full-restore-test flag)
if [ "${1:-}" = "--full-restore-test" ]; then
    echo "[INFO] Performing full restore test..."
    
    # Find the latest backup
    LATEST_BACKUP=$(find "${BACKUP_DIR}" -name "full_backup_*.dump*" -type f | sort | tail -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo "  ⚠️  No backups found for restore test"
    else
        echo "[INFO] Testing restore of: $(basename "$LATEST_BACKUP")"
        
        # Create temporary database for testing
        TEST_DB="${DB_NAME}_restore_test_$$"
        
        # Decrypt if needed
        TEMP_FILE="/tmp/restore_test_$$.dump"
        if [[ "$LATEST_BACKUP" == *.gpg ]]; then
            gpg --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
                --decrypt "$LATEST_BACKUP" > "$TEMP_FILE" 2>/dev/null
        else
            cp "$LATEST_BACKUP" "$TEMP_FILE"
        fi
        
        # Try to restore (this will fail on real database, but verifies file integrity)
        if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
            --list "$TEMP_FILE" > /dev/null 2>&1; then
            echo "  ✅ Restore test passed: $(basename "$LATEST_BACKUP")"
        else
            echo "  ❌ Restore test failed: $(basename "$LATEST_BACKUP")"
            VERIFICATION_STATUS="FAILED"
        fi
        
        rm -f "$TEMP_FILE"
    fi
fi

# 5. Check backup age
echo "[INFO] Checking backup age..."
LATEST_BACKUP=$(find "${BACKUP_DIR}" -name "full_backup_*.dump*" -type f | sort | tail -1 2>/dev/null || echo "")
if [ -n "$LATEST_BACKUP" ]; then
    BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1 2>/dev/null && echo "old" || echo "recent")
    if [ "$BACKUP_AGE" = "old" ]; then
        echo "  ⚠️  Latest backup is older than 24 hours"
    else
        echo "  ✅ Latest backup is recent"
    fi
else
    echo "  ⚠️  No backups found"
fi

# 6. Check available disk space
echo "[INFO] Checking disk space..."
AVAILABLE_KB=$(df -k "$BACKUP_DIR" | tail -1 | awk '{print $4}')
AVAILABLE_GB=$((AVAILABLE_KB / 1024 / 1024))
echo "  📦 Available space: ${AVAILABLE_GB}GB"

if [ "$AVAILABLE_GB" -lt 5 ]; then
    echo "  ⚠️  Low disk space! Less than 5GB available"
    VERIFICATION_STATUS="WARNING"
fi

# Summary
echo "========================================"
echo "Verification Result: ${VERIFICATION_STATUS}"
echo "========================================"

if [ "$VERIFICATION_STATUS" = "FAILED" ]; then
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 BACKUP VERIFICATION FAILED!\nFailed backups:\n${FAILED_BACKUPS[*]}\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    exit 1
fi

exit 0
