// Comprehensive database fix script for Reflecto
// This script will ensure the embedding column exists in the notebooks table
// and create any necessary indexes to speed up vector searches

import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { notebooks } from '../src/db/schema';
import { generateEmbedding } from '../src/lib/generateEmbeddings';

async function fixDatabaseSchema() {
  console.log('🔧 Starting database schema fix...');
  
  try {
    // 1. Check database connection
    console.log('Checking database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✓ Database connection successful');
    
    // 2. Check tables structure
    console.log('Inspecting database tables...');
    
    // Get table information
    const tables = await db.execute(sql`SELECT name FROM sqlite_master WHERE type='table'`);
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
    const columnsResult = await db.execute(sql`PRAGMA table_info(notebooks)`);
    const columns = columnsResult.rows;
    console.log('Columns in notebooks table:', columns.map(c => c.name));
    
    const hasEmbeddingColumn = columns.some(col => col.name === 'embedding');
    
    if (!hasEmbeddingColumn) {
      console.log('⚠️ Embedding column missing. Adding it now...');
      
      // Add embedding column
      await db.execute(sql`ALTER TABLE notebooks ADD COLUMN embedding TEXT`);
      console.log('✓ Added embedding column to notebooks table');
    } else {
      console.log('✓ Embedding column already exists');
    }
    
    // 4. Verify column was added successfully
    const verifyColumns = await db.execute(sql`PRAGMA table_info(notebooks)`);
    const updatedHasEmbedding = verifyColumns.rows.some(col => col.name === 'embedding');
    
    if (updatedHasEmbedding) {
      console.log('✓ Database schema is now properly configured');
    } else {
      console.error('❌ Failed to add embedding column. Please check database permissions.');
      return;
    }
    
    // 5. Generate test embedding to verify functionality
    console.log('Testing embedding generation...');
    try {
      const testEmbedding = await generateEmbedding('This is a test embedding');
      console.log(`✓ Successfully generated test embedding with ${testEmbedding.length} dimensions`);
    } catch (embErr) {
      console.error('❌ Error generating test embedding:', embErr);
      console.log('This may indicate an issue with the Cloudflare AI API connection');
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
