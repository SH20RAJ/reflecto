# Deploying Reflecto to Cloudflare Pages

This guide explains how to deploy the Reflecto application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Node.js 18 or later
- npm or yarn
- A Google OAuth client ID and secret
- A Turso database

## Environment Variables

Before deploying, make sure you have the following environment variables set in your `.env.production` file:

```
# Database
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# For src/lib/turso.js (for backward compatibility)
TURSO_DB_URL=libsql://your-database-name.turso.io
TURSO_DB_AUTH_TOKEN=your-turso-auth-token

# Auth.js
AUTH_SECRET=your-auth-secret
AUTH_URL=https://reflecto.apped.me

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Environment
NODE_ENV=production
```

## Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find or create an OAuth 2.0 Client ID for your application
4. Add the following authorized redirect URIs:
   - `https://reflecto.apped.me/api/auth/callback/google`
   - `https://reflecto.apped.me/auth/signin`
5. Save the changes

## Deployment Steps

### 1. Local Build and Test

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the application locally
npm run start
```

### 2. Deploy to Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

## Setting Environment Variables in Cloudflare Pages

1. Go to the Cloudflare Dashboard
2. Navigate to Pages > Your Project
3. Go to Settings > Environment variables
4. Add all the environment variables listed above
5. Make sure to set the environment variables for both Production and Preview environments
6. Save the changes and trigger a new deployment

## Troubleshooting

If you encounter a 500 Internal Server Error when trying to log in with Google:

1. Check if all environment variables are properly set in Cloudflare Pages
2. Verify that your Google OAuth client has the correct redirect URIs
3. Check the Cloudflare Pages logs for any errors
4. Visit `/api/env-check` to see if all required environment variables are properly set

## Updating Your Deployment

When you make changes to your application:

1. Commit your changes to your repository
2. Run `npm run deploy` to deploy the changes to Cloudflare Pages

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev/)
