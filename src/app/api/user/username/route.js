import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * Update the current user's username
 */
export async function PUT(request) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({
        error: "You must be signed in to update your username"
      }, { status: 401 });
    }

    const { username } = await request.json();

    // Validate username
    if (!username) {
      return NextResponse.json({
        error: "Username is required"
      }, { status: 400 });
    }

    // Check if username is valid (alphanumeric, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({
        error: "Username can only contain letters, numbers, underscores, and hyphens"
      }, { status: 400 });
    }

    // Check if username is already taken
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .then(res => res[0] || null);

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({
        error: "Username is already taken"
      }, { status: 409 });
    }

    // Update the user's username
    await db
      .update(users)
      .set({ username })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: "Username updated successfully",
      username
    });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json({
      error: "Failed to update username",
      details: error.message
    }, { status: 500 });
  }
}
