/**
 * Service for performing vector similarity searches on notebook embeddings
 */
import { db } from '@/db';
import { notebooks } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateEmbedding } from './generateEmbeddings';

/**
 * Calculate the cosine similarity between two vectors
 * @param {Array<number>} vec1 - The first vector
 * @param {Array<number>} vec2 - The second vector
 * @returns {number} - The cosine similarity (between -1 and 1)
 */
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate the Euclidean distance between two vectors
 * Lower values indicate more similarity
 * @param {Array<number>} vec1 - The first vector
 * @param {Array<number>} vec2 - The second vector
 * @returns {number} - The Euclidean distance
 */
function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate similarity score using multiple methods and return a combined score
 * @param {Array<number>} vec1 - The first vector
 * @param {Array<number>} vec2 - The second vector
 * @returns {number} - Combined similarity score (0-1)
 */
function calculateSimilarity(vec1, vec2) {
  // Get cosine similarity (higher is better, range -1 to 1)
  const cosine = cosineSimilarity(vec1, vec2);
  
  // Normalize cosine to 0-1 range
  const normalizedCosine = (cosine + 1) / 2;
  
  // Get Euclidean distance (lower is better)
  const euclidean = euclideanDistance(vec1, vec2);
  
  // Normalize Euclidean to 0-1 range (inverse, so higher is better)
  // Using a softmax-like normalization with a scaling factor
  const normalizedEuclidean = 1 / (1 + euclidean / 10);
  
  // Combine scores (weighted average)
  return normalizedCosine * 0.7 + normalizedEuclidean * 0.3;
}

/**
 * Search notebooks by semantic similarity to the query
 * @param {string} query - The search query
 * @param {string} userId - The user ID
 * @param {Object} options - Additional options
 * @param {Date} options.startDate - The start date for filtering
 * @param {Date} options.endDate - The end date for filtering
 * @param {number} options.limit - The maximum number of results
 * @param {number} options.similarityThreshold - The minimum similarity score (0-1)
 * @returns {Promise<Array<Object>>} - The search results with similarity scores
 */
export async function searchNotebooksByVector(query, userId, options = {}) {
  try {
    const {
      startDate = null,
      endDate = null,
      limit = 10,
      similarityThreshold = 0.7
    } = options;

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Get notebooks with embeddings
    let dbQuery = db
      .select({
        id: notebooks.id,
        title: notebooks.title,
        content: notebooks.content,
        createdAt: notebooks.createdAt,
        updatedAt: notebooks.updatedAt,
        embedding: notebooks.embedding,
      })
      .from(notebooks)
      .where(
        sql`${notebooks.userId} = ${userId} AND ${notebooks.embedding} IS NOT NULL`
      );

    // Apply date filters if provided
    if (startDate) {
      dbQuery = dbQuery.where(sql`${notebooks.createdAt} >= ${startDate.getTime()}`);
    }
    if (endDate) {
      dbQuery = dbQuery.where(sql`${notebooks.createdAt} <= ${endDate.getTime()}`);
    }

    const results = await dbQuery;

    // Calculate similarity for each notebook
    const scoredResults = results
      .map(notebook => {
        const embedding = notebook.embedding;
        if (!embedding || !Array.isArray(embedding)) return null;

        // Use our improved similarity calculation
        const similarity = calculateSimilarity(queryEmbedding, embedding);
        
        // Add content relevance by checking if the query appears in the notebook
        const queryLower = query.toLowerCase();
        const titleLower = notebook.title.toLowerCase();
        const contentLower = (notebook.content || '').toLowerCase();
        
        // Check if query terms are in the content
        const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
        let termMatches = 0;
        for (const term of queryTerms) {
          if (titleLower.includes(term) || contentLower.includes(term)) {
            termMatches++;
          }
        }
        
        // Calculate a text match score (0-1)
        const textMatchScore = queryTerms.length > 0 ? termMatches / queryTerms.length : 0;
        
        // Combine vector similarity with text matching (weighted)
        const combinedScore = similarity * 0.7 + textMatchScore * 0.3;
        
        return {
          ...notebook,
          similarity: combinedScore,
          vectorSimilarity: similarity,
          textMatchScore
        };
      })
      .filter(result => result !== null && result.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scoredResults;
  } catch (error) {
    console.error('Error searching notebooks by vector:', error);
    throw error;
  }
}
