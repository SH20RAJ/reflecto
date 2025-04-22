import { createClient } from '@libsql/client';

export const tursoClient = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});
