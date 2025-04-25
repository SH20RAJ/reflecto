#!/usr/bin/env node

// This script sets up the newsletter, feedback, and contact tables in the database
require('dotenv').config();
const { createClient } = require('@libsql/client');

async function main() {
  console.log('Setting up tables...');
  
  try {
    // Create a client using the credentials from .env
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    
    // Create the newsletter_subscriptions table if it doesn't exist
    console.log('Creating newsletter_subscriptions table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1 NOT NULL
      )
    `);
    
    // Create the feedback table if it doesn't exist
    console.log('Creating feedback table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        rating INTEGER,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create the contact_messages table if it doesn't exist
    console.log('Creating contact_messages table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new' NOT NULL,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    console.log('Tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

main();
