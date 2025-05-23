import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEmbeddingQueueStatus } from '@/lib/aiUtils';

/**
 * GET /api/embeddings/status
 * Get the status of the embedding generation queue
 * Allows admin users to monitor embedding generation
 */
export async function GET(request) {
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

    // Get the current queue status
    const status = getEmbeddingQueueStatus();

    return NextResponse.json({
      status: 'success',
      data: {
        ...status,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in GET /api/embeddings/status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
