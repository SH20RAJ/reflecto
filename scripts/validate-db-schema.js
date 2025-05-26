#!/usr/bin/env node
/**
 * Database Schema Validation for Reflecto
 * This script ensures both local and remote databases have the correct schema
 * with a focus on the embedding column in notebooks table
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'local-db.sqlite');

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
 * Check for missing tables or columns in the specified database
 */
async function checkDatabaseSchema(client, isLocal) {
  const dbType = isLocal ? "Local" : "Remote";
  log(`\nChecking ${dbType} database schema...`, colors.cyan);
  
  try {
    // Get list of tables
    const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = tablesResult.rows.map(row => row.name);
    
    log(`Tables found in ${dbType} database:`, colors.bright);
    tables.forEach(table => log(`  - ${table}`));
    
    const issues = [];
    
    // Check for critical tables
    const requiredTables = ['users', 'notebooks', 'tags', 'notebooks_tags', 'sessions'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      issues.push(`Missing tables: ${missingTables.join(', ')}`);
    }
    
    // Check for embedding column in notebooks table
    if (tables.includes('notebooks')) {
      const columnsResult = await client.execute("PRAGMA table_info(notebooks)");
      const notebooksColumns = columnsResult.rows.map(row => row.name);
      log(`Columns in notebooks table:`, colors.bright);
      notebooksColumns.forEach(col => log(`  - ${col}`));
      
      const hasEmbeddingColumn = notebooksColumns.includes('embedding');
      
      if (!hasEmbeddingColumn) {
        issues.push('Embedding column missing from notebooks table');
      }
    } else if (requiredTables.includes('notebooks')) {
      issues.push('Notebooks table is missing');
    }
    
    return { tables, issues };
  } catch (error) {
    log(`Error checking database schema: ${error.message}`, colors.red);
    return { tables: [], issues: [error.message] };
  }
}

/**
 * Add embedding column to notebooks table
 */
async function fixEmbeddingColumn(client, isLocal) {
  const dbType = isLocal ? "Local" : "Remote";
  log(`\nFixing embedding column in ${dbType} database...`, colors.cyan);
  
  try {
    // Try the simple approach first
    try {
      await client.execute("ALTER TABLE notebooks ADD COLUMN embedding BLOB");
      log(`✅ Successfully added embedding column using ALTER TABLE`, colors.green);
      return true;
    } catch (alterError) {
      log(`ALTER TABLE failed: ${alterError.message}`, colors.yellow);
      log(`Attempting alternative approach...`, colors.yellow);
      
      // Alternative approach: recreate the table with the embedding column
      // First, check if notebooks table exists and get its structure
      const columnsResult = await client.execute("PRAGMA table_info(notebooks)");
      if (columnsResult.rows.length === 0) {
        log(`❌ Cannot fix: notebooks table does not exist`, colors.red);
        return false;
      }
      
      // Create backup table
      await client.execute("CREATE TABLE notebooks_backup AS SELECT * FROM notebooks");
      log(`✓ Created backup of notebooks table`, colors.green);
      
      // Get columns excluding 'embedding'
      const columns = columnsResult.rows
        .map(row => row.name)
        .filter(col => col !== 'embedding');
      
      const columnsList = columns.join(', ');
      
      // Create new table with embedding column
      await client.execute(`
        CREATE TABLE notebooks_new (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT DEFAULT '',
          user_id TEXT NOT NULL,
          is_public INTEGER DEFAULT 0 NOT NULL,
          created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
          updated_at INTEGER DEFAULT CURRENT_TIMESTAMP,
          embedding BLOB
        )
      `);
      log(`✓ Created new notebooks table with embedding column`, colors.green);
      
      // Copy data from backup
      await client.execute(`
        INSERT INTO notebooks_new (${columnsList})
        SELECT ${columnsList} FROM notebooks_backup
      `);
      log(`✓ Copied data to new table`, colors.green);
      
      // Swap tables
      await client.execute("DROP TABLE notebooks");
      await client.execute("ALTER TABLE notebooks_new RENAME TO notebooks");
      log(`✓ Replaced old table with new one`, colors.green);
      
      return true;
    }
  } catch (error) {
    log(`❌ Error fixing embedding column: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Main function to validate and fix the database schemas
 */
async function validateAndFixSchemas() {
  log("\n🔍 REFLECTO DATABASE SCHEMA VALIDATION 🔍", colors.bright + colors.blue);
  log("------------------------------------------\n");
  
  // Check local database
  try {
    const localClient = createSqlClient(true);
    const { issues: localIssues } = await checkDatabaseSchema(localClient, true);
    
    if (localIssues.length > 0) {
      log("\n❌ Local database has issues:", colors.red);
      localIssues.forEach(issue => log(`  - ${issue}`, colors.yellow));
      
      if (localIssues.some(issue => issue.includes('Embedding column'))) {
        const answer = await prompt("\nDo you want to fix the embedding column issue in the local database? (y/n): ");
        if (answer.toLowerCase() === 'y') {
          await fixEmbeddingColumn(localClient, true);
          
          // Verify fix
          const { issues: verifyIssues } = await checkDatabaseSchema(localClient, true);
          if (!verifyIssues.some(issue => issue.includes('Embedding column'))) {
            log("\n✅ Local database embedding column issue fixed", colors.green);
          } else {
            log("\n❌ Failed to fix local database embedding column issue", colors.red);
          }
        }
      }
    } else {
      log("\n✅ Local database schema is valid", colors.green);
    }
  } catch (error) {
    log(`\n❌ Error with local database: ${error.message}`, colors.red);
  }
  
  // Check remote database
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    log("\n❌ Missing Turso database credentials. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env file.", colors.red);
    return;
  }
  
  try {
    const remoteClient = createSqlClient(false);
    
    // Test connection
    await remoteClient.execute("SELECT 1");
    log("\n✓ Connection to remote Turso database successful", colors.green);
    
    const { issues: remoteIssues } = await checkDatabaseSchema(remoteClient, false);
    
    if (remoteIssues.length > 0) {
      log("\n❌ Remote database has issues:", colors.red);
      remoteIssues.forEach(issue => log(`  - ${issue}`, colors.yellow));
      
      if (remoteIssues.some(issue => issue.includes('Embedding column'))) {
        const answer = await prompt("\nDo you want to fix the embedding column issue in the remote database? (y/n): ");
        if (answer.toLowerCase() === 'y') {
          await fixEmbeddingColumn(remoteClient, false);
          
          // Verify fix
          const { issues: verifyIssues } = await checkDatabaseSchema(remoteClient, false);
          if (!verifyIssues.some(issue => issue.includes('Embedding column'))) {
            log("\n✅ Remote database embedding column issue fixed", colors.green);
          } else {
            log("\n❌ Failed to fix remote database embedding column issue", colors.red);
          }
        }
      }
    } else {
      log("\n✅ Remote database schema is valid", colors.green);
    }
  } catch (error) {
    log(`\n❌ Error with remote database: ${error.message}`, colors.red);
  }
  
  log("\n🏁 DATABASE VALIDATION COMPLETE 🏁", colors.bright + colors.green);
}

// Run validation and fixes
validateAndFixSchemas()
  .catch(error => {
    log(`\n❌ Unhandled error: ${error.message}`, colors.red);
  })
  .finally(() => {
    // Add a slight delay to ensure all output is flushed
    setTimeout(() => process.exit(0), 100);
  });
