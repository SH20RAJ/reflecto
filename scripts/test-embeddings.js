// In Node.js v18+, fetch is available globally
const CLOUDFLARE_ACCOUNT_ID = "091539408595ba99a0ef106d42391d5b";
const CLOUDFLARE_AUTH_TOKEN = "zdOYsqUJk_c7BKC_X0eHfxNlPp91pwNBLE2BG9fl";

/**
 * Test function for generating embeddings from Cloudflare AI
 */
async function generateEmbedding(text) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: [text] })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to generate embedding: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('API Response Structure:', JSON.stringify(data).slice(0, 300) + '...');
    
    // Handle different response structures from Cloudflare API
    // Some endpoints return data.result.data[0], others return data.result[0]
    if (data.result) {
      // Format 1: result.data array
      if (data.result.data && Array.isArray(data.result.data) && data.result.data[0]) {
        return { 
          source: "data.result.data[0]",
          dimensions: data.result.data[0].length
        };
      }
      
      // Format 2: result array directly
      if (Array.isArray(data.result) && data.result[0]) {
        return { 
          source: "data.result[0]",
          dimensions: data.result[0].length
        };
      }
      
      // Format 3: result.data is the embedding
      if (data.result.data) {
        return { 
          source: "data.result.data",
          dimensions: data.result.data.length
        };
      }
    }
    
    // If we get here, log the unexpected structure and throw error
    console.error("Unexpected API response structure:", JSON.stringify(data).substring(0, 200) + "...");
    throw new Error(`Invalid response structure from Cloudflare AI API`);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function testEmbeddings() {
  try {
    console.log("Testing embedding generation...");
    const result = await generateEmbedding("When was the last time I wrote about my goals?");
    console.log("SUCCESS! Generated embedding with:", result);
  } catch (error) {
    console.error("TEST FAILED:", error);
  }
}

// Run the test
testEmbeddings();
