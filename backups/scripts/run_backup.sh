#!/bin/bash
#
# Backup Orchestrator
# Manages full and incremental backups with rotation
#
# Usage: ./run_backup.sh [--type=full|incremental|all]
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config/backup.conf"

LOG_FILE="${BACKUP_DIR}/logs/orchestrator_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "Backup Orchestrator - $(date)"
echo "========================================"

BACKUP_TYPE="${1:-all}"
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday

# Determine which backups to run
RUN_FULL=false
RUN_INCREMENTAL=false

case $BACKUP_TYPE in
    full)
        RUN_FULL=true
        ;;
    incremental)
        RUN_INCREMENTAL=true
        ;;
    all)
        # Run full backup on Sunday (day 7), incremental on other days
        if [ "$DAY_OF_WEEK" = "7" ] || [ "$DAY_OF_WEEK" = "0" ]; then
            RUN_FULL=true
        else
            RUN_INCREMENTAL=true
        fi
        ;;
esac

# Log scheduling info
echo "[INFO] Day of week: $DAY_OF_WEEK"
echo "[INFO] Full backup scheduled: $RUN_FULL"
echo "[INFO] Incremental backup scheduled: $RUN_INCREMENTAL"

# Check database connection
echo "[INFO] Checking database connection..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    echo "[ERROR] Cannot connect to database!"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 BACKUP FAILED: Cannot connect to database ${DB_HOST}:${DB_PORT}\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    exit 1
fi
echo "[INFO] Database connection OK"

# Run full backup
FULL_STATUS=0
if [ "$RUN_FULL" = "true" ]; then
    echo ""
    echo "[INFO] Starting FULL backup..."
    if "${SCRIPT_DIR}/backup_full.sh" --upload-s3; then
        echo "[INFO] Full backup completed successfully"
    else
        echo "[ERROR] Full backup failed!"
        FULL_STATUS=1
    fi
fi

# Run incremental backup
INC_STATUS=0
if [ "$RUN_INCREMENTAL" = "true" ]; then
    echo ""
    if [ "$ENABLE_INCREMENTAL" = "true" ]; then
        echo "[INFO] Starting INCREMENTAL backup..."
        if "${SCRIPT_DIR}/backup_incremental.sh"; then
            echo "[INFO] Incremental backup completed successfully"
        else
            echo "[ERROR] Incremental backup failed!"
            INC_STATUS=1
        fi
    else
        echo "[INFO] Incremental backups are disabled, skipping"
    fi
fi

# Send overall status notification
if [ "$FULL_STATUS" -ne 0 ] || [ "$INC_STATUS" -ne 0 ]; then
    echo ""
    echo "[ERROR] Backup orchestration completed with errors!"
    if [ -x "${SCRIPT_DIR}/notify.sh" ]; then
        "${SCRIPT_DIR}/notify.sh" failure backup "One or more backup tasks failed"
    fi
fi

# Run verification
echo ""
echo "[INFO] Running backup verification..."
if "${SCRIPT_DIR}/verify_backups.sh"; then
    echo "[INFO] Verification passed"
else
    echo "[ERROR] Verification failed!"
fi

# Cleanup old logs
echo ""
echo "[INFO] Cleaning up old logs..."
find "${BACKUP_DIR}/logs" -name "*.log" -type f -mtime +7 -delete

echo ""
echo "========================================"
echo "Backup orchestration completed!"
echo "========================================"
