'use server';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateAndSaveEmbedding } from '@/lib/generateEmbeddings';

/**
 * POST /api/notebooks/:id/embeddings
 * Generate or regenerate embeddings for a specific notebook
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    // Get the user session
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the notebook exists and belongs to the user
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(
        eq(notebooks.id, id)
      );

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    if (notebook.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate and save the embedding
    const success = await generateAndSaveEmbedding(id);

    if (success) {
      return NextResponse.json({
        message: 'Embedding generated successfully',
        notebookId: id
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to generate embedding' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/notebooks/:id/embeddings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notebooks/:id/embeddings
 * Delete embeddings for a specific notebook
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    // Get the user session
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the notebook exists and belongs to the user
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(
        eq(notebooks.id, id)
      );

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    if (notebook.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Clear the embedding from the notebook
    await db.update(notebooks)
      .set({ embedding: null })
      .where(eq(notebooks.id, id));

    return NextResponse.json({
      message: 'Embedding deleted successfully',
      notebookId: id
    });
  } catch (error) {
    console.error('Error in DELETE /api/notebooks/:id/embeddings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
