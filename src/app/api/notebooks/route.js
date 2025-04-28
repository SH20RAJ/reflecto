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
    try {
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
    } catch (error) {
      console.error('Error fetching notebooks:', error);

      // Return a fallback result with empty notebooks
      result = {
        notebooks: [],
        pagination: {
          page,
          limit: safeLimit,
          totalCount: 0,
          totalPages: 0,
          hasMore: false,
          hasPrevious: page > 1
        }
      };
    }

    console.log('API result:', {
      notebooksCount: result?.notebooks?.length || 0,
      pagination: result?.pagination
    });

    // Debug log the first notebook's tags if available
    if (result?.notebooks?.length > 0 && result.notebooks[0].tags) {
      console.log('First notebook tags:', JSON.stringify(result.notebooks[0].tags, null, 2));
    }

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

    // Provide more specific error messages based on the error type
    if (error.message && error.message.includes('embedding')) {
      return NextResponse.json({
        error: 'Database schema issue detected. Please try again or contact support.',
        details: 'Missing embedding column in database',
        suggestion: 'Admin can fix this by visiting /api/setup-tables/add-embedding-column'
      }, { status: 500 });
    }

    if (error.message && error.message.includes('execute is not a function')) {
      return NextResponse.json({
        error: 'Database method compatibility issue detected.',
        details: 'The application is trying to use a method that is not available in the current database configuration.',
        suggestion: 'Please try again. The system will attempt to use an alternative method.'
      }, { status: 500 });
    }

    if (error.message && error.message.includes('run')) {
      return NextResponse.json({
        error: 'Database operation failed.',
        details: 'The system encountered an issue while trying to create your notebook.',
        suggestion: 'Please try again with a simpler title or content.'
      }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
