"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { notebooks } from "@/db/schema";

/**
 * Generate embeddings for notebook content using the OpenAI API
 * @param {string} content - The notebook content to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
export async function generateEmbedding(content) {
  try {
    // Clean and prepare text
    const cleanedContent = content
      .replace(/[#*`>_~\[\]]/g, '') // Remove markdown symbols
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();

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

/**
 * Create or update embedding for a notebook
 * @param {string} notebookId - The ID of the notebook
 * @param {string} content - The content to create embeddings from
 */
export async function updateNotebookEmbedding(notebookId, content) {
  try {
    if (!content || content.trim() === "") {
      return { success: false, message: "Content is empty" };
    }

    const embedding = await generateEmbedding(content);
    
    if (!embedding) {
      return { success: false, message: "Failed to generate embedding" };
    }

    // Store embedding in database
    await db.update(notebooks)
      .set({ embedding: embedding })
      .where(eq(notebooks.id, notebookId));
    
    return { success: true };
  } catch (error) {
    console.error("Error updating notebook embedding:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Find similar notebooks based on query
 * @param {string} query - The query to search for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of matching notebooks
 */
export async function findSimilarNotebooks(query, options = {}) {
  try {
    const { limit = 5, dateRange, userId } = options;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      return { success: false, notebooks: [], error: "Failed to generate query embedding" };
    }
    
    // If using SQLite with Turso:
    // We need to construct a query that uses vector_top_k function
    // Note: This is simplified and would need to be adjusted for your schema
    const sql = `
      SELECT n.*, 
        libsql_vector_cosine_similarity(n.embedding, ?) as similarity
      FROM notebooks n
      WHERE n.user_id = ?
      ${dateRange?.startDate ? 'AND n.created_at >= ?' : ''}
      ${dateRange?.endDate ? 'AND n.created_at <= ?' : ''}
      AND n.embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT ?
    `;
    
    // Prepare parameters
    const params = [
      JSON.stringify(queryEmbedding), // Convert embedding array to string
      userId
    ];
    
    if (dateRange?.startDate) {
      params.push(dateRange.startDate.toISOString());
    }
    
    if (dateRange?.endDate) {
      params.push(dateRange.endDate.toISOString());
    }
    
    params.push(limit);
    
    // Execute SQL query
    // This is pseudocode - you'll need to adapt this to your specific SQL executor
    // const results = await db.execute(sql, params);
    
    // For now, we'll do a simpler query with drizzle-orm
    const notebooks = await db.query.notebooks.findMany({
      where: (notebooks) => {
        let condition = eq(notebooks.userId, userId);
        // Add date filters if provided
        // Note: This doesn't do vector similarity search yet
        return condition;
      },
      limit: limit,
    });
    
    return { success: true, notebooks };
  } catch (error) {
    console.error("Error finding similar notebooks:", error);
    return { success: false, notebooks: [], error: error.message };
  }
}

/**
 * Batch update embeddings for all notebooks without embeddings
 */
export async function updateMissingEmbeddings() {
  try {
    // Get all notebooks without embeddings
    const notebooksWithoutEmbeddings = await db.query.notebooks.findMany({
      where: (notebooks) => {
        return eq(notebooks.embedding, null);
      },
    });

    console.log(`Found ${notebooksWithoutEmbeddings.length} notebooks without embeddings`);

    let successCount = 0;
    for (const notebook of notebooksWithoutEmbeddings) {
      const result = await updateNotebookEmbedding(notebook.id, notebook.content);
      if (result.success) {
        successCount++;
      }
    }

    return { success: true, processed: notebooksWithoutEmbeddings.length, successful: successCount };
  } catch (error) {
    console.error("Error updating missing embeddings:", error);
    return { success: false, error: error.message };
  }
}
