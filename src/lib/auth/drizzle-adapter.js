import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Create a Drizzle adapter for Auth.js
 * @param {import('drizzle-orm/libsql').LibSQLDatabase} db - The Drizzle database instance
 * @param {Object} schema - The database schema
 * @returns {import('next-auth/adapters').Adapter} - The Auth.js adapter
 */
export function DrizzleAdapter(db, schema) {
  const { users, accounts, sessions, verificationTokens } = schema;

  // Log the adapter initialization
  console.log('Initializing DrizzleAdapter with schema:', Object.keys(schema));
  console.log('Database connection:', !!db);

  return {
    async createUser(data) {
      console.log('Creating user:', { ...data, email: data.email ? `${data.email.substring(0, 3)}...` : null });

      try {
        const id = nanoid();
        await db.insert(users).values({
          id,
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        });

        const user = await db.select().from(users).where(eq(users.id, id)).then(res => res[0]);
        console.log('User created successfully:', { id: user.id });
        return user;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },

    async getUser(id) {
      const user = await db.select().from(users).where(eq(users.id, id)).then(res => res[0] || null);
      return user;
    },

    async getUserByEmail(email) {
      const user = await db.select().from(users).where(eq(users.email, email)).then(res => res[0] || null);
      return user;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await db
        .select()
        .from(users)
        .innerJoin(accounts, eq(users.id, accounts.userId))
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        )
        .then(res => res[0] || null);

      return result ? result.users : null;
    },

    async updateUser({ id, ...data }) {
      if (!id) {
        throw new Error("User id is required");
      }

      await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id));

      const user = await db.select().from(users).where(eq(users.id, id)).then(res => res[0]);
      return user;
    },

    async deleteUser(userId) {
      await db.delete(users).where(eq(users.id, userId));
    },

    async linkAccount(data) {
      const id = nanoid();
      await db.insert(accounts).values({
        id,
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state,
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        );
    },

    async createSession(data) {
      const id = nanoid();
      await db.insert(sessions).values({
        id,
        userId: data.userId,
        sessionToken: data.sessionToken,
        expires: data.expires,
      });

      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then(res => res[0]);

      return session;
    },

    async getSessionAndUser(sessionToken) {
      const result = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.sessionToken, sessionToken))
        .then(res => res[0] || null);

      if (!result) return null;

      return {
        session: result.session,
        user: result.user,
      };
    },

    async updateSession(data) {
      await db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken));

      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then(res => res[0]);

      return session;
    },

    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(data) {
      await db.insert(verificationTokens).values(data);
      const verificationToken = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, data.identifier),
            eq(verificationTokens.token, data.token)
          )
        )
        .then(res => res[0]);

      return verificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .then(res => res[0] || null);

      if (!verificationToken) return null;

      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        );

      return verificationToken;
    },
  };
}
