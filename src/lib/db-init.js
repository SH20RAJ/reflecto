/**
 * Database initialization utility
 * This will run on application startup to ensure the database schema is properly configured
 */

import { db, tursoClient } from '@/db';
import { sql } from 'drizzle-orm';

/**
 * Ensure the embedding column exists in the notebooks table
 */
export async function ensureDatabaseSchema() {
  try {
    console.log('Checking database schema...');
    
    // Try adding the embedding column if it doesn't exist
    // Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
    // so we need to check if the column exists first
    try {
      // Check if the embedding column exists
      const result = await tursoClient.execute({
        sql: 'SELECT name FROM pragma_table_info(\'notebooks\') WHERE name = \'embedding\'',
      });
      
      if (result.rows.length === 0) {
        console.log('Adding embedding column to notebooks table...');
        await tursoClient.execute({
          sql: 'ALTER TABLE notebooks ADD COLUMN embedding TEXT',
        });
        console.log('Embedding column added successfully');
      } else {
        console.log('Embedding column already exists');
      }
    } catch (error) {
      // Log the error but don't throw it - the application should still start
      console.error('Error checking or adding embedding column:', error);
    }
    
    console.log('Database schema check completed');
  } catch (error) {
    console.error('Error in database initialization:', error);
  }
}

export default ensureDatabaseSchema;
