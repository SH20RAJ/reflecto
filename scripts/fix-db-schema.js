// Fix embedding column in notebooks table
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function fixEmbeddingColumn() {
  try {
    console.log('Checking database schema...');
    
    // First, check if the column exists by trying to access it
    try {
      console.log('Checking if embedding column exists in notebooks table...');
      
      // Check the schema directly with SQL
      const schemaResults = await db.execute(sql`
        PRAGMA table_info(notebooks);
      `);
      
      const columns = schemaResults.rows.map(row => row.name);
      console.log('Columns in notebooks table:', columns);
      
      const hasEmbeddingColumn = columns.includes('embedding');
      console.log('Has embedding column:', hasEmbeddingColumn);
      
      if (!hasEmbeddingColumn) {
        console.log('Adding embedding column to notebooks table...');
        
        await db.execute(sql`
          ALTER TABLE notebooks ADD COLUMN embedding TEXT;
        `);
        
        console.log('Embedding column added successfully!');
      } else {
        console.log('Embedding column already exists.');
      }
      
      // Verify the schema after changes
      const updatedSchema = await db.execute(sql`
        PRAGMA table_info(notebooks);
      `);
      
      console.log('Updated schema:', updatedSchema.rows);
      
      console.log('Schema fix completed successfully!');
    } catch (error) {
      console.error('Error checking schema:', error);
    }
    
  } catch (error) {
    console.error('Error in fixEmbeddingColumn:', error);
  }
}

// Run the function
fixEmbeddingColumn()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err))
  .finally(() => setTimeout(() => process.exit(0), 1000));
