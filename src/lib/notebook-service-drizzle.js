import { db } from '@/db/index';
import { notebooks, tags, notebooksTags, users } from '@/db/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
// We no longer need these imports as we're only storing the content field
// import { editorJsToMarkdown, extractPlainText } from './editorjs-to-markdown';

/**
 * Service for handling notebook operations using Drizzle ORM
 */
export const NotebookService = {
  /**
   * Get all notebooks for a user with pagination
   * @param {string} userId - The user ID
   * @param {number} page - The page number (1-based)
   * @param {number} limit - The number of items per page
   * @returns {Promise<Object>} - A promise that resolves to an object with notebooks and pagination info
   */
  async getUserNotebooks(userId, page = 1, limit = 20) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(notebooks)
        .where(eq(notebooks.userId, userId))
        .then(result => Number(result[0].count));

      // Get notebooks for the user with pagination
      const userNotebooks = await db
        .select()
        .from(notebooks)
        .where(eq(notebooks.userId, userId))
        .orderBy(sql`${notebooks.updatedAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        userNotebooks.map(async (notebook) => {
          const notebookTags = await db
            .select({
              id: tags.id,
              name: tags.name,
            })
            .from(tags)
            .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
            .where(eq(notebooksTags.notebookId, notebook.id));

          return {
            ...notebook,
            tags: notebookTags,
          };
        })
      );

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      const hasPrevious = page > 1;

      return {
        notebooks: notebooksWithTags,
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
      console.error('Error fetching notebooks:', error);
      throw error;
    }
  },

  /**
   * Get a notebook by ID
   * @param {string} id - The notebook ID
   * @param {string} userId - The user ID (for authorization)
   * @returns {Promise<Object>} - A promise that resolves to the notebook
   */
  async getNotebookById(id, userId) {
    try {
      // Get the notebook
      const notebook = await db
        .select()
        .from(notebooks)
        .where(eq(notebooks.id, id))
        .then((res) => res[0] || null);

      // Check if the notebook exists and belongs to the user
      if (!notebook || notebook.userId !== userId) {
        return null;
      }

      // Get the tags for the notebook
      const notebookTags = await db
        .select({
          id: tags.id,
          name: tags.name,
        })
        .from(tags)
        .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
        .where(eq(notebooksTags.notebookId, id));

      return {
        ...notebook,
        tags: notebookTags,
      };
    } catch (error) {
      console.error('Error fetching notebook:', error);
      throw error;
    }
  },

  /**
   * Create a new notebook
   * @param {Object} data - The notebook data
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - A promise that resolves to the created notebook
   */
  async createNotebook(data, userId) {
    try {
      console.log('Creating notebook for user:', userId);
      const { tags: tagNames = [], ...notebookData } = data;
      const notebookId = nanoid();

      // Check if the user exists in the database
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then(res => res.length > 0);

      if (!userExists) {
        console.error('User does not exist in the database:', userId);
        throw new Error('User does not exist in the database');
      }

      // Parse content if it's a JSON string
      let contentObj = notebookData.content;
      if (typeof notebookData.content === 'string' && notebookData.content.trim() !== '') {
        try {
          contentObj = JSON.parse(notebookData.content);
        } catch (e) {
          console.error('Error parsing content JSON:', e);
          contentObj = { blocks: [] };
        }
      }

      // Create the notebook with explicit timestamps
      const now = new Date();
      await db.insert(notebooks).values({
        id: notebookId,
        title: notebookData.title,
        content: typeof notebookData.content === 'string' ? notebookData.content : JSON.stringify(contentObj),
        userId,
        createdAt: now,
        updatedAt: now,
      });

      // Create or get tags and link them to the notebook
      for (const tagName of tagNames) {
        if (!tagName.trim()) continue;

        // Check if the tag exists
        let tag = await db
          .select()
          .from(tags)
          .where(eq(tags.name, tagName.trim()))
          .then((res) => res[0] || null);

        // If the tag doesn't exist, create it
        if (!tag) {
          const tagId = nanoid();
          await db.insert(tags).values({
            id: tagId,
            name: tagName.trim(),
          });
          tag = { id: tagId, name: tagName.trim() };
        }

        // Link the tag to the notebook
        await db.insert(notebooksTags).values({
          notebookId,
          tagId: tag.id,
        });
      }

      // Get the created notebook with tags
      return this.getNotebookById(notebookId, userId);
    } catch (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }
  },

  /**
   * Update a notebook
   * @param {string} id - The notebook ID
   * @param {Object} data - The updated notebook data
   * @param {string} userId - The user ID (for authorization)
   * @returns {Promise<Object>} - A promise that resolves to the updated notebook
   */
  async updateNotebook(id, data, userId) {
    try {
      // Check if the notebook exists and belongs to the user
      const notebook = await db
        .select()
        .from(notebooks)
        .where(eq(notebooks.id, id))
        .then((res) => res[0] || null);

      if (!notebook || notebook.userId !== userId) {
        return null;
      }

      const { tags: tagNames = [], ...notebookData } = data;

      // Parse content if it's a JSON string
      let contentObj = notebookData.content;
      if (typeof notebookData.content === 'string' && notebookData.content.trim() !== '') {
        try {
          contentObj = JSON.parse(notebookData.content);
        } catch (e) {
          console.error('Error parsing content JSON:', e);
          contentObj = { blocks: [] };
        }
      }

      // Update the notebook
      await db
        .update(notebooks)
        .set({
          ...notebookData,
          content: typeof notebookData.content === 'string' ? notebookData.content : JSON.stringify(contentObj),
          updatedAt: new Date(),
        })
        .where(eq(notebooks.id, id));

      // Delete all existing tag links
      await db.delete(notebooksTags).where(eq(notebooksTags.notebookId, id));

      // Create or get tags and link them to the notebook
      for (const tagName of tagNames) {
        if (!tagName.trim()) continue;

        // Check if the tag exists
        let tag = await db
          .select()
          .from(tags)
          .where(eq(tags.name, tagName.trim()))
          .then((res) => res[0] || null);

        // If the tag doesn't exist, create it
        if (!tag) {
          const tagId = nanoid();
          await db.insert(tags).values({
            id: tagId,
            name: tagName.trim(),
          });
          tag = { id: tagId, name: tagName.trim() };
        }

        // Link the tag to the notebook
        await db.insert(notebooksTags).values({
          notebookId: id,
          tagId: tag.id,
        });
      }

      // Get the updated notebook with tags
      return this.getNotebookById(id, userId);
    } catch (error) {
      console.error('Error updating notebook:', error);
      throw error;
    }
  },

  /**
   * Delete a notebook
   * @param {string} id - The notebook ID
   * @param {string} userId - The user ID (for authorization)
   * @returns {Promise<boolean>} - A promise that resolves to true if the notebook was deleted
   */
  async deleteNotebook(id, userId) {
    try {
      // Check if the notebook exists and belongs to the user
      const notebook = await db
        .select()
        .from(notebooks)
        .where(eq(notebooks.id, id))
        .then((res) => res[0] || null);

      if (!notebook || notebook.userId !== userId) {
        return false;
      }

      // Delete the notebook (cascade will delete the tag links)
      await db.delete(notebooks).where(eq(notebooks.id, id));

      return true;
    } catch (error) {
      console.error('Error deleting notebook:', error);
      throw error;
    }
  },

  /**
   * Search notebooks by title or content
   * @param {string} query - The search query
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - A promise that resolves to an array of notebooks
   */
  async searchNotebooks(query, userId, page = 1, limit = 20) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(notebooks)
        .where(
          and(
            eq(notebooks.userId, userId),
            or(
              like(notebooks.title, `%${query}%`),
              like(notebooks.content, `%${query}%`)
              // We no longer need to search in markdown and plainText fields
            )
          )
        )
        .then(result => Number(result[0].count));

      // Get notebooks for the user that match the query with pagination
      const userNotebooks = await db
        .select()
        .from(notebooks)
        .where(
          and(
            eq(notebooks.userId, userId),
            or(
              like(notebooks.title, `%${query}%`),
              like(notebooks.content, `%${query}%`)
              // We no longer need to search in markdown and plainText fields
            )
          )
        )
        .orderBy(sql`${notebooks.updatedAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        userNotebooks.map(async (notebook) => {
          const notebookTags = await db
            .select({
              id: tags.id,
              name: tags.name,
            })
            .from(tags)
            .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
            .where(eq(notebooksTags.notebookId, notebook.id));

          return {
            ...notebook,
            tags: notebookTags,
          };
        })
      );

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      const hasPrevious = page > 1;

      return {
        notebooks: notebooksWithTags,
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
      console.error('Error searching notebooks:', error);
      throw error;
    }
  },
  /**
   * Get all tags for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - A promise that resolves to an array of tags with counts
   */
  async getUserTags(userId) {
    try {
      // Get all tags used by the user's notebooks with counts
      const userTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          count: sql`count(${notebooksTags.notebookId})`
        })
        .from(tags)
        .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
        .innerJoin(notebooks, eq(notebooksTags.notebookId, notebooks.id))
        .where(eq(notebooks.userId, userId))
        .groupBy(tags.id, tags.name)
        .orderBy(sql`count(${notebooksTags.notebookId}) DESC`);

      return userTags;
    } catch (error) {
      console.error('Error fetching user tags:', error);
      throw error;
    }
  },

  /**
   * Get notebooks by tag
   * @param {string} tagId - The tag ID
   * @param {string} userId - The user ID
   * @param {number} page - The page number (1-based)
   * @param {number} limit - The number of items per page
   * @returns {Promise<Object>} - A promise that resolves to an object with notebooks and pagination info
   */
  async getNotebooksByTag(tagId, userId, page = 1, limit = 20) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql`count(DISTINCT ${notebooks.id})` })
        .from(notebooks)
        .innerJoin(notebooksTags, eq(notebooks.id, notebooksTags.notebookId))
        .where(
          and(
            eq(notebooks.userId, userId),
            eq(notebooksTags.tagId, tagId)
          )
        )
        .then(result => Number(result[0].count));

      // Get notebooks for the user with the specified tag
      const notebookIds = await db
        .select({ id: notebooks.id })
        .from(notebooks)
        .innerJoin(notebooksTags, eq(notebooks.id, notebooksTags.notebookId))
        .where(
          and(
            eq(notebooks.userId, userId),
            eq(notebooksTags.tagId, tagId)
          )
        )
        .orderBy(sql`${notebooks.updatedAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Get full notebook data for each ID
      const notebooksWithTags = await Promise.all(
        notebookIds.map(async ({ id }) => {
          return this.getNotebookById(id, userId);
        })
      );

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      const hasPrevious = page > 1;

      return {
        notebooks: notebooksWithTags,
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
      console.error('Error fetching notebooks by tag:', error);
      throw error;
    }
  },
};