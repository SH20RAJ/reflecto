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

    // Provide more specific error message for invalid code point errors
    if (error instanceof RangeError && error.message.includes('Invalid code point')) {
      return NextResponse.json({
        error: 'Data encoding error detected. The system is attempting to fix this issue. Please try again.',
        details: 'Invalid character in notebook content'
      }, { status: 500 });
    }

    // If it's a ReferenceError for sanitizeContent, we need to return a helpful error
    if (error instanceof ReferenceError && error.message.includes('sanitizeContent')) {
      return NextResponse.json({
        error: 'Application configuration error. Please try again later.',
        details: 'Function reference error'
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Failed to fetch public notebooks',
      details: error.message
    }, { status: 500 });
  }
}
