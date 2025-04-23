import { NextResponse } from 'next/server';
import { auth } from "@/auth";

/**
 * GET /api/auth-debug
 * Debug authentication flow
 */
export async function GET(request) {
  try {
    // Get the current URL
    const url = new URL(request.url);
    
    // Get auth configuration
    const session = await auth();
    
    // Return debug information
    return NextResponse.json({
      status: 'success',
      message: 'Authentication debug information',
      url: url.toString(),
      pathname: url.pathname,
      host: url.host,
      origin: url.origin,
      authConfig: {
        authUrl: process.env.AUTH_URL,
        googleClientConfigured: !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET,
      },
      session: session ? {
        exists: !!session,
        user: session?.user ? {
          name: session.user.name,
          email: session.user.email ? `${session.user.email.substring(0, 3)}...` : null,
          image: !!session.user.image,
        } : null,
      } : null,
      headers: {
        host: request.headers.get('host'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
      }
    });
  } catch (error) {
    console.error('Error in GET /api/auth-debug:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
