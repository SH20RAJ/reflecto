import { NextResponse } from 'next/server';
import { createClient } from "@libsql/client";

/**
 * GET /api/db-test
 * Test database connection
 */
export async function GET() {
  try {
    console.log('DB Test - Starting database connection test');
    console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'Set (value hidden)' : 'Not set');
    console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set (value hidden)' : 'Not set');
    console.log('TURSO_DB_URL:', process.env.TURSO_DB_URL ? 'Set (value hidden)' : 'Not set');
    console.log('TURSO_DB_AUTH_TOKEN:', process.env.TURSO_DB_AUTH_TOKEN ? 'Set (value hidden)' : 'Not set');
    
    // Create a direct client connection
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DB_AUTH_TOKEN,
    });
    
    // Test the connection with a simple query
    console.log('DB Test - Executing test query');
    const result = await client.execute('SELECT 1 as test');
    console.log('DB Test - Query result:', result);
    
    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Database connection test successful',
      result: result,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        TURSO_DATABASE_URL_SET: !!process.env.TURSO_DATABASE_URL,
        TURSO_AUTH_TOKEN_SET: !!process.env.TURSO_AUTH_TOKEN,
        TURSO_DB_URL_SET: !!process.env.TURSO_DB_URL,
        TURSO_DB_AUTH_TOKEN_SET: !!process.env.TURSO_DB_AUTH_TOKEN,
      }
    });
  } catch (error) {
    console.error('DB Test - Error testing database connection:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Database Connection Error',
      message: error.message,
      code: error.code,
      stack: error.stack,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        TURSO_DATABASE_URL_SET: !!process.env.TURSO_DATABASE_URL,
        TURSO_AUTH_TOKEN_SET: !!process.env.TURSO_AUTH_TOKEN,
        TURSO_DB_URL_SET: !!process.env.TURSO_DB_URL,
        TURSO_DB_AUTH_TOKEN_SET: !!process.env.TURSO_DB_AUTH_TOKEN,
      }
    }, { status: 500 });
  }
}
