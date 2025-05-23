// Comprehensive database fix script for Reflecto using CommonJS
// This will work with SQLite without ESM import issues

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixDatabaseSchema() {
  console.log('🔧 Starting database schema fix...');
  
  try {
    // Use direct SQLite connection instead of Drizzle ORM
    console.log('Creating direct database connection...');
    
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
    
    if (!dbUrl) {
      console.error('❌ No database URL found in environment variables');
      console.log('Please set DATABASE_URL or TURSO_DATABASE_URL in your .env.local file');
      return;
    }
    
    console.log('Database URL found, attempting connection...');
    
    let client;
    try {
      // Try to use Turso client if available
      const { createClient } = require('@libsql/client');
      client = createClient({
        url: dbUrl,
        authToken: process.env.TURSO_AUTH_TOKEN
      });
      console.log('✓ Using @libsql/client for database connection');
    } catch (err) {
      console.log('Falling back to sqlite3...');
      // Fallback to sqlite3
      const sqlite3 = require('sqlite3').verbose();
      const { open } = require('sqlite');
      client = await open({
        filename: dbUrl.replace('file:', ''),
        driver: sqlite3.Database
      });
      console.log('✓ Using sqlite3 for database connection');
    }

    // 1. Check database connection
    console.log('Testing database connection...');
    await client.execute('SELECT 1');
    console.log('✓ Database connection successful');
    
    // 2. Check tables structure
    console.log('Inspecting database tables...');
    
    // Get table information
    const tables = await client.execute('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Tables in database:', tables.rows.map(row => row.name));
    
    // Check if notebooks table exists
    const hasNotebooksTable = tables.rows.some(row => row.name === 'notebooks');
    if (!hasNotebooksTable) {
      console.error('❌ Notebooks table does not exist! This is a critical error.');
      return;
    }
    console.log('✓ Notebooks table exists');
    
    // 3. Check embedding column
    console.log('Checking for embedding column in notebooks table...');
    const columnsResult = await client.execute('PRAGMA table_info(notebooks)');
    const columns = columnsResult.rows;
    console.log('Columns in notebooks table:', columns.map(c => c.name));
    
    const hasEmbeddingColumn = columns.some(col => col.name === 'embedding');
    
    if (!hasEmbeddingColumn) {
      console.log('⚠️ Embedding column missing. Adding it now...');
      
      // Add embedding column
      await client.execute('ALTER TABLE notebooks ADD COLUMN embedding TEXT');
      console.log('✓ Added embedding column to notebooks table');
    } else {
      console.log('✓ Embedding column already exists');
    }
    
    // 4. Verify column was added successfully
    const verifyColumns = await client.execute('PRAGMA table_info(notebooks)');
    const updatedHasEmbedding = verifyColumns.rows.some(col => col.name === 'embedding');
    
    if (updatedHasEmbedding) {
      console.log('✓ Database schema is now properly configured');
    } else {
      console.error('❌ Failed to add embedding column. Please check database permissions.');
      return;
    }
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  }
}

// Run the script
fixDatabaseSchema()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err))
  .finally(() => setTimeout(() => process.exit(0), 1000));
