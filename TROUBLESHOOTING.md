# Troubleshooting Reflecto Deployment Issues

This guide helps you troubleshoot common issues with the Reflecto application deployment.

## 500 Internal Server Error on Google Login

If you're experiencing a 500 Internal Server Error when trying to log in with Google, it's likely due to missing or incorrect environment variables.

### Step 1: Check Environment Variables

Make sure the following environment variables are properly set in your deployment environment:

```
# Authentication
AUTH_SECRET=your-auth-secret-at-least-32-chars-long
AUTH_URL=https://reflecto.apped.me
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Database
TURSO_DATABASE_URL=your-turso-database-url
TURSO_AUTH_TOKEN=your-turso-auth-token

# For backwards compatibility
TURSO_DB_URL=${TURSO_DATABASE_URL}
TURSO_DB_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
```

### Step 2: Verify Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID for Reflecto
4. Verify that the authorized redirect URIs include:
   - `https://reflecto.apped.me/api/auth/callback/google`
   - `https://reflecto.apped.me/auth/signin`

### Step 3: Check Environment Variables on the Server

Visit `https://reflecto.apped.me/api/env-check` to see if all required environment variables are properly set. This endpoint will show which variables are missing.

### Step 4: Generate a Proper AUTH_SECRET

The `AUTH_SECRET` should be a strong, random string. You can generate one with:

```bash
openssl rand -base64 32
```

### Step 5: Update Environment Variables in Your Deployment Platform

Depending on where you're hosting Reflecto, update the environment variables:

#### For Cloudflare Pages:

1. Go to the Cloudflare Dashboard
2. Navigate to Pages > Your Project
3. Go to Settings > Environment variables
4. Add or update the required environment variables
5. Trigger a new deployment

### Step 6: Check Database Connection

Make sure your Turso database is properly configured and accessible:

1. Verify that the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
2. Check if the database is accessible from your deployment environment
3. Ensure the database schema is properly set up with the required tables

### Step 7: Check Logs

Check the deployment logs for any errors related to authentication or database connection.

## Other Common Issues

### Images Not Loading

If images are not loading, check:

1. The `next.config.mjs` file to ensure the image domains are properly configured
2. The image URLs to make sure they're using HTTPS

### API Routes Not Working

If API routes are not working:

1. Check that the server-side code is properly deployed
2. Verify that the database connection is working
3. Check for any CORS issues if calling the API from a different domain

### Database Connection Issues

If you're having database connection issues:

1. Verify that the Turso database is online and accessible
2. Check that the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
3. Make sure the database schema is properly set up

## Getting Help

If you're still experiencing issues after following these steps, please:

1. Check the application logs for detailed error messages
2. Open an issue on the GitHub repository with detailed information about the problem
3. Contact the development team with the error details and steps to reproduce
