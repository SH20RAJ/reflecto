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
      similarityThreshold = 0.3 // Lower threshold to get more results
    } = options;

    // Generate embedding for the query
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (embeddingError) {
      console.error('Error generating query embedding:', embeddingError);
      queryEmbedding = null;
    }

    // Prepare query for notebooks - handle schema migration issues gracefully
    let dbQuery;
    
    try {
      // First attempt: Try to query with embedding column
      dbQuery = db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          content: notebooks.content,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(
          sql`${notebooks.userId} = ${userId}`
        );
    } catch (err) {
      console.warn('Error with embedding column, falling back to basic query:', err);
      // Fallback: If embedding column doesn't exist yet, query without it
      dbQuery = db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          content: notebooks.content,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(
          sql`${notebooks.userId} = ${userId}`
        );
    }

    // Apply date filters if provided
    if (startDate) {
      dbQuery = dbQuery.where(sql`${notebooks.createdAt} >= ${startDate.getTime()}`);
    }
    if (endDate) {
      dbQuery = dbQuery.where(sql`${notebooks.createdAt} <= ${endDate.getTime()}`);
    }

    const results = await dbQuery;

    // If we don't have a query embedding, use text search instead
    if (!queryEmbedding) {
      console.log('No query embedding available, using text-based search only');
      return results
        .map(notebook => {
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
          
          return {
            ...notebook,
            similarity: textMatchScore * 100, // Scale to percentage for display
            textMatchScore: textMatchScore * 100
          };
        })
        .filter(result => result.similarity > 0) // Only return results with some match
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    }

    // Calculate similarity for each notebook
    const scoredResults = results
      .map(notebook => {
        // Handle different embedding formats
        let embedding;
        try {
          if (!notebook.embedding) {
            // No embedding, use text match only
            const queryLower = query.toLowerCase();
            const titleLower = notebook.title.toLowerCase();
            const contentLower = (notebook.content || '').toLowerCase();
            
            // Check if query appears in title or content
            const hasExactMatch = titleLower.includes(queryLower) || contentLower.includes(queryLower);
            
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
            
            return {
              ...notebook,
              similarity: textMatchScore * 100, // Scale to percentage for display
              textMatchScore: textMatchScore * 100,
              hasExactMatch,
              noEmbedding: true
            };
          }
          
          // Handle case where embedding is stored as string
          if (typeof notebook.embedding === 'string') {
            embedding = JSON.parse(notebook.embedding);
          } else if (Array.isArray(notebook.embedding)) {
            embedding = notebook.embedding;
          } else if (notebook.embedding && typeof notebook.embedding === 'object') {
            // Handle other object formats that might contain the embedding
            const values = Object.values(notebook.embedding);
            if (Array.isArray(values[0])) {
              embedding = values[0];
            } else {
              embedding = values;
            }
          } else {
            console.warn('Unknown embedding format:', typeof notebook.embedding);
            return null;
          }
          
          if (!Array.isArray(embedding)) {
            console.warn('Parsed embedding is not an array');
            return null;
          }
        } catch (err) {
          console.error('Error parsing embedding:', err);
          return null;
        }

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
