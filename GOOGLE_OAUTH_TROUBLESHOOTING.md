# Google OAuth Troubleshooting Guide for Reflecto

This guide provides detailed steps to troubleshoot Google OAuth authentication issues in the Reflecto application.

## Common Issues and Solutions

### 1. 500 Internal Server Error on Google Login

If you're experiencing a 500 Internal Server Error when trying to log in with Google, follow these steps:

#### Check Environment Variables

1. Visit `/api/env-check` to verify that all required environment variables are set:
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

2. Make sure `AUTH_URL` is set to your production URL (e.g., `https://reflecto.apped.me`)

#### Verify Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID for Reflecto
4. Verify the following:
   - The client ID and secret match what's in your environment variables
   - The application is set to "Web application" type
   - The authorized JavaScript origins include:
     - `https://reflecto.apped.me`
   - The authorized redirect URIs include:
     - `https://reflecto.apped.me/api/auth/callback/google`
     - `https://reflecto.apped.me/auth/callback/google` (try adding this as well)
     - `https://reflecto.apped.me/auth/signin`

#### Check Authentication Flow

1. Visit `/auth/test` to test the authentication flow
2. Check the session status, environment variables, and auth debug information
3. Try signing in with Google from this page
4. If you encounter an error, note the error message and check the corresponding section below

### 2. Redirect URI Mismatch

If you see an error about a redirect URI mismatch:

1. Check the error message for the exact redirect URI that was used
2. Add this URI to the authorized redirect URIs in the Google Cloud Console
3. Common redirect URIs to add:
   - `https://reflecto.apped.me/api/auth/callback/google`
   - `https://reflecto.apped.me/auth/callback/google`
   - `https://reflecto.apped.me/api/auth/signin/google/callback`

### 3. Invalid Client ID or Secret

If you see an error about an invalid client ID or secret:

1. Go to the Google Cloud Console and verify your client ID and secret
2. Make sure the client ID and secret in your environment variables match exactly
3. Check if the OAuth client is enabled in the Google Cloud Console
4. Verify that the OAuth consent screen is properly configured

### 4. Database Connection Issues

If you're having issues with the database connection:

1. Check that the Turso database is accessible from your deployment environment
2. Verify that the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
3. Check if the database schema is properly set up with the required tables

### 5. CORS Issues

If you're experiencing CORS issues:

1. Make sure your `AUTH_URL` is set to the correct domain
2. Check if there are any CORS headers being set in your middleware or API routes
3. Verify that the authorized JavaScript origins in the Google Cloud Console include your domain

## Testing Authentication

To test the authentication flow:

1. Visit `/auth/test` to see detailed information about your authentication setup
2. Check the session status, environment variables, and auth debug information
3. Try signing in with Google from this page
4. If you encounter an error, check the error message and follow the corresponding troubleshooting steps

## Debugging Tools

The following endpoints are available for debugging:

- `/api/env-check`: Check if all required environment variables are set
- `/api/auth-debug`: Get detailed information about the authentication configuration
- `/auth/test`: Test the authentication flow and see debug information

## Logs

Check the logs in your deployment platform for more detailed error messages:

1. Look for errors related to authentication or database connection
2. Check for any middleware errors
3. Look for any errors in the NextAuth.js debug logs

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
