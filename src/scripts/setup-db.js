require('dotenv').config();
const { createClient } = require('@libsql/client');

async function setupDatabase() {
  try {
    console.log('Connecting to database...');

    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Creating tables...');

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER,
        image TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);
    console.log('Users table created.');

    // Create accounts table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY(provider, provider_account_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Accounts table created.');

    // Create sessions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        session_token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        expires INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Sessions table created.');

    // Create verification tokens table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires INTEGER NOT NULL,
        PRIMARY KEY(identifier, token)
      );
    `);
    console.log('Verification tokens table created.');

    // Create notebooks table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        user_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Notebooks table created.');

    // Create tags table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
        name TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Tags table created.');

    // Create notebooks_tags table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS notebooks_tags (
        notebook_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY(notebook_id, tag_id),
        FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);
    console.log('Notebooks_tags table created.');

    console.log('All tables created successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
