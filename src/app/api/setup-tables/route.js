import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { auth } from "@/auth";

// Create a direct Turso client
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export async function GET(request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For security, you might want to restrict this to specific users
    // This is a simple check - in production, you'd have a proper admin role system
    if (session.user.email !== "shaswatraj3@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the newsletter_subscriptions table if it doesn't exist
    await tursoClient.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1 NOT NULL
      )
    `);

    // Create the feedback table if it doesn't exist
    await tursoClient.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        rating INTEGER,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create the contact_messages table if it doesn't exist
    await tursoClient.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new' NOT NULL,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    return NextResponse.json({ 
      message: "Tables created successfully",
      tables: ["newsletter_subscriptions", "feedback", "contact_messages"]
    });
  } catch (error) {
    console.error("Error creating tables:", error);
    return NextResponse.json({ 
      error: "Failed to create tables",
      details: error.message
    }, { status: 500 });
  }
}
