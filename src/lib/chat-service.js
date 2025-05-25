import { db } from '@/db';
import { chatSessions, chatMessages, users } from '@/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

/**
 * Service for managing chat sessions and messages
 */
export const chatService = {
  /**
   * Create a new chat session
   * @param {Object} data - Session data
   * @returns {Promise<Object>} - The created session
   */
  async createSession(data) {
    try {
      const session = await db.insert(chatSessions).values(data).returning();
      return session[0];
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  /**
   * Get a chat session by ID
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The session
   */
  async getSession(sessionId, userId) {
    try {
      const session = await db
        .select()
        .from(chatSessions)
        .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)))
        .then(res => res[0] || null);

      if (!session) {
        throw new Error('Session not found or unauthorized');
      }

      return session;
    } catch (error) {
      console.error('Error getting chat session:', error);
      throw error;
    }
  },

  /**
   * Get all chat sessions for a user
   * @param {string} userId - The user ID
   * @param {Object} options - Options for filtering and pagination
   * @returns {Promise<Array>} - The sessions
   */
  async getUserSessions(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        includeArchived = false,
        sortBy = 'lastMessageAt',
        sortDirection = 'desc'
      } = options;

      const offset = (page - 1) * limit;

      // Build where clause
      let whereClause = eq(chatSessions.userId, userId);

      if (!includeArchived) {
        whereClause = and(whereClause, eq(chatSessions.isArchived, 0));
      }

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(chatSessions)
        .where(whereClause)
        .then(result => Number(result[0].count));

      // Sort query
      let query = db
        .select({
          id: chatSessions.id,
          title: chatSessions.title,
          notebookId: chatSessions.notebookId,
          personality: chatSessions.personality,
          createdAt: chatSessions.createdAt,
          updatedAt: chatSessions.updatedAt,
          lastMessageAt: chatSessions.lastMessageAt,
          isPinned: chatSessions.isPinned,
          isArchived: chatSessions.isArchived,
          summary: chatSessions.summary,
        })
        .from(chatSessions)
        .where(whereClause);

      // Apply sorting
      if (sortBy === 'lastMessageAt') {
        query = sortDirection === 'asc' 
          ? query.orderBy(asc(chatSessions.lastMessageAt))
          : query.orderBy(desc(chatSessions.lastMessageAt));
      } else if (sortBy === 'createdAt') {
        query = sortDirection === 'asc' 
          ? query.orderBy(asc(chatSessions.createdAt))
          : query.orderBy(desc(chatSessions.createdAt));
      }

      // Apply pinned sorting - always show pinned sessions first
      query = query
        .orderBy(desc(chatSessions.isPinned))
        .limit(limit)
        .offset(offset);

      // Execute query
      const sessions = await query;

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      const hasPrevious = page > 1;

      return {
        sessions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
          hasPrevious
        }
      };
    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      throw error;
    }
  },

  /**
   * Update a chat session
   * @param {string} sessionId - The session ID
   * @param {Object} data - The updated data
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The updated session
   */
  async updateSession(sessionId, data, userId) {
    try {
      // Verify ownership
      await this.getSession(sessionId, userId);

      // Update the session
      const updatedSession = await db
        .update(chatSessions)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(chatSessions.id, sessionId))
        .returning();

      return updatedSession[0];
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  },

  /**
   * Delete a chat session
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<boolean>} - True if deleted
   */
  async deleteSession(sessionId, userId) {
    try {
      // Verify ownership
      await this.getSession(sessionId, userId);

      // Delete the session - messages will cascade
      await db
        .delete(chatSessions)
        .where(eq(chatSessions.id, sessionId));

      return true;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  },

  /**
   * Archive a chat session
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The updated session
   */
  async archiveSession(sessionId, userId) {
    return this.updateSession(sessionId, { isArchived: 1 }, userId);
  },

  /**
   * Restore a chat session from archive
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The updated session
   */
  async restoreSession(sessionId, userId) {
    return this.updateSession(sessionId, { isArchived: 0 }, userId);
  },

  /**
   * Toggle the pinned status of a chat session
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The updated session
   */
  async togglePinSession(sessionId, userId) {
    // Get current session
    const session = await this.getSession(sessionId, userId);
    // Toggle the isPinned value
    return this.updateSession(sessionId, { isPinned: session.isPinned ? 0 : 1 }, userId);
  },

  /**
   * Add a message to a chat session
   * @param {Object} data - Message data
   * @returns {Promise<Object>} - The added message
   */
  async addMessage(data) {
    try {
      const newMessage = await db
        .insert(chatMessages)
        .values(data)
        .returning();

      // Update the session's lastMessageAt timestamp
      await db
        .update(chatSessions)
        .set({ 
          lastMessageAt: new Date(),
          // If it's the first message and no title exists, generate a default title
          title: data.role === 'user' ? sql`COALESCE(${chatSessions.title}, SUBSTR(${data.content}, 1, 50))` : chatSessions.title,
          updatedAt: new Date()
        })
        .where(eq(chatSessions.id, data.sessionId));

      return newMessage[0];
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  },

  /**
   * Get messages for a chat session
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @param {Object} options - Options for filtering and pagination
   * @returns {Promise<Array>} - The messages
   */
  async getSessionMessages(sessionId, userId, options = {}) {
    try {
      // Verify ownership
      await this.getSession(sessionId, userId);

      const { page = 1, limit = 100 } = options;
      const offset = (page - 1) * limit;

      // Count messages
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .then(result => Number(result[0].count));

      // Get messages
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(asc(chatMessages.createdAt))
        .limit(limit)
        .offset(offset);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      const hasPrevious = page > 1;

      return {
        messages,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
          hasPrevious
        }
      };
    } catch (error) {
      console.error('Error getting session messages:', error);
      throw error;
    }
  },

  /**
   * Get a complete chat session with messages
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The session with messages
   */
  async getCompleteSession(sessionId, userId) {
    try {
      // Get session
      const session = await this.getSession(sessionId, userId);
      
      // Get messages
      const messagesResponse = await this.getSessionMessages(sessionId, userId);
      
      return {
        ...session,
        messages: messagesResponse.messages,
      };
    } catch (error) {
      console.error('Error getting complete chat session:', error);
      throw error;
    }
  },

  /**
   * Generate a title for a chat session based on content
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID for authorization
   * @returns {Promise<Object>} - The updated session with title
   */
  async generateSessionTitle(sessionId, userId) {
    try {
      // Get first few messages
      const { messages } = await this.getSessionMessages(sessionId, userId, { limit: 3 });
      
      // Extract content from the first user message
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (!firstUserMessage) {
        return null;
      }

      // Create a simple title from the first message (first ~40 chars)
      const simpleTitle = firstUserMessage.content.substring(0, 40).trim();
      const title = simpleTitle + (simpleTitle.length === 40 ? '...' : '');

      // Update the session with the title
      return this.updateSession(sessionId, { title }, userId);
    } catch (error) {
      console.error('Error generating session title:', error);
      throw error;
    }
  },
};
