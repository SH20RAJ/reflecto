require('dotenv').config();
const { createClient } = require('@libsql/client');

async function fixNotebookDates() {
  try {
    console.log('Connecting to database...');
    
    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Fetching notebooks with null dates...');
    
    // Get all notebooks with null dates
    const notebooks = await client.execute(`
      SELECT id FROM notebooks 
      WHERE created_at IS NULL OR updated_at IS NULL OR 
            created_at < '2000-01-01' OR updated_at < '2000-01-01';
    `);
    
    console.log(`Found ${notebooks.rows.length} notebooks with null or invalid dates.`);
    
    if (notebooks.rows.length > 0) {
      const now = new Date().toISOString();
      
      // Update each notebook with current timestamp
      for (const notebook of notebooks.rows) {
        await client.execute({
          sql: `UPDATE notebooks SET created_at = ?, updated_at = ? WHERE id = ?;`,
          args: [now, now, notebook.id]
        });
        console.log(`Updated notebook ${notebook.id}`);
      }
      
      console.log('All notebooks updated successfully!');
    } else {
      console.log('No notebooks need to be fixed.');
    }
    
  } catch (error) {
    console.error('Error fixing notebook dates:', error);
  } finally {
    process.exit(0);
  }
}

fixNotebookDates();
