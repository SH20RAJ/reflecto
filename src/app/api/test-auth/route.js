import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/test-auth
 * Test authentication and database connection
 */
export async function GET() {
  try {
    // Get the user session
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: null
      }, { status: 401 });
    }
    
    // Check if the user exists in the database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then(res => res[0] || null);
    
    // Return the session and database user
    return NextResponse.json({
      message: 'Authentication test',
      session: {
        ...session,
        user: {
          ...session.user,
          // Redact sensitive information
          email: session.user.email ? `${session.user.email.substring(0, 3)}...` : null,
        }
      },
      dbUser: dbUser ? {
        ...dbUser,
        // Redact sensitive information
        email: dbUser.email ? `${dbUser.email.substring(0, 3)}...` : null,
      } : null,
      userExists: !!dbUser,
    });
  } catch (error) {
    console.error('Error in GET /api/test-auth:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}
