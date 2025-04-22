import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { NotebookService } from '@/lib/notebook-service-drizzle';

/**
 * GET /api/notebooks
 * Get all notebooks for the authenticated user
 */
export async function GET(request) {
  try {
    // Get the user session
    const session = await auth()


    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parameters from the URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const tagId = searchParams.get('tagId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Limit to 40 items per page maximum
    const safeLimit = Math.min(limit, 40);

    // Get notebooks for the user based on parameters
    let result;
    if (query) {
      console.log('Searching notebooks with query:', query);
      result = await NotebookService.searchNotebooks(query, session.user.id, page, safeLimit);
    } else if (tagId) {
      console.log('Getting notebooks by tag:', tagId);
      result = await NotebookService.getNotebooksByTag(tagId, session.user.id, page, safeLimit);
    } else {
      console.log('Getting all notebooks for user:', session.user.id);
      result = await NotebookService.getUserNotebooks(session.user.id, page, safeLimit);
    }

    console.log('API result:', {
      notebooksCount: result?.notebooks?.length || 0,
      pagination: result?.pagination
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/notebooks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/notebooks
 * Create a new notebook
 */
export async function POST(request) {
  try {
    // Get the user session
    const session = await auth()


    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const data = await request.json();

    // Validate the request body
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create the notebook
    const notebook = await NotebookService.createNotebook({
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
    }, session.user.id);

    return NextResponse.json(notebook, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/notebooks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
