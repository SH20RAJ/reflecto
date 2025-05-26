#!/usr/bin/env node
/**
 * Data Migration Utility for Reflecto
 * This script allows syncing data between local and remote databases
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

// Configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'local-db.sqlite');
const EXPORT_DIR = path.join(process.cwd(), 'db-exports');
const BATCH_SIZE = 100; // Number of records to process at once

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// Create timestamp for exports
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

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
 * Create a prompt for user input
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
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
 * Get list of tables in the database
 */
async function listTables(client) {
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  return result.rows.map(row => row.name);
}

/**
 * Get data from a table
 */
async function getTableData(client, tableName) {
  const result = await client.execute(`SELECT * FROM ${tableName}`);
  return result.rows;
}

/**
 * Export data from database tables to JSON files
 */
async function exportData(client, isLocal) {
  const dbType = isLocal ? "local" : "remote";
  const exportPath = path.join(EXPORT_DIR, `${dbType}-data-${timestamp}`);
  
  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath, { recursive: true });
  }
  
  log(`\nExporting data from ${dbType} database...`, colors.cyan);
  
  try {
    const tables = await listTables(client);
    log(`Found ${tables.length} tables`, colors.bright);
    
    const exportedData = {};
    
    for (const tableName of tables) {
      log(`Exporting table: ${tableName}...`, colors.reset);
      
      const data = await getTableData(client, tableName);
      exportedData[tableName] = data;
      
      // Write individual table file
      const tableFilePath = path.join(exportPath, `${tableName}.json`);
      fs.writeFileSync(tableFilePath, JSON.stringify(data, null, 2));
      
      log(`✓ Exported ${data.length} rows from ${tableName}`, colors.green);
    }
    
    // Write complete export file
    const fullExportPath = path.join(exportPath, 'full-export.json');
    fs.writeFileSync(fullExportPath, JSON.stringify(exportedData, null, 2));
    
    log(`\n✅ Export completed to: ${exportPath}`, colors.green);
    return { exportedData, exportPath };
  } catch (error) {
    log(`❌ Error exporting data: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Import data into database tables from JSON
 */
async function importData(client, data, options = {}) {
  const { targetDb = 'database', clearTables = false } = options;
  
  log(`\nImporting data to ${targetDb}...`, colors.cyan);
  
  try {
    const tables = Object.keys(data);
    
    // First, handle the tables with dependencies (foreign keys)
    // We need to import them in the correct order
    const tableOrder = [
      'users', 
      'accounts', 
      'sessions', 
      'verification_tokens', 
      'notebooks', 
      'tags', 
      'notebooks_tags',
      // Add any other tables in dependency order
    ];
    
    // Sort tables by the predefined order, putting any unknown tables at the end
    const sortedTables = [...new Set([
      ...tableOrder,
      ...tables
    ])].filter(table => tables.includes(table));
    
    for (const tableName of sortedTables) {
      const tableData = data[tableName];
      
      if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        log(`Skipping empty table: ${tableName}`, colors.yellow);
        continue;
      }
      
      log(`Importing table: ${tableName} (${tableData.length} rows)...`, colors.reset);
      
      // Clear table if requested
      if (clearTables) {
        try {
          await client.execute(`DELETE FROM ${tableName}`);
          log(`Cleared existing data from ${tableName}`, colors.yellow);
        } catch (clearError) {
          log(`Warning: Failed to clear table ${tableName}: ${clearError.message}`, colors.yellow);
        }
      }
      
      // Process in batches to avoid memory issues with large datasets
      for (let i = 0; i < tableData.length; i += BATCH_SIZE) {
        const batch = tableData.slice(i, i + BATCH_SIZE);
        
        // Process each row in the batch
        for (const row of batch) {
          try {
            const columns = Object.keys(row);
            const placeholders = columns.map(() => '?').join(', ');
            const values = columns.map(col => row[col]);
            
            const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            await client.execute({ sql, args: values });
          } catch (rowError) {
            log(`Error importing row in ${tableName}: ${rowError.message}`, colors.red);
            // Continue with next row
          }
        }
        
        log(`Imported batch ${i / BATCH_SIZE + 1} of ${Math.ceil(tableData.length / BATCH_SIZE)}`, colors.reset);
      }
      
      log(`✓ Imported data into ${tableName}`, colors.green);
    }
    
    log(`\n✅ Import completed to ${targetDb}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Error importing data: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Sync data between local and remote databases
 */
async function syncDatabases(direction) {
  log("\n🔄 REFLECTO DATABASE SYNC 🔄", colors.bright + colors.blue);
  log("------------------------------\n");
  
  // Validation
  if (direction !== 'local-to-remote' && direction !== 'remote-to-local') {
    log("❌ Invalid sync direction. Must be 'local-to-remote' or 'remote-to-local'.", colors.red);
    return;
  }
  
  // Validate database connection credentials
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    log("❌ Missing Turso database credentials. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env file.", colors.red);
    return;
  }
  
  try {
    if (direction === 'local-to-remote') {
      // Local to Remote sync
      log("📤 SYNCING LOCAL DATABASE TO REMOTE", colors.bright);
      log("-------------------------------------");
      
      // 1. Connect to local database
      const localClient = createSqlClient(true);
      
      // 2. Export data from local
      const { exportedData } = await exportData(localClient, true);
      
      // 3. Connect to remote
      const remoteClient = createSqlClient(false);
      
      // 4. Test remote connection
      await remoteClient.execute("SELECT 1");
      log("✓ Connection to remote Turso database successful", colors.green);
      
      // 5. Confirm before proceeding
      const confirmImport = await prompt("\n⚠️ This will overwrite data in the REMOTE database. Continue? (y/n): ");
      if (confirmImport.toLowerCase() !== 'y') {
        log("🛑 Import canceled", colors.yellow);
        return;
      }
      
      // 6. Import data to remote
      await importData(remoteClient, exportedData, { targetDb: 'remote database' });
      
    } else {
      // Remote to Local sync
      log("📥 SYNCING REMOTE DATABASE TO LOCAL", colors.bright);
      log("-------------------------------------");
      
      // 1. Connect to remote database
      const remoteClient = createSqlClient(false);
      
      // 2. Test connection
      await remoteClient.execute("SELECT 1");
      log("✓ Connection to remote Turso database successful", colors.green);
      
      // 3. Export data from remote
      const { exportedData } = await exportData(remoteClient, false);
      
      // 4. Connect to local
      const localClient = createSqlClient(true);
      
      // 5. Confirm before proceeding
      const confirmImport = await prompt("\n⚠️ This will overwrite data in the LOCAL database. Continue? (y/n): ");
      if (confirmImport.toLowerCase() !== 'y') {
        log("🛑 Import canceled", colors.yellow);
        return;
      }
      
      // 6. Import data to local
      await importData(localClient, exportedData, { targetDb: 'local database' });
    }
    
    log("\n🎉 DATABASE SYNC COMPLETE 🎉", colors.bright + colors.green);
    
  } catch (error) {
    log(`\n❌ Error during database sync: ${error.message}`, colors.red);
  }
}

/**
 * Show help information
 */
function showHelp() {
  log("\n🔄 REFLECTO DATABASE SYNC UTILITY 🔄", colors.bright + colors.blue);
  log("--------------------------------------\n");
  log("This utility helps you synchronize data between local and remote Turso databases.\n");
  
  log("Usage:", colors.bright);
  log("  node scripts/sync-db.js [command]\n");
  
  log("Commands:", colors.bright);
  log("  local-to-remote    Sync data from local SQLite to remote Turso database");
  log("  remote-to-local    Sync data from remote Turso to local SQLite database");
  log("  export-local       Export data from local database to JSON");
  log("  export-remote      Export data from remote database to JSON");
  log("  help               Show this help information\n");
  
  log("Examples:", colors.bright);
  log("  node scripts/sync-db.js local-to-remote");
  log("  node scripts/sync-db.js remote-to-local");
}

// Parse command line arguments
async function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'local-to-remote':
      await syncDatabases('local-to-remote');
      break;
    case 'remote-to-local':
      await syncDatabases('remote-to-local');
      break;
    case 'export-local':
      const localClient = createSqlClient(true);
      await exportData(localClient, true);
      break;
    case 'export-remote':
      try {
        const remoteClient = createSqlClient(false);
        await remoteClient.execute("SELECT 1");
        await exportData(remoteClient, false);
      } catch (error) {
        log(`\n❌ Error: ${error.message}`, colors.red);
      }
      break;
    default:
      log(`\n❌ Unknown command: ${command}`, colors.red);
      showHelp();
  }
}

// Run the main function
main()
  .catch(error => {
    log(`\n❌ Unhandled error: ${error.message}`, colors.red);
  })
  .finally(() => {
    // Add a slight delay to ensure all output is flushed
    setTimeout(() => process.exit(0), 100);
  });
