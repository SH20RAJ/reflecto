import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

import { chatService } from '@/lib/chat-service';

// Handle archive request
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
    
    const updatedSession = await chatService.archiveSession(sessionId, session.user.id);
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error archiving chat session:', error);
    
    if (error.message === 'Session not found or unauthorized') {
      return NextResponse.json(
        { error: 'Session not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to archive chat session' },
      { status: 500 }
    );
  }
}
