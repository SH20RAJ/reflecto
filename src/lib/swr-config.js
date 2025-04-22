"use client";

import { SWRConfig } from 'swr';

// Fetcher function
const fetcher = async (url) => {
  console.log('Fetching:', url);
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    console.error('Fetch error:', res.status, url);
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    try {
      error.info = await res.json();
    } catch (e) {
      error.info = { message: 'Failed to parse error response' };
    }
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  console.log('Fetch success:', url, data);
  return data;
};

// Global SWR configuration
export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000, // dedupe requests with the same key in this time span
        errorRetryCount: 3, // retry failed requests 3 times
        shouldRetryOnError: true
      }}
    >
      {children}
    </SWRConfig>
  );
};

// Custom hooks for data fetching
export const API_ENDPOINTS = {
  NOTEBOOKS: '/api/notebooks',
  NOTEBOOK: (id) => `/api/notebooks/${id}`,
  TAGS: '/api/tags',
  NOTEBOOKS_BY_TAG: (tagId) => `/api/notebooks?tagId=${tagId}`,
  SEARCH_NOTEBOOKS: (query) => `/api/notebooks?q=${encodeURIComponent(query)}`,
};
