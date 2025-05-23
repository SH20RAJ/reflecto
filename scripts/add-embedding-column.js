// Add embedding column to notebooks table
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addEmbeddingColumn() {
  try {
    console.log('Connecting to database...');
    
    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Checking if embedding column exists...');
    let hasColumn = false;
    
    try {
      // Try to query the column to see if it exists
      await client.execute(`SELECT embedding FROM notebooks LIMIT 1;`);
      hasColumn = true;
      console.log('Column already exists');
    } catch (error) {
      console.log('Column does not exist, will create it');
    }
    
    if (!hasColumn) {
      console.log('Adding embedding column to notebooks table...');
      
      // Add embedding column to notebooks table with TEXT type
      // SQLite doesn't support JSON data type natively, so we'll store as TEXT
      await client.execute(`
        ALTER TABLE notebooks ADD COLUMN embedding TEXT;
      `);
      
      console.log('Column added successfully!');
    }
    
    console.log('Checking schema completion...');
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addEmbeddingColumn();
