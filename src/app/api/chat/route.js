import { NextResponse } from "next/server";
import { auth } from "@/auth";
import NotebookService from "@/lib/notebook-service-drizzle";

export async function POST(request) {
  try {
    // Get the user session
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { message, dateRange } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get the user's notebooks
    let notebooks;
    
    if (dateRange) {
      // If date range is provided, filter notebooks by date
      const { startDate, endDate } = dateRange;
      notebooks = await NotebookService.getNotebooksByDateRange(
        session.user.id,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );
    } else {
      // Otherwise, get all notebooks
      const result = await NotebookService.getUserNotebooks(session.user.id, 1, 100);
      notebooks = result.notebooks;
    }

    // For now, we'll implement a simple search function
    // In a real implementation, you would use vector embeddings and LangChain
    const searchResults = notebooks.filter(notebook => {
      const content = notebook.content?.toLowerCase() || "";
      const title = notebook.title?.toLowerCase() || "";
      const searchTerm = message.toLowerCase();
      
      return content.includes(searchTerm) || title.includes(searchTerm);
    });

    // Format the response
    let responseMessage;
    let entries = [];
    
    if (searchResults.length > 0) {
      responseMessage = `I found ${searchResults.length} entries that match your query:`;
      
      entries = searchResults.map(notebook => ({
        id: notebook.id,
        title: notebook.title,
        date: notebook.createdAt,
        excerpt: notebook.content?.substring(0, 150) + "...",
        hasImage: notebook.content?.includes("![") || false, // Simple check for markdown images
      }));
    } else {
      responseMessage = "I couldn't find any entries matching your query. Try a different search term or date range.";
    }

    return NextResponse.json({
      message: responseMessage,
      entries: entries,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
