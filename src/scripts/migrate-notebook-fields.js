require('dotenv').config();
const { createClient } = require('@libsql/client');

// We don't need the editorJsToMarkdown function for this migration
// as we're just clearing the fields

async function migrateNotebookFields() {
  try {
    console.log('Connecting to database...');

    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Checking database schema...');

    // Check if markdown and plainText columns exist
    const tableInfo = await client.execute(`PRAGMA table_info(notebooks);`);
    const columns = tableInfo.rows.map(row => row.name);

    const hasMarkdown = columns.includes('markdown');
    const hasPlainText = columns.includes('plain_text');

    if (!hasMarkdown && !hasPlainText) {
      console.log('No migration needed. The markdown and plainText columns do not exist.');
      process.exit(0);
    }

    console.log('Fetching notebooks...');

    // Get all notebooks
    const notebooks = await client.execute(`SELECT id, content FROM notebooks;`);

    console.log(`Found ${notebooks.rows.length} notebooks to process.`);

    // Process each notebook
    for (const notebook of notebooks.rows) {
      const { id, content } = notebook;

      // Skip if content is empty
      if (!content) {
        console.log(`Skipping notebook ${id} - no content`);
        continue;
      }

      console.log(`Processing notebook ${id}`);

      // Update the notebook to remove markdown and plainText fields
      // We're not actually removing the columns, just setting them to empty
      // as that would require a schema migration
      await client.execute({
        sql: `UPDATE notebooks SET markdown = '', plain_text = '' WHERE id = ?;`,
        args: [id]
      });
    }

    console.log('Migration completed successfully!');
    console.log('Note: The markdown and plainText columns still exist in the schema, but their values have been cleared.');
    console.log('To completely remove these columns, you would need to perform a schema migration.');

  } catch (error) {
    console.error('Error migrating notebook fields:', error);
  } finally {
    process.exit(0);
  }
}

migrateNotebookFields();
