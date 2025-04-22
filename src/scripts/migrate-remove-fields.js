require('dotenv').config();
const { createClient } = require('@libsql/client');

async function migrateRemoveFields() {
  try {
    console.log('Connecting to database...');
    
    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Checking database schema...');
    
    // Check if markdown and plainText columns exist
    const tableInfo = await client.execute(`PRAGMA table_info(notebooks);`);
    const columns = tableInfo.rows.map(row => row.name);
    
    const hasMarkdown = columns.includes('markdown');
    const hasPlainText = columns.includes('plain_text');
    
    if (!hasMarkdown && !hasPlainText) {
      console.log('No migration needed. The markdown and plainText columns do not exist.');
      process.exit(0);
    }
    
    console.log('Migrating database schema...');
    
    // Create a new table without the markdown and plainText fields
    await client.execute(`
      CREATE TABLE notebooks_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        user_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Copy data from the old table to the new table
    await client.execute(`
      INSERT INTO notebooks_new (id, title, content, user_id, created_at, updated_at)
      SELECT id, title, content, user_id, created_at, updated_at FROM notebooks;
    `);
    
    // Drop the old table
    await client.execute(`DROP TABLE notebooks;`);
    
    // Rename the new table to the original name
    await client.execute(`ALTER TABLE notebooks_new RENAME TO notebooks;`);
    
    console.log('Migration completed successfully!');
    console.log('The markdown and plainText columns have been removed from the notebooks table.');
    
  } catch (error) {
    console.error('Error migrating database schema:', error);
  } finally {
    process.exit(0);
  }
}

migrateRemoveFields();
