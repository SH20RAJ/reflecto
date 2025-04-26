import { NextResponse } from 'next/server';
import { NotebookService } from '@/lib/notebook-service-drizzle';

/**
 * GET /api/notebooks/public
 * Get public notebooks with pagination
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const result = await NotebookService.getPublicNotebooks(page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/notebooks/public:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch public notebooks',
      details: error.message 
    }, { status: 500 });
  }
}
