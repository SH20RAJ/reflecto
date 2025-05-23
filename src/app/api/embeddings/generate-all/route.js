'use server';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateAllEmbeddings } from '@/lib/generateEmbeddings';

/**
 * POST /api/embeddings/generate-all
 * Generate embeddings for all notebooks
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

    // Start the embedding generation process
    // This is run in the background and doesn't block the response
    const generatePromise = generateAllEmbeddings()
      .then(result => {
        console.log('Embedding generation completed:', result);
      })
      .catch(error => {
        console.error('Error generating embeddings:', error);
      });

    // Return immediate response while the process continues in the background
    return NextResponse.json({ 
      message: 'Embedding generation started', 
      status: 'processing'
    });
  } catch (error) {
    console.error('Error in POST /api/embeddings/generate-all:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
