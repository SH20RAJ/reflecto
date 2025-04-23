// scripts/check-env.js
// This script checks if all required environment variables are set

// Load environment variables from .env files
require('dotenv').config();

// Also try to load from .env.production if it exists
try {
  require('dotenv').config({ path: '.env.production' });
  console.log('Loaded environment variables from .env.production');
} catch (error) {
  console.log('No .env.production file found, using .env');
}

function checkEnvVariables() {
  console.log('Checking environment variables...');

  const requiredVars = [
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN',
    'TURSO_DB_URL',
    'TURSO_DB_AUTH_TOKEN',
    'AUTH_SECRET',
    'AUTH_URL',
    'AUTH_GOOGLE_ID',
    'AUTH_GOOGLE_SECRET'
  ];

  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      // Print first few characters of the value to verify it's not a placeholder
      const value = process.env[varName];
      const displayValue = value.length > 10
        ? `${value.substring(0, 10)}...`
        : value;
      console.log(`✓ ${varName}: ${displayValue}`);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  } else {
    console.log('✅ All required environment variables are set');
  }
}

checkEnvVariables();
