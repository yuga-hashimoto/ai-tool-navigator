# Database Backup System

Automated backup system for PostgreSQL database with S3 storage, encryption, and verification.

## Quick Start

### 1. Configure Environment

```bash
# Copy environment template
cp backups/.env.example backups/.env

# Edit with your database credentials
nano backups/.env
```

### 2. Generate Encryption Key

```bash
# Create encryption key
openssl rand -base64 32 > backups/config/backup.key
chmod 600 backups/config/backup.key
```

### 3. Test Backup

```bash
# Run a test backup
npm run backup:full
```

## Directory Structure

```
backups/
├── config/
│   └── backup.conf          # Main configuration file
├── scripts/
│   ├── backup_full.sh       # Full database backup (pg_dump)
│   ├── backup_incremental.sh # Incremental backup (pg_basebackup)
│   ├── verify_backups.sh    # Backup verification
│   ├── restore_database.sh # Database restore utility
│   ├── run_backup.sh        # Orchestrates all backups
│   ├── backup_setup.sh     # Cron setup script
│   └── healthcheck.sh       # Health check script
├── logs/                    # Backup logs
├── .env.example             # Environment template
├── RESTORE_PROCEDURES.md    # Recovery documentation
├── docker-compose.test.yml  # Local testing with MinIO
└── Dockerfile.backup        # Backup container image
```

## Available Commands

```bash
# Backup operations
npm run backup:full          # Create full backup
npm run backup:inc          # Create incremental backup
npm run backup:run          # Run scheduled backup
npm run backup:verify       # Verify backup integrity
npm run backup:list         # List available backups
npm run backup:latest       # Restore latest backup

# Direct script usage
./backups/scripts/backup_full.sh
./backups/scripts/restore_database.sh --latest
```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |

### Optional (S3 Storage)

| Variable | Default | Description |
|----------|---------|-------------|
| `S3_ENABLED` | `false` | Enable S3 upload |
| `S3_BUCKET` | - | S3 bucket name |
| `S3_REGION` | `us-east-1` | AWS region |
| `S3_ACCESS_KEY` | - | AWS access key |
| `S3_SECRET_KEY` | - | AWS secret key |
| `S3_PREFIX` | `database` | S3 path prefix |

### Optional (Encryption)

| Variable | Default | Description |
|----------|---------|-------------|
| `ENCRYPT_BACKUPS` | `true` | Enable encryption |
| `ENCRYPTION_KEY_FILE` | - | Path to encryption key |

### Optional (Monitoring)

| Variable | Description |
|----------|-------------|
| `SLACK_WEBHOOK_URL` | Slack webhook for alerts |
| `EMAIL_ALERT_RECIPIENT` | Email for alerts |
| `HEALTHCHECK_URL` | Healthcheck.io URL |

## Cron Schedule

| Schedule | Command | Description |
|----------|---------|-------------|
| Daily 2:00 AM | `npm run backup:run -- full` | Full backup |
| Every 6 hours | `npm run backup:run -- incremental` | Incremental |
| Daily 6:00 AM | `npm run backup:verify` | Verification |

Install cron:
```bash
./backups/scripts/backup_setup.sh | crontab -
```

## Restore Procedures

See [RESTORE_PROCEDURES.md](RESTORE_PROCEDURES.md) for detailed restore instructions.

### Quick Restore

```bash
# List backups
npm run backup:list

# Restore latest
npm run backup:latest

# Restore specific backup
./backups/scripts/restore_database.sh full_backup_db_20260115_020000.dump.gpg
```

## S3-Compatible Storage

Works with:
- AWS S3
- Google Cloud Storage
- DigitalOcean Spaces
- MinIO (local testing)
- Wasabi
- Backblaze B2

Set `S3_ENDPOINT` for non-AWS S3 compatible services.

## Testing

```bash
# Start test environment with PostgreSQL and MinIO
docker-compose -f backups/docker-compose.test.yml up -d

# Test backup to MinIO
docker-compose -f backups/docker-compose.test.yml run backup-runner backup:run
```

## Security

- Backups encrypted with AES-256
- Encryption key not stored in version control
- Use IAM roles in production
- Restrict backup directory permissions: `chmod 700 backups/`

## Monitoring

- Backup success/failure logged to `backups/logs/`
- Slack/email alerts on failure
- Healthcheck endpoint for orchestration
