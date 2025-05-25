import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

import { chatService } from '@/lib/chat-service';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const sortBy = searchParams.get('sortBy') || 'lastMessageAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    const options = {
      page,
      limit,
      includeArchived,
      sortBy,
      sortDirection
    };

    // Get user's chat sessions
    const result = await chatService.getUserSessions(session.user.id, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Create new chat session
    const newSession = await chatService.createSession({
      userId: session.user.id,
      title: data.title,
      notebookId: data.notebookId,
      personality: data.personality || 'friendly'
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}
