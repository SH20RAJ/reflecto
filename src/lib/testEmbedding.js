/**
 * Test script for debugging Cloudflare AI embeddings
 */

// Cloudflare API credentials
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_AUTH_TOKEN = process.env.CLOUDFLARE_AUTH_TOKEN;

/**
 * Test generating embeddings and log the response structure
 */
async function testEmbeddingGeneration() {
  try {
    console.log("Testing embedding generation...");
    
    const testText = "This is a test for the embedding API";
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: [testText] })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error (${response.status}): ${errorData}`);
      return;
    }

    const data = await response.json();
    
    console.log("API Response Structure:");
    console.log(JSON.stringify({
      success: data.success,
      resultKeys: data.result ? Object.keys(data.result) : null,
      dataExists: data.result?.data ? "yes" : "no",
      dataType: data.result?.data ? typeof data.result.data : null,
      dataIsArray: data.result?.data ? Array.isArray(data.result.data) : null,
      firstEmbeddingExists: data.result?.data?.[0] ? "yes" : "no",
      firstEmbeddingLength: data.result?.data?.[0]?.length,
      shape: data.result?.shape,
      pooling: data.result?.pooling,
    }, null, 2));
    
    console.log("\nFirst 10 vector values:");
    if (data.result?.data?.[0]) {
      console.log(data.result.data[0].slice(0, 10));
    }
    
    return data;
  } catch (error) {
    console.error("Error running test:", error);
  }
}

// Run the test
testEmbeddingGeneration().then(() => console.log("Test complete"));
