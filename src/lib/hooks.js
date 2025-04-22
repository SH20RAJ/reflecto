"use client";

import useSWR from 'swr';
import { API_ENDPOINTS } from './swr-config';

/**
 * Hook to fetch notebooks with pagination
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Object} - The notebooks data, loading state, and error
 */
export function useNotebooks(page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_ENDPOINTS.NOTEBOOKS}?page=${page}&limit=${limit}`
  );

  return {
    notebooks: data?.notebooks || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasMore: false,
      hasPrevious: false
    },
    isLoading,
    isError: error,
    mutate
  };
}

/**
 * Hook to fetch a notebook by ID
 * @param {string} id - The notebook ID
 * @returns {Object} - The notebook data, loading state, and error
 */
export function useNotebook(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? API_ENDPOINTS.NOTEBOOK(id) : null
  );

  return {
    notebook: data,
    isLoading,
    isError: error,
    mutate
  };
}

/**
 * Hook to fetch all tags
 * @returns {Object} - The tags data, loading state, and error
 */
export function useTags() {
  const { data, error, isLoading, mutate } = useSWR(API_ENDPOINTS.TAGS);

  return {
    tags: data || [],
    isLoading,
    isError: error,
    mutate
  };
}

/**
 * Hook to fetch notebooks by tag
 * @param {string} tagId - The tag ID
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Object} - The notebooks data, loading state, and error
 */
export function useNotebooksByTag(tagId, page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    tagId ? `${API_ENDPOINTS.NOTEBOOKS_BY_TAG(tagId)}&page=${page}&limit=${limit}` : null
  );

  return {
    notebooks: data?.notebooks || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasMore: false,
      hasPrevious: false
    },
    isLoading,
    isError: error,
    mutate
  };
}

/**
 * Hook to search notebooks
 * @param {string} query - The search query
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Object} - The notebooks data, loading state, and error
 */
export function useSearchNotebooks(query, page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    query ? `${API_ENDPOINTS.SEARCH_NOTEBOOKS(query)}&page=${page}&limit=${limit}` : null
  );

  return {
    notebooks: data?.notebooks || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasMore: false,
      hasPrevious: false
    },
    isLoading,
    isError: error,
    mutate
  };
}
