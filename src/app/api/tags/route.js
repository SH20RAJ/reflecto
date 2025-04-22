import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { NotebookService } from '@/lib/notebook-service-drizzle';

/**
 * GET /api/tags
 * Get all tags for the authenticated user
 */
export async function GET(request) {
  try {
    // Get the user session
    const session = await auth()

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tags for the user
    const tags = await NotebookService.getUserTags(session.user.id);

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error in GET /api/tags:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
