require('dotenv').config();
const { createClient } = require('@libsql/client');

async function fixNotebookContent() {
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
    
    console.log(`Found ${notebooks.rows.length} notebooks to check.`);
    
    let fixedCount = 0;
    
    // Check and fix each notebook
    for (const notebook of notebooks.rows) {
      const { id, content } = notebook;
      
      // Skip if content is empty
      if (!content) {
        console.log(`Skipping notebook ${id} - no content`);
        continue;
      }
      
      // Check if content is valid JSON
      let isValidJson = false;
      try {
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
          JSON.parse(content);
          isValidJson = true;
        }
      } catch (e) {
        isValidJson = false;
      }
      
      // If not valid JSON, convert to Editor.js format
      if (!isValidJson) {
        console.log(`Fixing notebook ${id} - invalid JSON content`);
        
        // Create a simple editor data with the content as a paragraph
        const editorData = {
          time: new Date().getTime(),
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: content
              }
            }
          ],
          version: "2.28.2"
        };
        
        // Update the notebook with proper JSON content
        await client.execute({
          sql: `UPDATE notebooks SET content = ? WHERE id = ?;`,
          args: [JSON.stringify(editorData), id]
        });
        
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} notebooks with invalid JSON content.`);
    
  } catch (error) {
    console.error('Error fixing notebook content:', error);
  } finally {
    process.exit(0);
  }
}

fixNotebookContent();
