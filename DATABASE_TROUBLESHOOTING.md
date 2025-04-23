# Database Connection Troubleshooting Guide for Reflecto

This guide provides detailed steps to troubleshoot database connection issues in the Reflecto application.

## Common Issues and Solutions

### 1. 500 Internal Server Error on API Calls

If you're experiencing 500 Internal Server Error when making API calls, it's likely due to database connection issues. Follow these steps to diagnose and fix the problem:

#### Check Environment Variables

1. Visit `/api/env-check` to verify that all required environment variables are set:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `TURSO_DB_URL`
   - `TURSO_DB_AUTH_TOKEN`

2. Make sure both sets of database variables are set (for compatibility with different parts of the codebase):
   - `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
   - `TURSO_DB_URL` and `TURSO_DB_AUTH_TOKEN`

#### Test Database Connection

1. Visit `/db-test` to test the database connection directly
2. Check if the connection is successful
3. If there's an error, note the error message and check the corresponding section below

### 2. URL_INVALID Error

If you see an error like `URL_INVALID: The URL is not in a valid format`:

1. Check that your Turso database URL is in the correct format: `libsql://your-database-name.turso.io`
2. Make sure there are no extra spaces or characters in the URL
3. Verify that the database exists and is accessible

### 3. Authentication Failed Error

If you see an error about authentication failing:

1. Check that your Turso authentication token is correct
2. Generate a new token if necessary:
   ```bash
   turso db tokens create your-database-name
   ```
3. Update the token in your environment variables

### 4. Database Not Found Error

If you see an error about the database not being found:

1. Check that the database name in the URL is correct
2. Verify that the database exists in your Turso account
3. Make sure the database is not paused or deleted

### 5. Connection Timeout Error

If you see a connection timeout error:

1. Check if the Turso service is experiencing any outages
2. Verify that your deployment environment can access the Turso database
3. Check if there are any network restrictions in your deployment environment

## Setting Environment Variables in Cloudflare

To set the environment variables in Cloudflare Pages:

1. Run the following command:
   ```bash
   npm run cf-env
   ```

2. Or set them manually in the Cloudflare Dashboard:
   - Go to the Cloudflare Dashboard
   - Navigate to Pages > Your Project
   - Go to Settings > Environment variables
   - Add all the required environment variables
   - Make sure to set them for both Production and Preview environments

## Testing Database Connection Locally

To test the database connection locally:

1. Run the following command:
   ```bash
   npm run db-test
   ```

2. Check the output for any errors

## Debugging Database Connection

The following endpoints and pages are available for debugging:

- `/api/db-test`: Test the database connection directly
- `/db-test`: A user-friendly page to test the database connection
- `/api/env-check`: Check if all required environment variables are set

## Logs

Check the logs in your deployment platform for more detailed error messages:

1. Look for errors related to database connection
2. Check for any errors in the Turso client initialization
3. Look for any errors in the API routes

## Additional Resources

- [Turso Documentation](https://docs.turso.tech/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
