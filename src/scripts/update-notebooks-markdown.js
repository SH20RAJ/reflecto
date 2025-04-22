require('dotenv').config();
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');

// Import the conversion function
const { editorJsToMarkdown, extractPlainText } = require('../lib/editorjs-to-markdown.cjs');

async function updateNotebooksMarkdown() {
  try {
    console.log('Connecting to database...');

    // Create a client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Fetching notebooks...');

    // Get all notebooks
    const notebooks = await client.execute(`SELECT id, content FROM notebooks;`);

    console.log(`Found ${notebooks.rows.length} notebooks to update.`);

    // Update each notebook with markdown and plain text
    for (const notebook of notebooks.rows) {
      try {
        const { id, content } = notebook;

        // Skip if content is empty
        if (!content) {
          console.log(`Skipping notebook ${id} - no content`);
          continue;
        }

        // Parse the content
        let contentObj;
        try {
          contentObj = JSON.parse(content);
        } catch (e) {
          console.error(`Error parsing content for notebook ${id}:`, e);
          // Create a simple content object with the text
          contentObj = {
            blocks: [
              {
                type: "paragraph",
                data: {
                  text: content
                }
              }
            ]
          };
        }

        // Convert to markdown and plain text
        const markdown = editorJsToMarkdown(contentObj);
        const plainText = extractPlainText(contentObj);

        // Update the notebook
        await client.execute({
          sql: `UPDATE notebooks SET markdown = ?, plain_text = ? WHERE id = ?;`,
          args: [markdown, plainText, id]
        });

        console.log(`Updated notebook ${id}`);
      } catch (error) {
        console.error(`Error updating notebook ${notebook.id}:`, error);
      }
    }

    console.log('All notebooks updated successfully!');

  } catch (error) {
    console.error('Error updating notebooks:', error);
  } finally {
    process.exit(0);
  }
}

updateNotebooksMarkdown();
