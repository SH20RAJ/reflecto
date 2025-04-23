import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// Log database connection attempt
console.log('Initializing database connection');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'Set (value hidden)' : 'Not set');
console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set (value hidden)' : 'Not set');
console.log('TURSO_DB_URL:', process.env.TURSO_DB_URL ? 'Set (value hidden)' : 'Not set');
console.log('TURSO_DB_AUTH_TOKEN:', process.env.TURSO_DB_AUTH_TOKEN ? 'Set (value hidden)' : 'Not set');

// Try to create a client with different environment variable combinations
let turso;
try {
  // First try with TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    console.log('Creating client with TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
    turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  // Then try with TURSO_DB_URL and TURSO_DB_AUTH_TOKEN
  else if (process.env.TURSO_DB_URL && process.env.TURSO_DB_AUTH_TOKEN) {
    console.log('Creating client with TURSO_DB_URL and TURSO_DB_AUTH_TOKEN');
    turso = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });
  }
  // If none of the above work, try with any combination that might work
  else {
    console.log('Creating client with fallback options');
    turso = createClient({
      url: process.env.TURSO_DATABASE_URL || process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DB_AUTH_TOKEN,
    });
  }

  console.log('Database client created successfully');
} catch (error) {
  console.error('Error creating database client:', error);
  throw new Error(`Failed to initialize database: ${error.message}`);
}

export const db = drizzle(turso);