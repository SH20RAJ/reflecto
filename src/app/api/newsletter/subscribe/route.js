import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required" 
      }, { status: 400 });
    }

    // Check if the email is already subscribed
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);

    if (existingSubscription.length > 0) {
      // If already subscribed but inactive, reactivate
      if (!existingSubscription[0].active) {
        await db
          .update(newsletterSubscriptions)
          .set({ active: 1 })
          .where(eq(newsletterSubscriptions.email, email));

        return NextResponse.json({ 
          message: "Your subscription has been reactivated",
          status: "reactivated"
        });
      }

      // Already subscribed and active
      return NextResponse.json({ 
        message: "You are already subscribed to our newsletter",
        status: "already_subscribed"
      });
    }

    // Create a new subscription
    await db.insert(newsletterSubscriptions).values({
      email,
      name: name || null,
      active: 1
    });

    return NextResponse.json({ 
      message: "Thank you for subscribing to our newsletter!",
      status: "subscribed"
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json({ 
      error: "Failed to subscribe to newsletter",
      details: error.message
    }, { status: 500 });
  }
}
