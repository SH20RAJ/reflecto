import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

import { chatService } from '@/lib/chat-service';
import { getAIResponse } from '@/lib/ai'; // You'll need to create or adapt this

export async function POST(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { sessionId } = params;
    
    // Get the most recent user message from the chat session
    const messages = await chatService.getMessages(sessionId, session.user.id);
    
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found in the session' },
        { status: 400 }
      );
    }
    
    // Get AI response for the messages
    // You'll need to implement the getAIResponse function in your AI lib
    const aiResponse = await getAIResponse(messages);
    
    // Save the AI response to the database
    const savedMessage = await chatService.addMessage({
      chatSessionId: sessionId,
      role: 'assistant',
      content: aiResponse.content,
      userId: session.user.id,
      metadata: aiResponse.metadata || {},
      tokenCount: aiResponse.tokenCount || 0
    });
    
    return NextResponse.json(savedMessage);
  } catch (error) {
    console.error('Error processing AI response:', error);
    return NextResponse.json(
      { error: 'Failed to process AI response' },
      { status: 500 }
    );
  }
}
