#!/usr/bin/env node

// This script updates the database schema to add username and isPublic fields
require('dotenv').config();
const { createClient } = require('@libsql/client');

async function main() {
  console.log('Updating database schema...');
  
  try {
    // Create a client using the credentials from .env
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    
    // Add username field to users table
    console.log('Adding username field to users table...');
    try {
      await client.execute(`
        ALTER TABLE users ADD COLUMN username TEXT;
      `);
      console.log('Username field added successfully');
      
      // Create unique index for username
      await client.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);
      `);
      console.log('Username unique index created');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('Username field already exists');
      } else {
        throw error;
      }
    }
    
    // Add isPublic field to notebooks table
    console.log('Adding isPublic field to notebooks table...');
    try {
      await client.execute(`
        ALTER TABLE notebooks ADD COLUMN is_public INTEGER DEFAULT 0 NOT NULL;
      `);
      console.log('isPublic field added successfully');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('isPublic field already exists');
      } else {
        throw error;
      }
    }
    
    console.log('Schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

main();
