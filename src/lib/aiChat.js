/**
 * Service for generating AI responses using Cloudflare AI
 */

// Cloudflare API credentials
const CLOUDFLARE_ACCOUNT_ID = "091539408595ba99a0ef106d42391d5b";
const CLOUDFLARE_AUTH_TOKEN = "zdOYsqUJk_c7BKC_X0eHfxNlPp91pwNBLE2BG9fl";

/**
 * Generate a response using Cloudflare's Llama 3.3 model
 * @param {Array<Object>} messages - The conversation history
 * @returns {Promise<string>} - The AI-generated response
 */
export async function generateAIResponse(messages) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to generate AI response: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    // Handle different response structures from Cloudflare API
    if (data.result) {
      // Most common format: data.result.response
      if (data.result.response) {
        return data.result.response;
      }
      
      // Alternative format: data.result directly contains the text
      if (typeof data.result === 'string') {
        return data.result;
      }
      
      // Another possible format where response is in a different field
      if (data.result.text) {
        return data.result.text;
      }
      
      // Try to find any string field that might contain the response
      for (const key in data.result) {
        if (typeof data.result[key] === 'string' && data.result[key].length > 20) {
          return data.result[key]; // Return the first lengthy string field
        }
      }
    }
    
    throw new Error(`Invalid response from Cloudflare AI API: ${JSON.stringify(data)}`);
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Generate an AI response to a user's question based on their notebook entries
 * @param {string} query - The user's question
 * @param {Array<Object>} relevantNotebooks - The most relevant notebook entries
 * @returns {Promise<string>} - The AI-generated response
 */
export async function generateChatResponse(query, relevantNotebooks) {
  try {
    // Format the context from relevant notebooks
    let context = '';
    
    if (relevantNotebooks && relevantNotebooks.length > 0) {
      // Sort by similarity if available, otherwise by date
      const sortedNotebooks = [...relevantNotebooks].sort((a, b) => {
        if (a.similarity !== undefined && b.similarity !== undefined) {
          return b.similarity - a.similarity;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      context = sortedNotebooks.map((notebook, index) => {
        const date = new Date(notebook.createdAt).toLocaleDateString();
        const similarityScore = notebook.similarity ? ` (Relevance: ${Math.round(notebook.similarity * 100)}%)` : '';
        const excerpt = notebook.content.substring(0, 500) + (notebook.content.length > 500 ? '...' : '');
        return `Entry ${index + 1} (${date})${similarityScore} - ${notebook.title}:\n${excerpt}`;
      }).join('\n\n');
    } else {
      context = 'No relevant entries found in your notebooks.';
    }

    // Create the message array for the AI model
    const messages = [
      {
        role: 'system',
        content: `You are a helpful personal AI assistant for Reflecto, an app that helps users journal their memories and thoughts.
Your goal is to provide thoughtful, accurate, and insightful responses based on the user's notebook entries.

CONTEXT INFORMATION:
The following are the most relevant journal entries from the user's notebooks based on their query:
${context}

INSTRUCTIONS:
1. Answer queries based ONLY on the notebook entries provided in the context.
2. If asked about information not in the provided entries, politely explain you don't have that information.
3. Format your responses in a conversational, friendly tone.
4. When quoting or referencing specific entries, mention the entry number and date.
5. Provide insightful observations about patterns, emotions or themes you notice across entries when relevant.
6. Limit responses to 3-4 paragraphs maximum for readability.
7. Use markdown formatting to make your response more readable (bold for emphasis, lists for multiple points).
8. When appropriate, suggest related questions the user might want to ask based on the context.
9. If the entries contain dates, times, people, or places, try to highlight these key details in your response.
10. Maintain the user's privacy and confidentiality at all times - this is their personal journal data.`
      },
      {
        role: 'user',
        content: query
      }
    ];

    // Generate the response
    const aiResponse = await generateAIResponse(messages);
    
    // Check if the response indicates no information was found
    if (aiResponse.toLowerCase().includes("don't have that information") || 
        aiResponse.toLowerCase().includes("couldn't find") || 
        aiResponse.toLowerCase().includes("no entries") || 
        aiResponse.toLowerCase().includes("no information")) {
      console.log('AI indicated lack of information, adding suggestion for better queries');
      return aiResponse + '\n\nTry asking about something more specific or try a different date range if you applied a filter.';
    }
    
    return aiResponse;
  } catch (error) {
    console.error('Error generating chat response:', error);
    
    // Provide a friendly fallback response
    return "I'm sorry, I encountered a problem while processing your request. Please try again or ask a different question.";
  }
}
