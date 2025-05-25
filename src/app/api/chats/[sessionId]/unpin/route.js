import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

import { chatService } from '@/lib/chat-service';

// Handle unpin request
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { sessionId } = params;
    
    // Get the current session to check if it's already unpinned
    const chatSession = await chatService.getSession(sessionId, session.user.id);
    
    // If it's already unpinned, no need to update
    if (!chatSession.isPinned) {
      return NextResponse.json(chatSession);
    }
    
    // Otherwise, update to unpinned
    const updatedSession = await chatService.updateSession(
      sessionId, 
      { isPinned: 0 },
      session.user.id
    );
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error unpinning chat session:', error);
    
    if (error.message === 'Session not found or unauthorized') {
      return NextResponse.json(
        { error: 'Session not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to unpin chat session' },
      { status: 500 }
    );
  }
}
