import { NextResponse } from "next/server";
import { auth } from "@/auth";
import NotebookService from "@/lib/notebook-service-drizzle";
import { searchNotebooksByVector } from "@/lib/vectorSearch";
import { generateAndSaveEmbedding, generateAllEmbeddings } from "@/lib/generateEmbeddings";
import { generateChatResponse } from "@/lib/aiChat";

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
    
    console.log(`Processing chat query: "${message}" for user: ${session.user.id}`);
    console.log(`Date range filter: ${dateRange ? 'Active' : 'Inactive'}`);
    
    // Start timing the request
    const startTime = Date.now();

    // Prepare search options with date range if provided
    const searchOptions = {};
    if (dateRange) {
      if (dateRange.startDate) {
        searchOptions.startDate = new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        searchOptions.endDate = new Date(dateRange.endDate);
      }
    }

    // Use vector search to find relevant notebooks
    let searchResults = [];
    try {
      searchResults = await searchNotebooksByVector(
        message, 
        session.user.id, 
        {
          ...searchOptions,
          limit: 5, // Limit to top 5 most relevant results
          similarityThreshold: 0.5 // Lower threshold to get more results
        }
      );
    } catch (searchError) {
      console.error("Error searching notebooks by vector:", searchError);
      // Log detailed error information for debugging
      console.log("Search error details:", {
        query: message,
        userId: session.user.id,
        options: searchOptions,
        errorMessage: searchError.message
      });
      // Continue with empty results instead of failing completely
    }

    // If no results with vector search, try to fetch some recent notebooks as fallback
    let fallbackUsed = false;
    let notebooks = searchResults;

    if (searchResults.length === 0) {
      fallbackUsed = true;
      // Get some recent notebooks as fallback
      const result = await NotebookService.getUserNotebooks(session.user.id, 1, 5);
      notebooks = result.notebooks || [];
    }

    // Generate AI response using relevant notebooks
    const aiResponse = await generateChatResponse(message, notebooks);
    let entries = [];
    let responseMessage = aiResponse;
    
    if (searchResults.length > 0) {
      entries = searchResults.map(notebook => ({
        id: notebook.id,
        title: notebook.title,
        date: notebook.createdAt,
        excerpt: notebook.content?.substring(0, 150) + "...",
        hasImage: notebook.content?.includes("![") || false, // Simple check for markdown images
        similarity: notebook.similarity ? Math.round(notebook.similarity * 100) : null
      }));
    } else if (fallbackUsed) {
      responseMessage = aiResponse + "\n\nI couldn't find entries specifically matching your query, so I'm showing your most recent entries instead.";
    } else {
      responseMessage = "I couldn't find any entries matching your query. Try a different search term or date range.";
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`Chat request processed in ${processingTime}ms`);
    
    // Log analytics data (in a real app this would go to a database)
    try {
      console.log('Chat Analytics:', {
        userId: session.user.id,
        query: message,
        responseTime: processingTime,
        resultCount: entries.length,
        usedFallback: fallbackUsed,
        hasDateFilter: !!dateRange,
        timestamp: new Date().toISOString()
      });
    } catch (analyticsError) {
      console.error('Error logging analytics:', analyticsError);
      // Non-blocking - don't affect the user response
    }
    
    return NextResponse.json({
      message: responseMessage,
      entries: entries,
      query: message,
      dateRange: dateRange || null,
      usedFallback: fallbackUsed,
      processingTime: `${processingTime}ms`
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
