#!/bin/bash
#
# Database Restore Script
# Restores PostgreSQL database from backup
#
# Usage: ./restore_database.sh <backup_file> [--skip-verify] [--create-db]
#
# Examples:
#   ./restore_database.sh full_backup_mydb_20260115_020000.dump.gpg
#   ./restore_database.sh --list-backups
#   ./restore_database.sh --latest
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config/backup.conf"

BACKUP_BASE_DIR="${BACKUP_DIR}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
Database Restore Script

Usage: $0 <backup_file> [options]

Options:
    --skip-verify    Skip checksum verification
    --create-db      Create database if it doesn't exist
    --drop-existing  Drop existing database before restore
    --list-backups   List available backups
    --latest         Restore the latest backup
    --help           Show this help

Examples:
    $0 --list-backups
    $0 --latest
    $0 full_backup_mydb_20260115_020000.dump.gpg --drop-existing
EOF
}

list_backups() {
    echo "Available Backups:"
    echo "=================="
    find "${BACKUP_BASE_DIR}" -name "full_backup_*.dump*" -type f | sort -r | while read -r backup; do
        SIZE=$(du -h "$backup" | cut -f1)
        DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || \
               stat -c "%y" "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
        ENCRYPTED=""
        if [[ "$backup" == *.gpg ]]; then
            ENCRYPTED="🔒"
        fi
        echo "  $DATE - $SIZE $ENCRYPTED $(basename "$backup")"
    done
}

# Parse arguments
SKIP_VERIFY=false
CREATE_DB=false
DROP_EXISTING=false
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-verify)
            SKIP_VERIFY=true
            shift
            ;;
        --create-db)
            CREATE_DB=true
            shift
            ;;
        --drop-existing)
            DROP_EXISTING=true
            shift
            ;;
        --list-backups)
            list_backups
            exit 0
            ;;
        --latest)
            BACKUP_FILE=$(find "${BACKUP_BASE_DIR}" -name "full_backup_*.dump*" -type f | sort -r | head -1)
            if [ -z "$BACKUP_FILE" ]; then
                print_error "No backups found!"
                exit 1
            fi
            print_status "Latest backup: $(basename "$BACKUP_FILE")"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        -*)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

if [ -z "$BACKUP_FILE" ]; then
    print_error "No backup file specified!"
    show_help
    exit 1
fi

# Resolve backup path
if [ ! -f "$BACKUP_FILE" ]; then
    BACKUP_FILE="${BACKUP_BASE_DIR}/${BACKUP_FILE}"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

print_status "Starting restore from: $(basename "$BACKUP_FILE")"
echo ""

# Step 1: Verify checksum
if [ "$SKIP_VERIFY" = "false" ]; then
    print_status "Verifying backup checksum..."
    CHECKSUM_FILE="${BACKUP_FILE}.sha256"
    if [ -f "$CHECKSUM_FILE" ]; then
        if sha256sum -c "$CHECKSUM_FILE" > /dev/null 2>&1; then
            print_status "Checksum verified!"
        else
            print_error "Checksum verification FAILED!"
            exit 1
        fi
    else
        print_warning "No checksum file found, skipping verification"
    fi
fi

# Step 2: Decrypt if needed
DECRYPTED_FILE=""
if [[ "$BACKUP_FILE" == *.gpg ]]; then
    print_status "Decrypting backup..."
    DECRYPTED_FILE="/tmp/restore_$$.dump"

    if [ -f "$ENCRYPTION_KEY_FILE" ]; then
        gpg --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
            --decrypt "$BACKUP_FILE" > "$DECRYPTED_FILE" 2>/dev/null

        if [ $? -ne 0 ]; then
            print_error "Decryption failed!"
            rm -f "$DECRYPTED_FILE"
            exit 1
        fi
        print_status "Decryption successful!"
    else
        print_error "Encryption key file not found: $ENCRYPTION_KEY_FILE"
        exit 1
    fi
else
    DECRYPTED_FILE="$BACKUP_FILE"
fi

# Step 3: Prepare database
if [ "$DROP_EXISTING" = "true" ]; then
    print_warning "Dropping existing database: $DB_NAME"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
fi

if [ "$CREATE_DB" = "true" ]; then
    print_status "Creating database if not exists: $DB_NAME"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
fi

# Step 4: Restore database
print_status "Restoring database..."
echo ""

START_TIME=$(date +%s)

# Check if it's a custom format (pg_dump) or plain SQL
if [[ "$DECRYPTED_FILE" == *.dump ]] || [[ "$BACKUP_FILE" == *.dump ]]; then
    # Custom format - use pg_restore
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        "$DECRYPTED_FILE" 2>&1
else
    # Plain SQL - use psql
    psql -h "$DB_HOST" -p "$DB "$DB_USER"_PORT" -U -d "$DB_NAME" \
        -f "$DECRYPTED_FILE" 2>&1
fi

if [ $? -ne 0 ]; then
    print_error "Restore failed!"
    rm -f "$DECRYPTED_FILE"
    exit 1
fi

# Step 5: Cleanup
if [[ "$BACKUP_FILE" == *.gpg ]]; then
    rm -f "$DECRYPTED_FILE"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
print_status "Database restore completed successfully!"
print_status "Duration: ${DURATION} seconds"
print_status "Database: $DB_NAME"

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Database restore completed!\n*Database:* ${DB_NAME}\n*Backup:* $(basename "$BACKUP_FILE")\n*Duration:* ${DURATION}s\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || true
fi
