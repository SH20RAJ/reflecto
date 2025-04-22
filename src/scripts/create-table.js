require('dotenv').config();
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { sql } = require('drizzle-orm');

async function createTable() {
  try {
    console.log('Connecting to database...');

    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Create a drizzle instance
    const db = drizzle(client);

    console.log('Creating foo table...');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS foo (
        bar text DEFAULT 'Hey!' NOT NULL
      );
    `);

    console.log('Table created successfully!');

    // Insert a test record
    await client.execute(`
      INSERT INTO foo (bar) VALUES ('Test entry from script');
    `);

    console.log('Test record inserted!');

    // Verify the table was created
    const result = await client.execute(`SELECT * FROM foo;`);
    console.log('Table contents:', result.rows);

  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
