# PostgreSQL Database Backup Procedures

## Overview

This document describes the backup and restore procedures for the PostgreSQL database used in this project.

## Backup Strategy

### Backup Types

| Type | Frequency | Retention | Use Case |
|------|-----------|-----------|----------|
| Full Backup | Daily (2:00 AM) | 7 days | Complete database snapshot |
| Incremental | Every 6 hours | 7 days | Point-in-time recovery |
| WAL Archives | Continuous | 7 days | Point-in-time recovery |

### Retention Policy

- **Daily backups**: Keep last 7 days
- **Weekly backups**: Keep last 4 weeks
- **Monthly backups**: Keep last 3 months

## Prerequisites

### 1. Install Required Tools

```bash
# PostgreSQL client tools
brew install postgresql  # macOS
sudo apt-get install postgresql-client  # Ubuntu/Debian

# AWS CLI (for S3 uploads)
brew install awscli
pip install awscli
```

### 2. Configure Environment

```bash
# Copy environment template
cp backups/.env.example backups/.env

# Edit with your settings
nano backups/.env

# Generate encryption key
openssl rand -base64 32 > backups/config/backup.key
chmod 600 backups/config/backup.key
```

### 3. Database Connection Test

```bash
# Test connection to Supabase
export DATABASE_URL="postgresql://user:pass@host:5432/db"
psql "$DATABASE_URL" -c "SELECT 1;"
```

## Usage

### Running Backups

```bash
# Run full backup
./backups/scripts/backup_full.sh

# Run incremental backup
./backups/scripts/backup_incremental.sh

# Run orchestrated backup (decides based on day)
./backups/scripts/run_backup.sh full
./backups/scripts/run_backup.sh incremental
```

### Listing Backups

```bash
./backups/scripts/restore_database.sh --list-backups
```

### Restoring Database

```bash
# Restore latest backup
./backups/scripts/restore_database.sh --latest

# Restore specific backup
./backups/scripts/restore_database.sh full_backup_mydb_20260115_020000.dump.gpg

# Drop existing and restore
./backups/scripts/restore_database.sh --latest --drop-existing

# Skip checksum verification (not recommended)
./backups/scripts/restore_database.sh backup.dump --skip-verify
```

### Verifying Backups

```bash
# Quick verification (checksums only)
./backups/scripts/verify_backups.sh

# Full verification with test restore
./backups/scripts/verify_backups.sh --full-restore-test
```

## Scheduling with Cron

### Install Cron Jobs

```bash
# Generate and install crontab
./backups/scripts/backup_setup.sh | crontab -

# Or manually edit crontab
crontab -e
```

### Cron Schedule

```cron
# Full backup - Daily at 2:00 AM
0 2 * * * /Users/yu-ga/.clawdbot/agents/monetize-agent/backups/scripts/run_backup.sh full

# Incremental backup - Every 6 hours
0 */6 * * * /Users/yu-ga/.clawdbot/agents/monetize-agent/backups/scripts/run_backup.sh incremental

# Verification - Daily at 6:00 AM
0 6 * * * /Users/yu-ga/.clawdbot/agents/monetize-agent/backups/scripts/verify_backups.sh
```

## S3 Configuration

### AWS S3 Setup

1. Create S3 bucket with appropriate encryption
2. Configure bucket policy for access
3. Create IAM user with S3 access

### Bucket Policy Example

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::123456789012:user/backup-user"
            },
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-backup-bucket/*"
        }
    ]
}
```

### Lifecycle Policy

Set up S3 lifecycle to move older backups to Glacier:

```json
{
    "Rules": [
        {
            "ID": "Archive old backups",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "database/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 365
            }
        }
    ]
}
```

## Point-in-Time Recovery (PITR)

### Prerequisites

1. WAL archiving must be enabled
2. Base backups must be available
3. Target recovery point must be within retention

### Recovery Process

```bash
# 1. Stop the application
# 2. Preserve current data directory
mv /var/lib/postgresql/data /var/lib/postgresql/data.old

# 3. Create recovery.conf
cat > /var/lib/postgresql/data/recovery.conf
restore_command = 'cp /wal/%f %p'
recovery_target_time = '2026-01-15 10:00:00 UTC'

# 4. Start PostgreSQL
# PostgreSQL will automatically recover to the specified point
```

## Security Considerations

### Encryption

- All backups are encrypted with AES-256
- Encryption key stored separately from backups
- Consider using AWS KMS for key management

### Access Control

- Restrict backup directory permissions: `chmod 700 backups/`
- Limit database user permissions to backup role
- Use IAM roles instead of access keys where possible

### Audit Logging

- All backup operations are logged to `backups/logs/`
- Logs are retained for 90 days
- Failed backups trigger Slack/email alerts

## Troubleshooting

### Common Issues

#### "Connection refused" errors

```bash
# Check database is running
pg_isready -h $DB_HOST -p $DB_PORT

# Verify credentials
psql "$DATABASE_URL" -c "SELECT version();"
```

#### "Permission denied" errors

```bash
# Check backup directory permissions
ls -la backups/

# Fix permissions
chmod 700 backups/config/
chmod 600 backups/config/backup.key
```

#### "No space left on device"

```bash
# Check disk space
df -h

# Clean up old backups
./backups/scripts/cleanup.sh
```

### Getting Help

1. Check logs: `tail -f backups/logs/*.log`
2. Verify config: `source backups/config/backup.conf && echo $DATABASE_URL`
3. Test connection: `pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER`

## Disaster Recovery Plan

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 6 hours

### Recovery Steps

1. **Assess damage** - Determine extent of data loss
2. **Prepare environment** - Ensure database server is ready
3. **Restore latest backup** - Follow restore procedures
4. **Verify integrity** - Run verification scripts
5. **Resume operations** - Restart application

### Emergency Contacts

- Database Admin: [Your Name]
- Cloud Provider: [Support Contact]
