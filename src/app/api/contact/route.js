import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { contactMessages } from '@/db/schema';
import { auth } from '@/auth';

/**
 * POST /api/contact
 * Submit a contact message
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const session = await auth();

    // Validate the request body
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!data.message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Insert the contact message
    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      status: 'new',
      userId: session?.user?.id || null
    });

    return NextResponse.json({ 
      message: 'Your message has been sent. We will get back to you soon!',
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/contact:', error);
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error.message 
    }, { status: 500 });
  }
}
