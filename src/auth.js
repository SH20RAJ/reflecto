
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "./db/index"
import * as schema from "./db/schema"
import { DrizzleAdapter } from "./lib/auth/drizzle-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, schema),
  providers: [Google],
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
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Explicitly enable CSRF protection
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
})