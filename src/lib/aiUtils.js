/**
 * Utility file for managing AI operations like embeddings
 */
import { generateAndSaveEmbedding } from './generateEmbeddings';

/**
 * Queue for processing notebook embedding updates
 */
const embeddingQueue = [];
let isProcessing = false;

/**
 * Add a notebook to the embedding update queue
 * @param {string} notebookId - ID of the notebook to process
 */
export function queueEmbeddingUpdate(notebookId) {
  // Skip if already in queue
  if (embeddingQueue.includes(notebookId)) {
    return;
  }
  
  console.log(`Queueing notebook ${notebookId} for embedding update`);
  embeddingQueue.push(notebookId);
  
  // Start processing if not already
  if (!isProcessing) {
    processEmbeddingQueue();
  }
}

/**
 * Process the embedding queue asynchronously
 */
async function processEmbeddingQueue() {
  if (embeddingQueue.length === 0 || isProcessing) {
    return;
  }
  
  isProcessing = true;
  
  try {
    // Get the next notebook ID from the queue
    const notebookId = embeddingQueue.shift();
    
    console.log(`Processing embedding for notebook ${notebookId}`);
    await generateAndSaveEmbedding(notebookId);
    console.log(`Completed embedding for notebook ${notebookId}`);
  } catch (error) {
    console.error('Error processing embedding queue:', error);
  } finally {
    isProcessing = false;
    
    // Continue processing if there are more items
    if (embeddingQueue.length > 0) {
      processEmbeddingQueue();
    }
  }
}

/**
 * Get the current embedding queue status
 * @returns {Object} Status object with queue information
 */
export function getEmbeddingQueueStatus() {
  return {
    queueLength: embeddingQueue.length,
    isProcessing,
    pendingIds: [...embeddingQueue]
  };
}
