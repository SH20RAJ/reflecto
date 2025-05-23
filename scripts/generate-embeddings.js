#!/usr/bin/env node

// This script generates embeddings for all notebooks in the database
// Run it with: node scripts/generate-embeddings.js

require('dotenv').config();
const { generateAllEmbeddings } = require('../src/lib/generateEmbeddings');

async function main() {
  console.log('Starting embedding generation for all notebooks...');
  
  try {
    const result = await generateAllEmbeddings();
    
    console.log('\nEmbedding generation complete!');
    console.log(`Total notebooks processed: ${result.total}`);
    console.log(`Successfully generated: ${result.success}`);
    console.log(`Failed: ${result.failed}`);
    
    if (result.failed > 0) {
      console.warn('\nSome notebooks failed to generate embeddings. Check the logs above for details.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

main();
