#!/usr/bin/env node

import { db } from "../src/db/index.js";
import { notebooks } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

/**
 * Generate embeddings for notebook content using the OpenAI API
 * @param {string} content - The notebook content to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
async function generateEmbedding(content) {
  try {
    // Clean and prepare text
    const cleanedContent = content
      .replace(/[#*`>_~\[\]]/g, '') // Remove markdown symbols
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
      
    if (!cleanedContent) {
      return null;
    }

    // Make API call to OpenAI embeddings endpoint
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",  // Using OpenAI's text embedding model
        input: cleanedContent.substring(0, 8191)  // Limit to model's token limit
      })
    });

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error("Failed to generate embedding:", data);
      return null;
    }

    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

async function updateNotebookEmbeddings() {
  try {
    console.log("Fetching notebooks...");
    const allNotebooks = await db.select().from(notebooks);
    console.log(`Found ${allNotebooks.length} notebooks`);

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const notebook of allNotebooks) {
      try {
        // Skip empty content
        if (!notebook.content || notebook.content.trim() === '') {
          console.log(`Skipping notebook ${notebook.id} (empty content)`);
          skippedCount++;
          continue;
        }

        // Generate embedding
        console.log(`Generating embedding for notebook ${notebook.id}...`);
        const embedding = await generateEmbedding(notebook.content);
        
        if (!embedding) {
          console.log(`Failed to generate embedding for notebook ${notebook.id}`);
          failedCount++;
          continue;
        }

        // Update notebook with embedding
        console.log(`Updating notebook ${notebook.id} with embedding...`);
        await db.update(notebooks)
          .set({ embedding: embedding })
          .where(eq(notebooks.id, notebook.id));
        
        updatedCount++;
        console.log(`Successfully updated notebook ${notebook.id}`);
      } catch (error) {
        console.error(`Error updating notebook ${notebook.id}:`, error);
        failedCount++;
      }
    }

    console.log("\n==== SUMMARY ====");
    console.log(`Total notebooks: ${allNotebooks.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${failedCount}`);
  } catch (error) {
    console.error("Error updating embeddings:", error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateNotebookEmbeddings();
