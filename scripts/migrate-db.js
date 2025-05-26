#!/usr/bin/env node
/**
 * Database Migration Script for Reflecto
 * This script will:
 * 1. Set up a local SQLite database
 * 2. Run migrations against the local database
 * 3. Connect to the remote Turso database and run migrations
 * 4. Provide a verification step to ensure data integrity
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@libsql/client');

// Configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'local-db.sqlite');
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');
const BACKUP_DIR = path.join(process.cwd(), 'db-backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create timestamp for backups
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILE = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Print a formatted message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Create a SQLite client for local or remote connections
 */
function createSqlClient(isLocal = true) {
  if (isLocal) {
    return createClient({
      url: `file:${LOCAL_DB_PATH}`,
    });
  } else {
    // Remote Turso connection
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
}

/**
 * Get list of SQL migration files in order
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  // Read all .sql files in the migrations directory (ignoring the meta subfolder)
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && file !== 'meta')
    .map(file => path.join(MIGRATIONS_DIR, file))
    .sort(); // Sort to ensure migrations run in correct order
  
  return files;
}

/**
 * Run a single migration file against the database
 */
async function runMigration(client, filePath) {
  const fileName = path.basename(filePath);
  log(`Running migration: ${fileName}...`, colors.cyan);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL file on statement-breakpoint comments or standard semicolons
    const statements = sql
      .split(/-->\s*statement-breakpoint|;/)
      .filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      await client.execute(statement);
    }
    
    log(`✓ Migration ${fileName} completed successfully`, colors.green);
    return true;
  } catch (error) {
    log(`✗ Error running migration ${fileName}: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Check for missing tables or columns in the specified database
 */
async function verifyDatabaseSchema(client, isLocal) {
  const dbType = isLocal ? "Local" : "Remote";
  log(`\nVerifying ${dbType} database schema...`, colors.cyan);
  
  try {
    // Get list of tables
    const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = tablesResult.rows.map(row => row.name);
    
    log(`Tables found in ${dbType} database:`, colors.bright);
    tables.forEach(table => log(`  - ${table}`, colors.reset));
    
    // Check for critical tables
    const requiredTables = ['users', 'notebooks', 'tags', 'notebooks_tags', 'sessions'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      log(`Missing tables in ${dbType} database: ${missingTables.join(', ')}`, colors.red);
    } else {
      log(`✓ All required tables exist in ${dbType} database`, colors.green);
    }
    
    // Check for embedding column in notebooks table
    if (tables.includes('notebooks')) {
      const columnsResult = await client.execute("PRAGMA table_info(notebooks)");
      const hasEmbeddingColumn = columnsResult.rows.some(row => row.name === 'embedding');
      
      if (hasEmbeddingColumn) {
        log(`✓ Embedding column exists in notebooks table`, colors.green);
      } else {
        log(`⚠️ Embedding column missing from notebooks table`, colors.yellow);
      }
    }
    
    return tables;
  } catch (error) {
    log(`Error verifying database schema: ${error.message}`, colors.red);
    return [];
  }
}

/**
 * Create a backup of the local database
 */
async function backupLocalDatabase() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    log("No local database file to backup", colors.yellow);
    return;
  }
  
  try {
    log(`\nBacking up local database to ${BACKUP_FILE}...`, colors.cyan);
    fs.copyFileSync(LOCAL_DB_PATH, BACKUP_FILE);
    log(`✓ Backup created successfully`, colors.green);
  } catch (error) {
    log(`Error creating backup: ${error.message}`, colors.red);
  }
}

/**
 * Main function to run the migration process
 */
async function migrateDatabases() {
  log("\n🔄 REFLECTO DATABASE MIGRATION 🔄", colors.bright + colors.blue);
  log("----------------------------------------\n");
  
  // Backup any existing local DB
  await backupLocalDatabase();
  
  // LOCAL DATABASE MIGRATION
  log("\n📦 MIGRATING LOCAL DATABASE", colors.bright);
  log("----------------------------------------");
  
  // Create local client
  const localClient = createSqlClient(true);
  
  // Run local migrations
  const migrationFiles = getMigrationFiles();
  log(`Found ${migrationFiles.length} migration files`, colors.bright);
  
  let localMigrationSuccess = true;
  for (const file of migrationFiles) {
    const success = await runMigration(localClient, file);
    if (!success) {
      localMigrationSuccess = false;
      log("Local migration encountered errors", colors.yellow);
      break;
    }
  }
  
  if (localMigrationSuccess) {
    log("\n✅ Local database migration completed successfully", colors.green);
  } else {
    log("\n⚠️ Local database migration completed with errors", colors.yellow);
  }
  
  // Verify local database schema
  const localTables = await verifyDatabaseSchema(localClient, true);
  
  // REMOTE DATABASE MIGRATION
  log("\n☁️ MIGRATING REMOTE DATABASE", colors.bright);
  log("----------------------------------------");
  
  // Validate remote connection credentials
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    log("❌ Missing Turso database credentials. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env file.", colors.red);
    return;
  }
  
  try {
    // Create remote client
    const remoteClient = createSqlClient(false);
    
    // Test connection
    await remoteClient.execute("SELECT 1");
    log("✓ Connection to remote Turso database successful", colors.green);
    
    // Run remote migrations
    let remoteMigrationSuccess = true;
    for (const file of migrationFiles) {
      const success = await runMigration(remoteClient, file);
      if (!success) {
        remoteMigrationSuccess = false;
        log("Remote migration encountered errors", colors.yellow);
        break;
      }
    }
    
    if (remoteMigrationSuccess) {
      log("\n✅ Remote database migration completed successfully", colors.green);
    } else {
      log("\n⚠️ Remote database migration completed with errors", colors.yellow);
    }
    
    // Verify remote database schema
    const remoteTables = await verifyDatabaseSchema(remoteClient, false);
    
    // Compare local and remote schemas
    const localTableSet = new Set(localTables);
    const remoteDiff = remoteTables.filter(table => !localTableSet.has(table));
    
    if (remoteDiff.length > 0) {
      log(`\n⚠️ Remote database has ${remoteDiff.length} tables not in local schema: ${remoteDiff.join(', ')}`, colors.yellow);
    } else {
      log("\n✓ Local and remote schemas match", colors.green);
    }
    
    log("\n🎉 DATABASE MIGRATION COMPLETE 🎉", colors.bright + colors.green);
    
  } catch (error) {
    log(`\n❌ Error during remote database migration: ${error.message}`, colors.red);
    log("Make sure your Turso credentials are correct and the database exists.", colors.yellow);
  }
}

// Run migrations
migrateDatabases()
  .catch(error => {
    log(`\n❌ Unhandled error: ${error.message}`, colors.red);
    process.exit(1);
  });
