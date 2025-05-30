import { sql } from "drizzle-orm";
import { text, integer, blob, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  username: text("username").unique(), // Added username field - .default(sql`(lower(hex(randomblob(16))))`)
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Accounts table (for OAuth providers)
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => {
  return {
    providerProviderAccountIdKey: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  };
});

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// Verification tokens table (for email verification)
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
}, (table) => {
  return {
    compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
  };
});

// Notebooks table
export const notebooks = sqliteTable("notebooks", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  content: text("content").default(""), // Now stores markdown content directly
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(0), // Added isPublic field
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  // Make embedding field optional by not marking it as notNull()
  embedding: blob("embedding", { mode: "json" }), // Store vector embeddings as F32_BLOB
});

// Tags table
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull().unique(),
});

// Notebook-Tag relation (many-to-many)
export const notebooksTags = sqliteTable("notebooks_tags", {
  notebookId: text("notebook_id").notNull().references(() => notebooks.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.notebookId, table.tagId] }),
  };
});

// Newsletter subscriptions table
export const newsletterSubscriptions = sqliteTable("newsletter_subscriptions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  active: integer("active", { mode: "boolean" }).notNull().default(1),
});

// Feedback table
export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name"),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  rating: integer("rating"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  userId: text("user_id").references(() => users.id),
});

// Contact messages table
export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  status: text("status").notNull().default("new"), // new, read, replied, archived
  userId: text("user_id").references(() => users.id),
});

// Chat sessions table
export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"), // Optional title for the chat
  notebookId: text("notebook_id").references(() => notebooks.id, { onDelete: "cascade" }), // Optional reference to a notebook
  personality: text("personality").default("friendly"), // Store Luna's personality for this chat
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(0), // Flag to archive chats
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(0), // Flag to pin important chats
  summary: text("summary"), // AI-generated summary of the conversation
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`), // Timestamp of the last message
});

// Chat messages table
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  metadata: blob("metadata", { mode: "json" }), // Store additional message metadata as JSON
  tokenCount: integer("token_count"), // Track token usage for analytics or rate limiting
  isError: integer("is_error", { mode: "boolean" }).default(0), // Flag for error messages
});

// Keep the foo table for testing
export const fooTable = sqliteTable("foo", {
  bar: text("bar").notNull().default("Hey!"),
});