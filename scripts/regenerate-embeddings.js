/**
 * Script to regenerate all embeddings for notebooks in the database
 */
import { db } from '../src/db';
import { notebooks } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateAndSaveEmbedding } from '../src/lib/generateEmbeddings';

async function regenerateAllEmbeddings() {
  try {
    console.log('Starting embedding regeneration process...');
    
    // Get all notebooks
    const allNotebooks = await db.select({
      id: notebooks.id,
      title: notebooks.title,
      hasEmbedding: sql`${notebooks.embedding} IS NOT NULL`
    }).from(notebooks);
    
    console.log(`Found ${allNotebooks.length} notebooks total`);
    
    let withEmbeddings = 0;
    let withoutEmbeddings = 0;
    
    allNotebooks.forEach(notebook => {
      if (notebook.hasEmbedding) {
        withEmbeddings++;
      } else {
        withoutEmbeddings++;
      }
    });
    
    console.log(`${withEmbeddings} notebooks already have embeddings`);
    console.log(`${withoutEmbeddings} notebooks need embeddings`);
    
    if (withoutEmbeddings === 0) {
      console.log('No notebooks need embeddings. Do you want to regenerate all? (Set forceAll=true)');
      return;
    }
    
    // Process notebooks in batches to avoid rate limiting
    const batchSize = 5; 
    const totalBatches = Math.ceil(allNotebooks.length / batchSize);
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < allNotebooks.length; i += batchSize) {
      const batch = allNotebooks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} notebooks)...`);
      
      // Process notebooks in sequence within each batch to avoid race conditions
      for (const notebook of batch) {
        if (!notebook.hasEmbedding) {
          try {
            console.log(`Generating embedding for notebook: ${notebook.id} - "${notebook.title}"`);
            const success = await generateAndSaveEmbedding(notebook.id);
            
            if (success) {
              successCount++;
              console.log(`✅ Successfully generated embedding for: ${notebook.title}`);
            } else {
              failCount++;
              console.log(`❌ Failed to generate embedding for: ${notebook.title}`);
            }
          } catch (error) {
            failCount++;
            console.error(`❌ Error generating embedding for notebook ${notebook.id}:`, error);
          }
          
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Add a delay between batches
      if (i + batchSize < allNotebooks.length) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\nEmbedding regeneration complete!');
    console.log(`Successfully generated embeddings for ${successCount} notebooks`);
    console.log(`Failed to generate embeddings for ${failCount} notebooks`);
    
  } catch (error) {
    console.error('Error in embedding regeneration script:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
regenerateAllEmbeddings();
