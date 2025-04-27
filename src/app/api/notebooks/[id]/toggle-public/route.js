import { NextResponse } from "next/server";
import { db } from "@/db";
import { notebooks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * Toggle a notebook's public status
 */
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({
        error: "You must be signed in to update a notebook"
      }, { status: 401 });
    }

    const { id } = params;

    // Check if the notebook exists and belongs to the user, but only select specific fields
    // to avoid issues with invalid code points in the content field
    const notebook = await db
      .select({
        id: notebooks.id,
        userId: notebooks.userId,
        isPublic: notebooks.isPublic,
        title: notebooks.title,
        createdAt: notebooks.createdAt,
        updatedAt: notebooks.updatedAt
      })
      .from(notebooks)
      .where(and(
        eq(notebooks.id, id),
        eq(notebooks.userId, session.user.id)
      ))
      .then(res => res[0] || null);

    if (!notebook) {
      return NextResponse.json({
        error: "Notebook not found or you don't have permission to update it"
      }, { status: 404 });
    }

    // Toggle the isPublic status
    const newIsPublic = notebook.isPublic ? 0 : 1;

    // Update the notebook
    await db
      .update(notebooks)
      .set({
        isPublic: newIsPublic,
        updatedAt: new Date()
      })
      .where(eq(notebooks.id, id));

    return NextResponse.json({
      message: `Notebook is now ${newIsPublic ? 'public' : 'private'}`,
      isPublic: !!newIsPublic
    });
  } catch (error) {
    console.error("Error toggling notebook public status:", error);

    // Provide more specific error message for invalid code point errors
    if (error instanceof RangeError && error.message.includes('Invalid code point')) {
      return NextResponse.json({
        error: 'Data encoding error detected. The system is attempting to fix this issue. Please try again.',
        details: 'Invalid character in notebook content'
      }, { status: 500 });
    }

    return NextResponse.json({
      error: "Failed to update notebook",
      details: error.message
    }, { status: 500 });
  }
}
