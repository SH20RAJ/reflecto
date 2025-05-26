# Reflecto Database Migration Tools

This directory contains scripts for managing Reflecto's database migrations and data synchronization between local and remote databases.

## Prerequisites

1. Node.js installed on your system
2. Required npm packages:
   - `@libsql/client`
   - `dotenv`

3. Properly configured `.env.local` file with Turso credentials:
   ```
   TURSO_DATABASE_URL=libsql://your-database-url.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   ```

## Available Scripts

### 1. Database Migration

Runs migrations against both local and remote databases:

```bash
node scripts/migrate-db.js
```

This script:
- Sets up a local SQLite database if it doesn't exist
- Runs all migrations from the `migrations` directory against the local database
- Runs the same migrations against the remote Turso database
- Verifies that both databases have the correct schema

### 2. Schema Validation

Validates and fixes schema issues in both local and remote databases:

```bash
node scripts/validate-db-schema.js
```

This script:
- Checks for required tables in both databases
- Verifies that the `embedding` column exists in the `notebooks` table
- Offers to fix schema issues if found

### 3. Database Synchronization

Synchronizes data between local and remote databases:

```bash
# Show help information
node scripts/sync-db.js help

# Sync local database to remote
node scripts/sync-db.js local-to-remote

# Sync remote database to local
node scripts/sync-db.js remote-to-local

# Export local database to JSON files
node scripts/sync-db.js export-local

# Export remote database to JSON files
node scripts/sync-db.js export-remote
```

This script:
- Exports data from the source database to JSON files
- Imports data into the target database
- Handles dependencies between tables

## Make Scripts Executable

To make all scripts executable:

```bash
./scripts/make-executable.sh
```

Then you can run them directly:

```bash
./scripts/migrate-db.js
./scripts/validate-db-schema.js
./scripts/sync-db.js local-to-remote
```

## Migration Process

### First-Time Setup

1. Create a local database:
   ```bash
   node scripts/migrate-db.js
   ```

2. Validate the schema:
   ```bash
   node scripts/validate-db-schema.js
   ```

3. Sync from remote to local (if remote database already exists):
   ```bash
   node scripts/sync-db.js remote-to-local
   ```
   
### Regular Use

1. After making schema changes, run migrations:
   ```bash
   node scripts/migrate-db.js
   ```

2. After making local changes, sync to remote:
   ```bash
   node scripts/sync-db.js local-to-remote
   ```

3. To get latest changes from remote:
   ```bash
   node scripts/sync-db.js remote-to-local
   ```

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Check your `.env.local` file for correct Turso credentials
   - Ensure you have internet access for remote operations

2. **Missing Tables**:
   - Run `node scripts/migrate-db.js` to create missing tables

3. **Embedding Column Issues**:
   - Run `node scripts/validate-db-schema.js` to fix schema issues

### Manual Fixes

If automated fixes don't work, you can manually repair your database:

1. For local database:
   ```sql
   ALTER TABLE notebooks ADD COLUMN embedding BLOB;
   ```

2. For schema recreation:
   ```bash
   # Export your data first
   node scripts/sync-db.js export-local
   
   # Delete the local database
   rm local-db.sqlite
   
   # Recreate from scratch
   node scripts/migrate-db.js
   ```

## Backup and Recovery

- Database exports are saved to the `db-exports` directory
- Local database backups are saved to the `db-backups` directory
- Use these files to restore data if needed
