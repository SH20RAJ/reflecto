import { NextResponse } from 'next/server';
import { NotebookService } from '@/lib/notebook-service-drizzle';

/**
 * GET /api/notebooks/public/[id]
 * Get a public notebook by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const notebook = await NotebookService.getPublicNotebookById(id);
    
    if (!notebook) {
      return NextResponse.json({ 
        error: 'Notebook not found or not public' 
      }, { status: 404 });
    }
    
    return NextResponse.json(notebook);
  } catch (error) {
    console.error(`Error in GET /api/notebooks/public/${params.id}:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch public notebook',
      details: error.message 
    }, { status: 500 });
  }
}
