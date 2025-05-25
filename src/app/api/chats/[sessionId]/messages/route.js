import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

import { chatService } from '@/lib/chat-service';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Get messages for chat session
    const messages = await chatService.getSessionMessages(sessionId, session.user.id, { page, limit });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    
    if (error.message === 'Session not found or unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const data = await request.json();
    
    // Verify ownership of the session
    await chatService.getSession(sessionId, session.user.id);
    
    // Add message to chat session
    const newMessage = await chatService.addMessage({
      sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata,
      tokenCount: data.tokenCount
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error adding chat message:', error);
    
    if (error.message === 'Session not found or unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to add chat message' },
      { status: 500 }
    );
  }
}
