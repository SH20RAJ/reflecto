'use server';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queueEmbeddingUpdate } from '@/lib/aiUtils';

/**
 * POST /api/embeddings/generate
 * Generate embeddings for a specific notebook
 * This is an admin-only endpoint
 */
export async function POST(request) {
  try {
    // Get the user session
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a production environment, you would check if the user has admin rights
    // This is a placeholder for demonstration purposes
    /*
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }
    */

    // Parse the request body
    const { notebookId } = await request.json();

    // Validate the request body
    if (!notebookId) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'notebookId is required' 
      }, { status: 400 });
    }

    // Queue the notebook for embedding update
    queueEmbeddingUpdate(notebookId);

    // Return immediate response while the process continues in the background
    return NextResponse.json({ 
      message: `Embedding generation for notebook ${notebookId} added to queue`, 
      status: 'queued'
    });
  } catch (error) {
    console.error('Error in POST /api/embeddings/generate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
