import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { feedback } from '@/db/schema';
import { auth } from '@/auth';

/**
 * POST /api/feedback
 * Submit feedback
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const session = await auth();

    // Validate the request body
    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!data.message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Insert the feedback
    await db.insert(feedback).values({
      name: data.name || null,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      rating: data.rating || null,
      userId: session?.user?.id || null
    });

    return NextResponse.json({ 
      message: 'Thank you for your feedback!',
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/feedback:', error);
    return NextResponse.json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    }, { status: 500 });
  }
}
