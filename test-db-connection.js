// Test script to verify Turso database connection
const { createClient } = require('@libsql/client');
require('dotenv/config');

async function testConnection() {
  try {
    console.log('Testing Turso database connection...');
    console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'Set' : 'Not set');
    console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'Not set');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Test simple query
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result.rows);
    
    // Test if tables exist
    try {
      const tables = await client.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name;
      `);
      console.log('📋 Existing tables:', tables.rows.map(row => row.name));
    } catch (error) {
      console.log('ℹ️  Could not list tables:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
