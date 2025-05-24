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

    // Fetch notebooks with their embeddings
    let notebooks = await db.select({
      id: notebooks.id,
      title: notebooks.title,
      content: notebooks.content,
      userId: notebooks.userId,
      embedding: notebooks.embedding,
      createdAt: notebooks.createdAt,
      updatedAt: notebooks.updatedAt,
    })
    .from(notebooks)
    .where(
      and(
        eq(notebooks.userId, userId),
        sql`${notebooks.embedding} IS NOT NULL`,
        dateRange?.startDate ? gte(notebooks.createdAt, dateRange.startDate) : undefined,
        dateRange?.endDate ? lte(notebooks.createdAt, dateRange.endDate) : undefined
      )
    );
    // Calculate similarities and sort
    const notebooksWithSimilarity = notebooks
      .map(notebook => {
        try {
          const embedding = notebook.embedding;
          if (!embedding) return null;

          // Calculate cosine similarity between query embedding and notebook embedding
          const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
          
          return {
            ...notebook,
            similarity
          };
        } catch (error) {
          console.error(`Error processing notebook ${notebook.id}:`, error);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return { 
      success: true, 
      notebooks: notebooksWithSimilarity.map(n => ({
        ...n,
        similarity: Math.round(n.similarity * 100) // Convert to percentage
      }))
    };
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

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Cosine similarity (0-1)
 */
function calculateCosineSimilarity(vec1, vec2) {
  if (!Array.isArray(vec1) || !Array.isArray(vec2) || vec1.length !== vec2.length) {
    return 0;
  }

  try {
    // Calculate dot product
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    // Calculate magnitudes
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    // Return cosine similarity
    return dotProduct / (norm1 * norm2);
  } catch (error) {
    console.error('Error calculating cosine similarity:', error);
    return 0;
  }
}
