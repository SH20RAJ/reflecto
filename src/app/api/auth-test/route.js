import { NextResponse } from 'next/server';
import { auth } from "@/auth";

/**
 * GET /api/auth-test
 * Simple endpoint to test if authentication is working
 */
export async function GET() {
  try {
    // Get the user session
    const session = await auth();
    
    // Return the session status
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          name: session.user?.name || null,
          email: session.user?.email ? `${session.user.email.substring(0, 3)}...` : null,
          id: session.user?.id || null,
        },
        expires: session.expires,
      } : null,
    });
  } catch (error) {
    console.error('Error in GET /api/auth-test:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}
