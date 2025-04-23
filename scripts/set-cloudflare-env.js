// scripts/set-cloudflare-env.js
// This script sets environment variables in Cloudflare Pages

// Load environment variables from .env files
require('dotenv').config();
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.cloudflare' });

const { execSync } = require('child_process');

// Define the environment variables to set in Cloudflare
const envVars = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'TURSO_DB_URL',
  'TURSO_DB_AUTH_TOKEN',
  'AUTH_SECRET',
  'AUTH_URL',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'NODE_ENV'
];

console.log('Setting environment variables in Cloudflare Pages...');

// Set each environment variable
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    try {
      console.log(`Setting ${varName}...`);
      // Use wrangler to set the environment variable
      execSync(`wrangler pages env set ${varName} "${value}" --project-name reflecto`);
      console.log(`✅ Set ${varName}`);
    } catch (error) {
      console.error(`❌ Failed to set ${varName}: ${error.message}`);
    }
  } else {
    console.error(`❌ ${varName} is not set in environment`);
  }
});

console.log('\nEnvironment variables have been set in Cloudflare Pages.');
console.log('You may need to redeploy your application for the changes to take effect.');
