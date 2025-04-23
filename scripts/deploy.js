// scripts/deploy.js
// This script handles the deployment process with proper environment variable loading

// Load environment variables from .env files
require('dotenv').config();
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.cloudflare' });

console.log('Loaded environment variables from .env, .env.production, and .env.cloudflare');

const { execSync } = require('child_process');

// Print some debug info
console.log('Starting deployment process...');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`AUTH_URL: ${process.env.AUTH_URL}`);
console.log(`TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? 'Set (value hidden)' : 'Not set'}`);

// Check environment variables
try {
  require('./check-env');
} catch (error) {
  console.error('Environment variable check failed:', error);
  process.exit(1);
}

// Run the build and deploy commands
try {
  console.log('\nBuilding the application...');
  execSync('opennextjs-cloudflare build', { stdio: 'inherit' });

  console.log('\nDeploying to Cloudflare...');
  execSync('opennextjs-cloudflare deploy', { stdio: 'inherit' });

  console.log('\nDeployment completed successfully!');
} catch (error) {
  console.error('\nDeployment failed:', error);

  // Provide troubleshooting guidance
  console.log('\n=== Troubleshooting Guidance ===');
  console.log('1. Check for build errors in the output above');
  console.log('2. If there are issues with specific pages, try simplifying or temporarily disabling them');
  console.log('3. Verify that all environment variables are correctly set');
  console.log('4. Check for any syntax errors in your code');
  console.log('\nFor Google OAuth issues, please refer to GOOGLE_OAUTH_TROUBLESHOOTING.md');

  process.exit(1);
}
