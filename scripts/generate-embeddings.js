#!/usr/bin/env node

// This script generates embeddings for all notebooks in the database
// Run it with: node scripts/generate-embeddings.js

require('dotenv').config();
const { generateAllEmbeddings } = require('../src/lib/generateAllEmbeddings');

async function main() {
  console.log('Starting embedding generation for all notebooks...');
  
  try {
    await generateAllEmbeddings();
    console.log('Embedding generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

main();
