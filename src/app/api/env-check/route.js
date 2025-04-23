import { NextResponse } from 'next/server';

/**
 * GET /api/env-check
 * Check if environment variables are properly set
 * This is a diagnostic endpoint to help debug deployment issues
 */
export async function GET() {
  try {
    // Check for required environment variables
    const envVars = {
      // Authentication
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL,
      AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
      
      // Database
      TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
      
      // For backwards compatibility
      TURSO_DB_URL: !!process.env.TURSO_DB_URL,
      TURSO_DB_AUTH_TOKEN: !!process.env.TURSO_DB_AUTH_TOKEN,
      
      // Environment
      NODE_ENV: process.env.NODE_ENV,
    };
    
    // Check if all required variables are set
    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => value === false || value === undefined || value === '')
      .map(([key]) => key);
    
    return NextResponse.json({
      status: 'success',
      message: 'Environment variables check',
      environment: process.env.NODE_ENV,
      variables: envVars,
      missingVariables: missingVars,
      allVariablesSet: missingVars.length === 0,
    });
  } catch (error) {
    console.error('Error in GET /api/env-check:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}
