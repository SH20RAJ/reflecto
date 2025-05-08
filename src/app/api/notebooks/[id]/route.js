import { NextResponse } from 'next/server';

import { auth } from "@/auth";
import NotebookService from '@/lib/notebook-service-drizzle';

/**
 * GET /api/notebooks/[id]
 * Get a notebook by ID
 */
export async function GET(request, context) {
  try {
    // Get the params and unwrap them
    const params = await context.params;

    // Get the user session
    const session = await auth()

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the notebook ID from the URL
    const id = params.id;

    // Get the notebook with error handling
    let notebook;
    try {
      notebook = await NotebookService.getNotebookById(id, session.user.id);
    } catch (error) {
      console.error(`Error fetching notebook ${id}:`, error);

      // If it's a ReferenceError for sanitizeContent, we need to return a helpful error
      if (error instanceof ReferenceError && error.message.includes('sanitizeContent')) {
        return NextResponse.json({
          error: 'Application configuration error. Please try again later.',
          details: 'Function reference error'
        }, { status: 500 });
      }

      // For other errors, return a generic error
      return NextResponse.json({ error: 'Error fetching notebook' }, { status: 500 });
    }

    // Check if the notebook exists
    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error(`Error in GET /api/notebooks/[id]:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/notebooks/[id]
 * Update a notebook
 */
export async function PUT(request, context) {
  try {
    // Get the params and unwrap them
    const params = await context.params;

    // Get the user session
    const session = await auth()

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the notebook ID from the URL
    const id = params.id;

    // Get the request body
    const data = await request.json();

    // Validate the request body
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Update the notebook
    const notebook = await NotebookService.updateNotebook(id, {
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      isPublic: data.isPublic !== undefined ? data.isPublic : undefined, // Only update if provided
    }, session.user.id);

    // Check if the notebook exists
    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error(`Error in PUT /api/notebooks/[id]:`, error);

    // Provide more specific error message for invalid code point errors
    if (error instanceof RangeError && error.message.includes('Invalid code point')) {
      return NextResponse.json({
        error: 'Data encoding error detected. The system is attempting to fix this issue. Please try again.',
        details: 'Invalid character in notebook content'
      }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/notebooks/[id]
 * Delete a notebook
 */
export async function DELETE(request, context) {
  try {
    console.log('DELETE request received for notebook');

    // Get the params and unwrap them
    const params = await context.params;
    console.log('Params:', params);

    // Get the user session
    const session = await auth();
    console.log('Session user:', session?.user?.id);

    // Check if the user is authenticated
    if (!session || !session.user) {
      console.error('Unauthorized delete attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the notebook ID from the URL
    const id = params.id;
    console.log('Attempting to delete notebook with ID:', id);

    if (!id) {
      console.error('No notebook ID provided');
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    try {
      // Delete the notebook
      console.log('Calling NotebookService.deleteNotebook with ID:', id, 'and user ID:', session.user.id);
      const success = await NotebookService.deleteNotebook(id, session.user.id);
      console.log('Delete operation result:', success);

      // Check if the notebook exists
      if (!success) {
        console.error('Notebook not found or not owned by user');
        return NextResponse.json({ error: 'Notebook not found or not owned by user' }, { status: 404 });
      }

      console.log('Notebook deleted successfully');
      return NextResponse.json({ success: true });
    } catch (serviceError) {
      console.error('Error in NotebookService.deleteNotebook:', serviceError);
      return NextResponse.json({
        error: 'Error deleting notebook',
        details: serviceError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error in DELETE /api/notebooks/[id]:`, error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}
