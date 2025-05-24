/**
 * Service for generating and managing vector embeddings using Cloudflare AI
 */
import { db } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Cloudflare API credentials
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_AUTH_TOKEN = process.env.CLOUDFLARE_AUTH_TOKEN;

/**
 * Generate embeddings for text using Cloudflare AI API (BGE-M3)
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<Array<number>>} - The vector embedding
 */
export async function generateEmbedding(text) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: [text] })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to generate embedding: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    // Check the structure of the response
    if (!data.success) {
      throw new Error(`API returned error: ${JSON.stringify(data)}`);
    }
    
    // Handle different response structures from Cloudflare API
    // Some endpoints return data.result.data[0], others return data.result[0]
    if (data.result) {
      // Format 1: result.data array
      if (data.result.data && Array.isArray(data.result.data) && data.result.data[0]) {
        return data.result.data[0];
      }
      
      // Format 2: result array directly
      if (Array.isArray(data.result) && data.result[0]) {
        return data.result[0];
      }
      
      // Format 3: result.data is the embedding
      if (data.result.data) {
        return data.result.data;
      }
    }
    
    // If we get here, log the unexpected structure and throw error
    console.error("Unexpected API response structure:", JSON.stringify(data).substring(0, 200) + "...");
    throw new Error(`Invalid response structure from Cloudflare AI API`);
    
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate and save embedding for a notebook
 * @param {string} notebookId - The ID of the notebook
 * @returns {Promise<boolean>} - Whether the embedding was successfully generated and saved
 */
export async function generateAndSaveEmbedding(notebookId) {
  try {
    // Get the notebook
    const [notebook] = await db.select().from(notebooks).where(eq(notebooks.id, notebookId));
    
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookId}`);
    }

    // Prepare text for embedding (combine title and content)
    const text = `${notebook.title} ${notebook.content || ''}`.trim();
    
    if (!text) {
      console.warn(`Notebook ${notebookId} has no content to embed`);
      return false;
    }

    // Generate embedding - use a retry mechanism for resilience
    let embedding;
    let retries = 2;
    let success = false;
    
    while (retries >= 0 && !success) {
      try {
        embedding = await generateEmbedding(text);
        success = true;
      } catch (embeddingError) {
        console.warn(`Embedding generation attempt failed (${retries} retries left):`, embeddingError.message);
        if (retries === 0) throw embeddingError;
        retries--;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Validate embedding before saving
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Generated embedding is not a valid array');
    }      // Save embedding to the notebook
    try {
      // Store the embedding array directly - Drizzle will handle JSON serialization
      await db.update(notebooks)
        .set({ 
          embedding: embedding,
          updatedAt: new Date() // Also update the timestamp
        })
        .where(eq(notebooks.id, notebookId));
      
      console.log(`Successfully generated and saved embedding for notebook ${notebookId}`);
      return true;
    } catch (dbError) {
      // If there's an error with the vector format, try storing as JSON string
      console.warn(`Error saving embedding as vector, trying JSON: ${dbError.message}`);
      try {
        await db.update(notebooks)
          .set({ 
            embedding: JSON.stringify(embedding),
            updatedAt: new Date()
          })
          .where(eq(notebooks.id, notebookId));
        
        console.log(`Successfully saved embedding as JSON string for notebook ${notebookId}`);
        return true;
      } catch (jsonError) {
        console.error(`Failed to save embedding as JSON: ${jsonError.message}`);
        return false;
      }
    }
  } catch (error) {
    console.error(`Error generating embedding for notebook ${notebookId}:`, error);
    return false;
  }
}

/**
 * Generate embeddings for all notebooks that don't have embeddings yet
 * @returns {Promise<{total: number, success: number, failed: number}>} - Statistics about the operation
 */
export async function generateAllEmbeddings() {
  try {
    // Get all notebooks without embeddings
    const notebooksWithoutEmbeddings = await db.select({ 
        id: notebooks.id,
        title: notebooks.title 
      })
      .from(notebooks)
      .where(eq(notebooks.embedding, null));
    
    const total = notebooksWithoutEmbeddings.length;
    console.log(`Found ${total} notebooks without embeddings`);
    
    let success = 0;
    let failed = 0;

    // Process notebooks in batches to avoid rate limiting
    const batchSize = 5;
    const totalBatches = Math.ceil(notebooksWithoutEmbeddings.length / batchSize);
    
    for (let i = 0; i < notebooksWithoutEmbeddings.length; i += batchSize) {
      const batch = notebooksWithoutEmbeddings.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} notebooks)...`);
      
      // Process notebooks in sequence within each batch
      for (const notebook of batch) {
        try {
          console.log(`Generating embedding for notebook: ${notebook.id} - "${notebook.title}"`);
          const result = await generateAndSaveEmbedding(notebook.id);
          
          if (result) {
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          console.error(`Error processing notebook ${notebook.id}:`, error);
        }
        
        console.log(`Progress: ${success + failed}/${total} (${success} success, ${failed} failed)`);
        
        // Add a small delay between requests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Add a delay between batches
      if (i + batchSize < notebooksWithoutEmbeddings.length) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { total, success, failed };
  } catch (error) {
    console.error('Error generating all embeddings:', error);
    throw error;
  }
}
