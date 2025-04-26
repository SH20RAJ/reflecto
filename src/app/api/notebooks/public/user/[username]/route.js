import { NextResponse } from 'next/server';
import { NotebookService } from '@/lib/notebook-service-drizzle';

/**
 * GET /api/notebooks/public/user/[username]
 * Get public notebooks by username with pagination
 */
export async function GET(request, { params }) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const result = await NotebookService.getPublicNotebooksByUsername(username, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in GET /api/notebooks/public/user/${params.username}:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch public notebooks by username',
      details: error.message 
    }, { status: 500 });
  }
}
