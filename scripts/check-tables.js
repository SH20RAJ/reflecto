#!/usr/bin/env node

// This script checks if the tables exist in the database
require('dotenv').config();
const { createClient } = require('@libsql/client');

async function main() {
  console.log('Checking tables...');
  
  try {
    // Create a client using the credentials from .env
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    
    // Check if the tables exist
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('newsletter_subscriptions', 'feedback', 'contact_messages')
    `);
    
    console.log('Tables found:');
    tables.rows.forEach(row => {
      console.log(`- ${row.name}`);
    });
    
    if (tables.rows.length === 3) {
      console.log('All tables exist!');
    } else {
      console.log('Some tables are missing.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking tables:', error);
    process.exit(1);
  }
}

main();
