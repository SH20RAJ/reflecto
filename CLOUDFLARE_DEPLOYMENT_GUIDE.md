# Reflecto Cloudflare Deployment Guide

This guide provides step-by-step instructions for deploying the Reflecto application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Node.js 18 or later
- npm or yarn
- Wrangler CLI installed (`npm install -g wrangler`)
- Logged in to Wrangler (`wrangler login`)

## Deployment Steps

### 1. Set Up Environment Variables

First, make sure your environment variables are properly set up in the following files:

- `.env`
- `.env.production`
- `.env.cloudflare`

These files should contain the following variables:

```
# Database
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# For src/lib/turso.js
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

### 2. Set Environment Variables in Cloudflare Pages

Run the following command to set the environment variables in Cloudflare Pages:

```bash
npm run cf-env
```

This will use the Wrangler CLI to set the environment variables in your Cloudflare Pages project.

### 3. Deploy to Cloudflare Pages

Run the following command to deploy the application to Cloudflare Pages:

```bash
npm run deploy
```

This will:
1. Load environment variables from `.env`, `.env.production`, and `.env.cloudflare`
2. Check if all required environment variables are set
3. Build the application
4. Deploy it to Cloudflare Pages

### 4. Verify the Deployment

After the deployment is complete, visit your Cloudflare Pages URL to verify that the application is working correctly.

You can also check the environment variables by visiting:

```
https://reflecto.apped.me/api/env-check
```

### 5. Configure Google OAuth

Make sure your Google OAuth client has the correct redirect URIs:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find and edit your OAuth 2.0 Client ID for Reflecto
4. Add the following authorized redirect URIs:
   - `https://reflecto.apped.me/api/auth/callback/google`
   - `https://reflecto.apped.me/auth/signin`

## Troubleshooting

### Environment Variables Not Set

If you see an error about missing environment variables:

1. Check that the variables are properly set in your `.env`, `.env.production`, and `.env.cloudflare` files
2. Run `npm run cf-env` to set the environment variables in Cloudflare Pages
3. Redeploy the application with `npm run deploy`

### 500 Internal Server Error on Google Login

If you see a 500 Internal Server Error when trying to log in with Google:

1. Check that the `AUTH_URL` is set to `https://reflecto.apped.me`
2. Verify that your Google OAuth client has the correct redirect URIs
3. Check that the `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are correctly set
4. Visit `/api/env-check` to see if all required environment variables are properly set

### Database Connection Issues

If you see errors related to the Turso database:

1. Check that the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correctly set
2. Verify that the database is accessible from Cloudflare Pages
3. Check that the database schema is properly set up

## Updating Your Deployment

When you make changes to your application:

1. Commit your changes to your repository
2. Run `npm run deploy` to deploy the changes to Cloudflare Pages

If you need to update environment variables:

1. Update the variables in your `.env`, `.env.production`, and `.env.cloudflare` files
2. Run `npm run cf-env` to update the environment variables in Cloudflare Pages
3. Redeploy the application with `npm run deploy`
