import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { newsletterSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/newsletter
 * Subscribe to the newsletter
 */
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate the request body
    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if the email is already subscribed
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, data.email))
      .limit(1);

    if (existingSubscription.length > 0) {
      // If the subscription exists but is inactive, reactivate it
      if (!existingSubscription[0].active) {
        await db
          .update(newsletterSubscriptions)
          .set({ active: 1 })
          .where(eq(newsletterSubscriptions.id, existingSubscription[0].id));
        
        return NextResponse.json({ 
          message: 'Your subscription has been reactivated',
          success: true 
        });
      }
      
      // If already active, just return success
      return NextResponse.json({ 
        message: 'You are already subscribed to our newsletter',
        success: true 
      });
    }

    // Insert the new subscription
    await db.insert(newsletterSubscriptions).values({
      email: data.email,
      name: data.name || null,
      active: 1
    });

    return NextResponse.json({ 
      message: 'Thank you for subscribing to our newsletter!',
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/newsletter:', error);
    return NextResponse.json({ 
      error: 'Failed to subscribe to the newsletter',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/newsletter
 * Unsubscribe from the newsletter
 */
export async function DELETE(request) {
  try {
    const data = await request.json();

    // Validate the request body
    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the subscription
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, data.email))
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json({ 
        error: 'Subscription not found',
        success: false 
      }, { status: 404 });
    }

    // Update the subscription to inactive
    await db
      .update(newsletterSubscriptions)
      .set({ active: 0 })
      .where(eq(newsletterSubscriptions.id, subscription[0].id));

    return NextResponse.json({ 
      message: 'You have been unsubscribed from our newsletter',
      success: true 
    });
  } catch (error) {
    console.error('Error in DELETE /api/newsletter:', error);
    return NextResponse.json({ 
      error: 'Failed to unsubscribe from the newsletter',
      details: error.message 
    }, { status: 500 });
  }
}
