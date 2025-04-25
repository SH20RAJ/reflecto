import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required" 
      }, { status: 400 });
    }

    // Check if the email is subscribed
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);

    if (existingSubscription.length === 0) {
      return NextResponse.json({ 
        message: "This email is not subscribed to our newsletter",
        status: "not_subscribed"
      });
    }

    // Update the subscription to inactive
    await db
      .update(newsletterSubscriptions)
      .set({ active: 0 })
      .where(eq(newsletterSubscriptions.email, email));

    return NextResponse.json({ 
      message: "You have been unsubscribed from our newsletter",
      status: "unsubscribed"
    });
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return NextResponse.json({ 
      error: "Failed to unsubscribe from newsletter",
      details: error.message
    }, { status: 500 });
  }
}
