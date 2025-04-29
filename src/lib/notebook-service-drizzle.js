import { db, executeRawSQL, tursoClient, dateToSQLiteTimestamp, sqliteTimestampToDate } from '@/db';
import { notebooks, tags, notebooksTags, users } from '@/db/schema';
import { eq, and, or, like, sql, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
// We no longer need these imports as we're only storing the content field
// import { editorJsToMarkdown, extractPlainText } from './editorjs-to-markdown';

/**
 * Sanitize string content to remove invalid characters that could cause issues
 * @param {string} content - The content to sanitize
 * @returns {string} - The sanitized content
 */
const sanitizeContent = (content) => {
  if (!content || typeof content !== 'string') return '';

  try {
    // Replace any characters that might cause issues with Unicode
    // This will remove any invalid surrogate pairs or non-characters
    return content.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, '?')
                 .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''); // Remove control characters
  } catch (error) {
    console.error('Error sanitizing content:', error);
    // If all else fails, return a safe string
    return 'Content unavailable due to encoding issues';
  }
};

/**
 * Service for handling notebook operations using Drizzle ORM
 */
const NotebookService = {
  /**
   * Get all notebooks for a user with pagination
   * @param {string} userId - The user ID
   * @param {number} page - The page number (1-based)
   * @param {number} limit - The number of items per page
   * @returns {Promise<Object>} - A promise that resolves to an object with notebooks and pagination info
   */
  async getNotebooksByDateRange(userId, startDate = null, endDate = null, page = 1, limit = 100) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Build the where clause based on date range
      let whereClause;

      if (startDate && endDate) {
        // Both start and end dates provided
        const startTimestamp = dateToSQLiteTimestamp(startDate);
        const endTimestamp = dateToSQLiteTimestamp(endDate);

        whereClause = and(
          eq(notebooks.userId, userId),
          gte(notebooks.createdAt, startTimestamp),
          lte(notebooks.createdAt, endTimestamp)
        );
      } else if (startDate) {
        // Only start date provided
        const startTimestamp = dateToSQLiteTimestamp(startDate);

        whereClause = and(
          eq(notebooks.userId, userId),
          gte(notebooks.createdAt, startTimestamp)
        );
      } else if (endDate) {
        // Only end date provided
        const endTimestamp = dateToSQLiteTimestamp(endDate);

        whereClause = and(
          eq(notebooks.userId, userId),
          lte(notebooks.createdAt, endTimestamp)
        );
      } else {
        // No date range provided, get all notebooks
        whereClause = eq(notebooks.userId, userId);
      }

      // Get notebooks for the user with pagination, but only select specific fields
      const userNotebooksBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(whereClause)
        .orderBy(sql`${notebooks.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Now fetch content separately for each notebook with error handling
      const userNotebooks = await Promise.all(
        userNotebooksBasic.map(async (notebook) => {
          try {
            // Fetch content separately with error handling
            const contentResult = await db
              .select({ content: sql`COALESCE(${notebooks.content}, '')` })
              .from(notebooks)
              .where(eq(notebooks.id, notebook.id))
              .then(res => res[0]?.content || '');

            return {
              ...notebook,
              content: sanitizeContent(contentResult)
            };
          } catch (error) {
            console.error(`Error fetching content for notebook ${notebook.id}:`, error);
            // Return the notebook with empty content if there's an error
            return {
              ...notebook,
              content: 'Content unavailable due to encoding issues'
            };
          }
        })
      );

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        userNotebooks.map(async (notebook) => {
          try {
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
          } catch (error) {
            console.error(`Error fetching tags for notebook ${notebook.id}:`, error);
            return {
              ...notebook,
              tags: [],
            };
          }
        })
      );

      return notebooksWithTags;
    } catch (error) {
      console.error('Error getting notebooks by date range:', error);
      return [];
    }
  },

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

      // Get notebooks for the user with pagination, but only select specific fields
      // This avoids the issue with invalid code points in the content field
      const userNotebooksBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(eq(notebooks.userId, userId))
        .orderBy(sql`${notebooks.updatedAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Now fetch content separately for each notebook with error handling
      const userNotebooks = await Promise.all(
        userNotebooksBasic.map(async (notebook) => {
          try {
            // Fetch content separately with error handling
            const contentResult = await db
              .select({ content: sql`COALESCE(${notebooks.content}, '')` })
              .from(notebooks)
              .where(eq(notebooks.id, notebook.id))
              .then(res => res[0]?.content || '');

            return {
              ...notebook,
              content: sanitizeContent(contentResult)
            };
          } catch (error) {
            console.error(`Error fetching content for notebook ${notebook.id}:`, error);
            // Return the notebook with empty content if there's an error
            return {
              ...notebook,
              content: 'Content unavailable due to encoding issues'
            };
          }
        })
      );

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        userNotebooks.map(async (notebook) => {
          try {
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
          } catch (error) {
            console.error(`Error fetching tags for notebook ${notebook.id}:`, error);
            return {
              ...notebook,
              tags: [],
            };
          }
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
      // Get the notebook basic info without content
      const notebookBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(eq(notebooks.id, id))
        .then((res) => res[0] || null);

      // Check if the notebook exists and belongs to the user
      if (!notebookBasic || notebookBasic.userId !== userId) {
        return null;
      }

      // Fetch content separately with error handling
      let content = '';
      try {
        const contentResult = await db
          .select({ content: sql`COALESCE(${notebooks.content}, '')` })
          .from(notebooks)
          .where(eq(notebooks.id, id))
          .then(res => res[0]?.content || '');

        content = sanitizeContent(contentResult);
      } catch (error) {
        console.error(`Error fetching content for notebook ${id}:`, error);
        content = 'Content unavailable due to encoding issues';
      }

      // Get the tags for the notebook
      let notebookTags = [];
      try {
        notebookTags = await db
          .select({
            id: tags.id,
            name: tags.name,
          })
          .from(tags)
          .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
          .where(eq(notebooksTags.notebookId, id));
      } catch (error) {
        console.error(`Error fetching tags for notebook ${id}:`, error);
      }

      return {
        ...notebookBasic,
        content,
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
      let contentToStore = '';
      if (typeof notebookData.content === 'string' && notebookData.content.trim() !== '') {
        try {
          // Try to parse as JSON in case it's JSON format
          const contentObj = JSON.parse(notebookData.content);
          contentToStore = JSON.stringify(contentObj);
        } catch (e) {
          // Not JSON, use as is but sanitize
          contentToStore = sanitizeContent(notebookData.content);
        }
      } else if (notebookData.content) {
        // If it's an object, stringify it
        contentToStore = JSON.stringify(notebookData.content);
      }

      // Create the notebook with explicit timestamps
      const now = new Date();
      // Convert to Unix timestamp (seconds since epoch) for SQLite
      const nowTimestamp = dateToSQLiteTimestamp(now);

      console.log('Creating notebook with timestamp:', nowTimestamp, 'Date object:', now);

      // First check if the embedding column exists in the database
      let hasEmbeddingColumn = false;
      try {
        // Try a simple query to check if the column exists
        const result = await executeRawSQL("PRAGMA table_info(notebooks)");
        if (result && result.rows) {
          hasEmbeddingColumn = result.rows.some(col => col.name === 'embedding');
        }
      } catch (error) {
        console.warn('Error checking for embedding column:', error);
        hasEmbeddingColumn = false;
      }

      try {
        if (hasEmbeddingColumn) {
          // If the embedding column exists, use the normal insert
          // Note: Drizzle ORM should handle the date conversion automatically
          await db.insert(notebooks).values({
            id: notebookId,
            title: notebookData.title,
            content: contentToStore,
            userId,
            isPublic: notebookData.isPublic || 0,
            createdAt: now,
            updatedAt: now,
            // embedding field is left undefined
          });
        } else {
          // If the embedding column doesn't exist, use raw SQL to insert without it
          // For raw SQL, we need to use the Unix timestamp format
          await executeRawSQL(
            `INSERT INTO notebooks (id, title, content, user_id, is_public, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              notebookId,
              notebookData.title,
              contentToStore,
              userId,
              notebookData.isPublic || 0,
              nowTimestamp,  // Use Unix timestamp for SQLite
              nowTimestamp   // Use Unix timestamp for SQLite
            ]
          );
        }
      } catch (error) {
        console.error('Error inserting notebook:', error);

        // If we still get an error, try one more time with a simpler query
        // Include timestamps in this query too
        try {
          await executeRawSQL(
            `INSERT INTO notebooks (id, title, content, user_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              notebookId,
              notebookData.title || 'Untitled',
              contentToStore || '',
              userId,
              nowTimestamp,  // Use Unix timestamp for SQLite
              nowTimestamp   // Use Unix timestamp for SQLite
            ]
          );
        } catch (fallbackError) {
          console.error('Error with fallback insert method:', fallbackError);
          throw new Error(`Failed to create notebook: ${error.message}. Fallback also failed: ${fallbackError.message}`);
        }
      }

      // Create or get tags and link them to the notebook
      for (const tagItem of tagNames) {
        // Handle both tag IDs and tag names
        let tagId, tagName;

        if (typeof tagItem === 'string') {
          // Check if it's a tag ID (existing tag) or a tag name (new tag)
          const existingTag = await db
            .select()
            .from(tags)
            .where(eq(tags.id, tagItem))
            .then((res) => res[0] || null);

          if (existingTag) {
            // It's an existing tag ID
            tagId = tagItem;
            tagName = existingTag.name;
          } else {
            // It's a new tag name
            tagName = tagItem.trim();
            if (!tagName) continue;

            // Validate tag name - don't allow tag names that look like IDs
            // This prevents the issue where IDs are accidentally stored as names
            if (tagName.length > 20 && /^[a-zA-Z0-9_-]+$/.test(tagName)) {
              console.warn('Tag name looks like an ID, skipping:', tagName);
              continue;
            }

            // Check if a tag with this name already exists
            const existingTagByName = await db
              .select()
              .from(tags)
              .where(eq(tags.name, tagName))
              .then((res) => res[0] || null);

            if (existingTagByName) {
              tagId = existingTagByName.id;
            } else {
              // Create a new tag
              tagId = nanoid();
              await db.insert(tags).values({
                id: tagId,
                name: tagName,
              });
            }
          }
        } else {
          console.error('Invalid tag format:', tagItem);
          continue;
        }

        // Link the tag to the notebook
        await db.insert(notebooksTags).values({
          notebookId,
          tagId: tagId,
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
      // Check if the notebook exists and belongs to the user, but only select basic fields
      const notebookBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(eq(notebooks.id, id))
        .then((res) => res[0] || null);

      if (!notebookBasic || notebookBasic.userId !== userId) {
        return null;
      }

      const { tags: tagNames = [], ...notebookData } = data;

      // Parse content if it's a JSON string
      let contentToStore = '';
      if (typeof notebookData.content === 'string' && notebookData.content.trim() !== '') {
        try {
          // Try to parse as JSON in case it's JSON format
          const contentObj = JSON.parse(notebookData.content);
          contentToStore = JSON.stringify(contentObj);
        } catch (e) {
          // Not JSON, use as is but sanitize
          contentToStore = sanitizeContent(notebookData.content);
        }
      } else if (notebookData.content) {
        // If it's an object, stringify it
        contentToStore = JSON.stringify(notebookData.content);
      }

      // Update the notebook with sanitized content
      const now = new Date();
      const nowTimestamp = dateToSQLiteTimestamp(now);

      console.log('Updating notebook with timestamp:', nowTimestamp, 'Date object:', now);

      try {
        // Try using Drizzle ORM first (should handle date conversion automatically)
        await db
          .update(notebooks)
          .set({
            title: notebookData.title,
            content: contentToStore,
            isPublic: notebookData.isPublic,
            updatedAt: now,
          })
          .where(eq(notebooks.id, id));
      } catch (error) {
        console.error('Error updating notebook with ORM:', error);

        // If ORM update fails, try raw SQL
        await executeRawSQL(
          `UPDATE notebooks
           SET title = ?, content = ?, is_public = ?, updated_at = ?
           WHERE id = ?`,
          [
            notebookData.title,
            contentToStore,
            notebookData.isPublic ? 1 : 0,
            nowTimestamp,
            id
          ]
        );
      }

      // Delete all existing tag links
      await db.delete(notebooksTags).where(eq(notebooksTags.notebookId, id));

      // Create or get tags and link them to the notebook
      for (const tagItem of tagNames) {
        // Handle both tag IDs and tag names
        let tagId, tagName;

        if (typeof tagItem === 'string') {
          // Check if it's a tag ID (existing tag) or a tag name (new tag)
          const existingTag = await db
            .select()
            .from(tags)
            .where(eq(tags.id, tagItem))
            .then((res) => res[0] || null);

          if (existingTag) {
            // It's an existing tag ID
            tagId = tagItem;
            tagName = existingTag.name;
          } else {
            // It's a new tag name
            tagName = tagItem.trim();
            if (!tagName) continue;

            // Validate tag name - don't allow tag names that look like IDs
            // This prevents the issue where IDs are accidentally stored as names
            if (tagName.length > 20 && /^[a-zA-Z0-9_-]+$/.test(tagName)) {
              console.warn('Tag name looks like an ID, skipping:', tagName);
              continue;
            }

            // Check if a tag with this name already exists
            const existingTagByName = await db
              .select()
              .from(tags)
              .where(eq(tags.name, tagName))
              .then((res) => res[0] || null);

            if (existingTagByName) {
              tagId = existingTagByName.id;
            } else {
              // Create a new tag
              tagId = nanoid();
              await db.insert(tags).values({
                id: tagId,
                name: tagName,
              });
            }
          }
        } else {
          console.error('Invalid tag format:', tagItem);
          continue;
        }

        // Link the tag to the notebook
        await db.insert(notebooksTags).values({
          notebookId: id,
          tagId: tagId,
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

      // Get notebooks for the user that match the query with pagination, but only select specific fields
      // This avoids the issue with invalid code points in the content field
      const userNotebooksBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
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

      // Now fetch content separately for each notebook with error handling
      const userNotebooks = await Promise.all(
        userNotebooksBasic.map(async (notebook) => {
          try {
            // Fetch content separately with error handling
            const contentResult = await db
              .select({ content: sql`COALESCE(${notebooks.content}, '')` })
              .from(notebooks)
              .where(eq(notebooks.id, notebook.id))
              .then(res => res[0]?.content || '');

            return {
              ...notebook,
              content: sanitizeContent(contentResult)
            };
          } catch (error) {
            console.error(`Error fetching content for notebook ${notebook.id}:`, error);
            // Return the notebook with empty content if there's an error
            return {
              ...notebook,
              content: 'Content unavailable due to encoding issues'
            };
          }
        })
      );

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        userNotebooks.map(async (notebook) => {
          try {
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
          } catch (error) {
            console.error(`Error fetching tags for notebook ${notebook.id}:`, error);
            return {
              ...notebook,
              tags: [],
            };
          }
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

      // Get full notebook data for each ID using our safer method
      const notebooksWithTags = await Promise.all(
        notebookIds.map(async ({ id }) => {
          try {
            return await this.getNotebookById(id, userId);
          } catch (error) {
            console.error(`Error fetching notebook ${id}:`, error);
            // Return a minimal notebook object if there's an error
            return {
              id,
              title: 'Error loading notebook',
              content: 'Content unavailable due to encoding issues',
              userId,
              isPublic: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              tags: []
            };
          }
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

  /**
   * Get public notebooks
   * @param {number} page - The page number (1-based)
   * @param {number} limit - The number of items per page
   * @returns {Promise<Object>} - A promise that resolves to an object with notebooks and pagination info
   */
  async getPublicNotebooks(page = 1, limit = 20) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(notebooks)
        .where(eq(notebooks.isPublic, 1))
        .then(result => Number(result[0].count));

      // Get public notebooks with pagination but without content
      const publicNotebooksBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
          userName: users.name,
          userUsername: users.username,
          userImage: users.image,
        })
        .from(notebooks)
        .innerJoin(users, eq(notebooks.userId, users.id))
        .where(eq(notebooks.isPublic, 1))
        .orderBy(sql`${notebooks.updatedAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Now fetch content separately for each notebook with error handling
      const publicNotebooks = await Promise.all(
        publicNotebooksBasic.map(async (notebook) => {
          try {
            // Fetch content separately with error handling
            const contentResult = await db
              .select({ content: sql`COALESCE(${notebooks.content}, '')` })
              .from(notebooks)
              .where(eq(notebooks.id, notebook.id))
              .then(res => res[0]?.content || '');

            return {
              ...notebook,
              content: sanitizeContent(contentResult)
            };
          } catch (error) {
            console.error(`Error fetching content for notebook ${notebook.id}:`, error);
            // Return the notebook with empty content if there's an error
            return {
              ...notebook,
              content: 'Content unavailable due to encoding issues'
            };
          }
        })
      );

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        publicNotebooks.map(async (notebook) => {
          const notebookTags = await db
            .select({
              id: tags.id,
              name: tags.name,
            })
            .from(tags)
            .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
            .where(eq(notebooksTags.notebookId, notebook.id));

          return {
            id: notebook.id,
            title: notebook.title,
            content: notebook.content,
            userId: notebook.userId,
            isPublic: notebook.isPublic,
            createdAt: notebook.createdAt,
            updatedAt: notebook.updatedAt,
            user: {
              name: notebook.userName,
              username: notebook.userUsername,
              image: notebook.userImage,
            },
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
      console.error('Error fetching public notebooks:', error);
      throw error;
    }
  },

  /**
   * Get a public notebook by ID
   * @param {string} id - The notebook ID
   * @returns {Promise<Object>} - A promise that resolves to the notebook
   */
  async getPublicNotebookById(id) {
    try {
      // Get the notebook without content
      const notebookBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
          userName: users.name,
          userUsername: users.username,
          userImage: users.image,
        })
        .from(notebooks)
        .innerJoin(users, eq(notebooks.userId, users.id))
        .where(and(
          eq(notebooks.id, id),
          eq(notebooks.isPublic, 1)
        ))
        .then((res) => res[0] || null);

      // Check if the notebook exists and is public
      if (!notebookBasic) {
        return null;
      }

      // Fetch content separately with error handling
      let content = '';
      try {
        const contentResult = await db
          .select({ content: sql`COALESCE(${notebooks.content}, '')` })
          .from(notebooks)
          .where(eq(notebooks.id, id))
          .then(res => res[0]?.content || '');

        content = sanitizeContent(contentResult);
      } catch (error) {
        console.error(`Error fetching content for public notebook ${id}:`, error);
        content = 'Content unavailable due to encoding issues';
      }

      // Get the tags for the notebook
      let notebookTags = [];
      try {
        notebookTags = await db
          .select({
            id: tags.id,
            name: tags.name,
          })
          .from(tags)
          .innerJoin(notebooksTags, eq(tags.id, notebooksTags.tagId))
          .where(eq(notebooksTags.notebookId, id));
      } catch (error) {
        console.error(`Error fetching tags for public notebook ${id}:`, error);
      }

      return {
        id: notebookBasic.id,
        title: notebookBasic.title,
        content: content,
        userId: notebookBasic.userId,
        isPublic: notebookBasic.isPublic,
        createdAt: notebookBasic.createdAt,
        updatedAt: notebookBasic.updatedAt,
        user: {
          name: notebookBasic.userName,
          username: notebookBasic.userUsername,
          image: notebookBasic.userImage,
        },
        tags: notebookTags,
      };
    } catch (error) {
      console.error('Error fetching public notebook:', error);
      throw error;
    }
  },

  /**
   * Get public notebooks by username
   * @param {string} username - The username
   * @param {number} page - The page number (1-based)
   * @param {number} limit - The number of items per page
   * @returns {Promise<Object>} - A promise that resolves to an object with notebooks and pagination info
   */
  async getPublicNotebooksByUsername(username, page = 1, limit = 20) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get the user ID from username
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .then((res) => res[0] || null);

      if (!user) {
        return {
          notebooks: [],
          pagination: {
            page,
            limit,
            totalCount: 0,
            totalPages: 0,
            hasMore: false,
            hasPrevious: false
          }
        };
      }

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(notebooks)
        .where(and(
          eq(notebooks.userId, user.id),
          eq(notebooks.isPublic, 1)
        ))
        .then(result => Number(result[0].count));

      // Get public notebooks for the user with pagination but without content
      const userNotebooksBasic = await db
        .select({
          id: notebooks.id,
          title: notebooks.title,
          userId: notebooks.userId,
          isPublic: notebooks.isPublic,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
        })
        .from(notebooks)
        .where(and(
          eq(notebooks.userId, user.id),
          eq(notebooks.isPublic, 1)
        ))
        .orderBy(sql`${notebooks.updatedAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Now fetch content separately for each notebook with error handling
      const userNotebooks = await Promise.all(
        userNotebooksBasic.map(async (notebook) => {
          try {
            // Fetch content separately with error handling
            const contentResult = await db
              .select({ content: sql`COALESCE(${notebooks.content}, '')` })
              .from(notebooks)
              .where(eq(notebooks.id, notebook.id))
              .then(res => res[0]?.content || '');

            return {
              ...notebook,
              content: sanitizeContent(contentResult)
            };
          } catch (error) {
            console.error(`Error fetching content for notebook ${notebook.id}:`, error);
            // Return the notebook with empty content if there's an error
            return {
              ...notebook,
              content: 'Content unavailable due to encoding issues'
            };
          }
        })
      );

      // Get all tags for each notebook
      const notebooksWithTags = await Promise.all(
        userNotebooks.map(async (notebook) => {
          try {
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
              user: {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
              },
              tags: notebookTags,
            };
          } catch (error) {
            console.error(`Error fetching tags for notebook ${notebook.id}:`, error);
            return {
              ...notebook,
              user: {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
              },
              tags: [],
            };
          }
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
      console.error('Error fetching public notebooks by username:', error);
      throw error;
    }
  },
};

// Export the service as default
export default NotebookService;