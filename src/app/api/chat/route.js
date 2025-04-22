import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the message from the request
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's notebooks
    const userNotebooks = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.userId, session.user.id));

    // Simple keyword-based search for now
    // In a real implementation, you would use a more sophisticated approach
    // like embedding vectors or a proper NLP model
    const keywords = message.toLowerCase().split(/\s+/);
    const relevantNotebooks = userNotebooks.filter(notebook => {
      const content = notebook.content?.toLowerCase() || '';
      const title = notebook.title?.toLowerCase() || '';
      return keywords.some(keyword =>
        content.includes(keyword) || title.includes(keyword)
      );
    });

    // Generate a response based on the found notebooks
    let response;
    if (relevantNotebooks.length > 0) {
      // Format the response with information from the notebooks
      response = `I found ${relevantNotebooks.length} relevant entries in your notebooks:\n\n`;

      relevantNotebooks.forEach((notebook, index) => {
        const date = new Date(notebook.updatedAt).toLocaleDateString();
        response += `${index + 1}. "${notebook.title}" (${date}):\n`;

        // Extract a snippet from the content
        const content = notebook.content || '';
        const snippet = content.length > 150
          ? content.substring(0, 150) + '...'
          : content;

        response += `   ${snippet}\n\n`;
      });
    } else {
      response = "I couldn't find any notebooks matching your query. Try different keywords or check if you have notebooks related to this topic.";
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
