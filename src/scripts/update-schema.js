require('dotenv').config();
const { createClient } = require('@libsql/client');

async function updateSchema() {
  try {
    console.log('Connecting to database...');
    
    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Updating notebooks table...');
    
    // Add markdown and plain_text columns to notebooks table
    await client.execute(`
      ALTER TABLE notebooks ADD COLUMN markdown TEXT DEFAULT '';
    `);
    
    await client.execute(`
      ALTER TABLE notebooks ADD COLUMN plain_text TEXT DEFAULT '';
    `);
    
    console.log('Schema updated successfully!');
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit(0);
  }
}

updateSchema();
