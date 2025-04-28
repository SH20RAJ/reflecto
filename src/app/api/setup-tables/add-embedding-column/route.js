import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, executeRawSQL } from "@/db";

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

    // Check if the embedding column exists
    let embeddingColumnExists = false;

    try {
      // Try to query using the embedding column
      const result = await executeRawSQL("PRAGMA table_info(notebooks)");

      if (result && result.rows) {
        const columns = result.rows;
        embeddingColumnExists = columns.some(col => col.name === 'embedding');
      }

      if (embeddingColumnExists) {
        return NextResponse.json({
          message: "Embedding column already exists",
          status: "no_action_needed"
        });
      }
    } catch (error) {
      console.warn("Error checking for embedding column:", error);
      // Continue with the migration attempt even if the check fails
    }

    // Add the embedding column if it doesn't exist
    try {
      // Use executeRawSQL to execute the ALTER TABLE statement
      await executeRawSQL("ALTER TABLE notebooks ADD COLUMN embedding BLOB");

      // Verify the column was added successfully
      const verifyResult = await executeRawSQL("PRAGMA table_info(notebooks)");

      let embeddingColumnAdded = false;
      if (verifyResult && verifyResult.rows) {
        const columnsAfter = verifyResult.rows;
        embeddingColumnAdded = columnsAfter.some(col => col.name === 'embedding');
      }

      if (!embeddingColumnAdded) {
        return NextResponse.json({
          error: "Failed to add embedding column",
          details: "Column was not found after attempted addition",
          suggestion: "Check database permissions or try a different approach"
        }, { status: 500 });
      }
    } catch (error) {
      console.error("Error executing ALTER TABLE:", error);

      // Try an alternative approach using direct SQL
      try {
        // Create a backup of the table
        await executeRawSQL(`
          CREATE TABLE notebooks_backup AS
          SELECT id, title, content, user_id, is_public, created_at, updated_at
          FROM notebooks
        `);

        // Create a new table with the embedding column
        await executeRawSQL(`
          CREATE TABLE notebooks_new (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            user_id TEXT NOT NULL,
            is_public INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
            updated_at INTEGER DEFAULT CURRENT_TIMESTAMP,
            embedding BLOB
          )
        `);

        // Copy data from backup to new table
        await executeRawSQL(`
          INSERT INTO notebooks_new (id, title, content, user_id, is_public, created_at, updated_at)
          SELECT id, title, content, user_id, is_public, created_at, updated_at
          FROM notebooks_backup
        `);

        // Drop the old table
        await executeRawSQL("DROP TABLE notebooks");

        // Rename the new table
        await executeRawSQL("ALTER TABLE notebooks_new RENAME TO notebooks");

        // Verify the column was added successfully
        const verifyResult = await executeRawSQL("PRAGMA table_info(notebooks)");

        let embeddingColumnAdded = false;
        if (verifyResult && verifyResult.rows) {
          const columnsAfter = verifyResult.rows;
          embeddingColumnAdded = columnsAfter.some(col => col.name === 'embedding');
        }

        if (!embeddingColumnAdded) {
          return NextResponse.json({
            error: "Failed to add embedding column using alternative method",
            details: "Column was not found after table recreation"
          }, { status: 500 });
        }

        return NextResponse.json({
          message: "Embedding column added successfully using table recreation method",
          status: "column_added_alternative"
        });
      } catch (alternativeError) {
        console.error("Error with alternative approach:", alternativeError);
        return NextResponse.json({
          error: "Failed to add embedding column",
          details: error.message,
          alternativeError: alternativeError.message,
          suggestion: "Consider manually updating your database schema"
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: "Embedding column added successfully",
      status: "column_added"
    });
  } catch (error) {
    console.error("Error adding embedding column:", error);
    return NextResponse.json({
      error: "Failed to add embedding column",
      details: error.message
    }, { status: 500 });
  }
}
