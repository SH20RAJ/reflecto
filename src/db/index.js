import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// Create the Turso client
export const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create the Drizzle ORM instance
export const db = drizzle(tursoClient);

// Helper function for raw SQL queries
export async function executeRawSQL(sql, params = []) {
  try {
    return await tursoClient.execute({ sql, args: params });
  } catch (error) {
    console.error("Error executing raw SQL:", error);
    throw error;
  }
}

// Helper function to convert JavaScript Date to SQLite timestamp (seconds since epoch)
export function dateToSQLiteTimestamp(date) {
  if (!date) return Math.floor(Date.now() / 1000);
  if (!(date instanceof Date)) {
    try {
      date = new Date(date);
    } catch (e) {
      console.error("Invalid date:", date, e);
      return Math.floor(Date.now() / 1000);
    }
  }
  return Math.floor(date.getTime() / 1000);
}

// Helper function to convert SQLite timestamp to JavaScript Date
export function sqliteTimestampToDate(timestamp) {
  if (!timestamp) return new Date(0); // Return epoch if no timestamp
  // If it's already a Date object, return it
  if (timestamp instanceof Date) return timestamp;

  // Convert to number if it's a string
  if (typeof timestamp === 'string') {
    timestamp = parseInt(timestamp, 10);
  }

  // SQLite timestamps are in seconds, JS Date expects milliseconds
  return new Date(timestamp * 1000);
}