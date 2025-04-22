import prisma from '@/lib/prisma';

/**
 * Service for handling notebook operations
 */
export const NotebookService = {
  /**
   * Get all notebooks for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - A promise that resolves to an array of notebooks
   */
  async getUserNotebooks(userId) {
    try {
      const notebooks = await prisma.notebook.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          tags: true,
        },
      });
      return notebooks;
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
      const notebook = await prisma.notebook.findUnique({
        where: {
          id: id,
        },
        include: {
          tags: true,
        },
      });

      // Check if the notebook exists and belongs to the user
      if (!notebook || notebook.userId !== userId) {
        return null;
      }

      return notebook;
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
      // Extract tags from the data
      const { tags, ...notebookData } = data;
      
      // Create the notebook with tags
      const notebook = await prisma.notebook.create({
        data: {
          ...notebookData,
          userId,
          tags: {
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tags: true,
        },
      });
      
      return notebook;
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
      const existingNotebook = await prisma.notebook.findUnique({
        where: { id },
        include: { tags: true },
      });

      if (!existingNotebook || existingNotebook.userId !== userId) {
        return null;
      }

      // Extract tags from the data
      const { tags, ...notebookData } = data;
      
      // Update the notebook
      const updatedNotebook = await prisma.notebook.update({
        where: { id },
        data: {
          ...notebookData,
          tags: {
            // Disconnect all existing tags
            disconnect: existingNotebook.tags.map(tag => ({ id: tag.id })),
            // Connect or create new tags
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tags: true,
        },
      });
      
      return updatedNotebook;
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
      const notebook = await prisma.notebook.findUnique({
        where: { id },
      });

      if (!notebook || notebook.userId !== userId) {
        return false;
      }

      // Delete the notebook
      await prisma.notebook.delete({
        where: { id },
      });
      
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
  async searchNotebooks(query, userId) {
    try {
      const notebooks = await prisma.notebook.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          tags: true,
        },
      });
      
      return notebooks;
    } catch (error) {
      console.error('Error searching notebooks:', error);
      throw error;
    }
  },
};
