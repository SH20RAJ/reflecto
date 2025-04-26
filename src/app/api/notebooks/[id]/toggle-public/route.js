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

    // Check if the notebook exists and belongs to the user
    const notebook = await db
      .select()
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
    return NextResponse.json({
      error: "Failed to update notebook",
      details: error.message
    }, { status: 500 });
  }
}
