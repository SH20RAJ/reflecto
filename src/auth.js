
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "./db/index"
import * as schema from "./db/schema"
import { DrizzleAdapter } from "./lib/auth/drizzle-adapter"

// Log environment variables for debugging (redacted for security)
console.log('Auth.js - Environment variables check:');
console.log('AUTH_URL:', process.env.AUTH_URL);
console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? 'Set (value hidden)' : 'Not set');
console.log('AUTH_GOOGLE_ID:', process.env.AUTH_GOOGLE_ID ? 'Set (value hidden)' : 'Not set');
console.log('AUTH_GOOGLE_SECRET:', process.env.AUTH_GOOGLE_SECRET ? 'Set (value hidden)' : 'Not set');

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, schema),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (user?.id && session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Log redirect information for debugging
      console.log('Auth redirect callback:', { url, baseUrl });

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },
  debug: true, // Enable debug mode to see more detailed logs
  logger: {
    error(code, ...message) {
      console.error('AUTH ERROR:', code, ...message);
    },
    warn(code, ...message) {
      console.warn('AUTH WARNING:', code, ...message);
    },
    debug(code, ...message) {
      console.log('AUTH DEBUG:', code, ...message);
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})