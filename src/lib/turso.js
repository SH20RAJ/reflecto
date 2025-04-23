import { createClient } from '@libsql/client';

// Log database connection attempt
console.log('Initializing tursoClient connection');
console.log('TURSO_DB_URL:', process.env.TURSO_DB_URL ? 'Set (value hidden)' : 'Not set');
console.log('TURSO_DB_AUTH_TOKEN:', process.env.TURSO_DB_AUTH_TOKEN ? 'Set (value hidden)' : 'Not set');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'Set (value hidden)' : 'Not set');
console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set (value hidden)' : 'Not set');

// Try to create a client with different environment variable combinations
let tursoClient;
try {
  // First try with TURSO_DB_URL and TURSO_DB_AUTH_TOKEN
  if (process.env.TURSO_DB_URL && process.env.TURSO_DB_AUTH_TOKEN) {
    console.log('Creating tursoClient with TURSO_DB_URL and TURSO_DB_AUTH_TOKEN');
    tursoClient = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });
  }
  // Then try with TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
  else if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    console.log('Creating tursoClient with TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  // If none of the above work, try with any combination that might work
  else {
    console.log('Creating tursoClient with fallback options');
    tursoClient = createClient({
      url: process.env.TURSO_DB_URL || process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_DB_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    });
  }

  console.log('tursoClient created successfully');
} catch (error) {
  console.error('Error creating tursoClient:', error);
  throw new Error(`Failed to initialize tursoClient: ${error.message}`);
}

export { tursoClient };
