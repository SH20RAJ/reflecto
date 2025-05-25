"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook for managing chat sessions
 * @returns {Object} - Chat sessions management functions and state
 */
export function useChatSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all chat sessions for the current user
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Create a new chat session
  const createSession = useCallback(async (title = 'New Conversation') => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }
      
      const newSession = await response.json();
      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      toast.error('Failed to create new conversation');
      throw err;
    }
  }, []);
  
  // Update a chat session
  const updateSession = useCallback(async (sessionId, updates) => {
    try {
      const response = await fetch(`/api/chats/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update chat session');
      }
      
      const updatedSession = await response.json();
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? updatedSession : session
        )
      );
      return updatedSession;
    } catch (err) {
      toast.error('Failed to update conversation');
      throw err;
    }
  }, []);
  
  // Delete a chat session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`/api/chats/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chat session');
      }
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Conversation deleted');
      return true;
    } catch (err) {
      toast.error('Failed to delete conversation');
      throw err;
    }
  }, []);
  
  // Archive a session
  const archiveSession = useCallback(async (sessionId) => {
    return updateSession(sessionId, { isArchived: true });
  }, [updateSession]);
  
  // Restore an archived session
  const restoreSession = useCallback(async (sessionId) => {
    return updateSession(sessionId, { isArchived: false });
  }, [updateSession]);
  
  // Pin a session
  const pinSession = useCallback(async (sessionId) => {
    return updateSession(sessionId, { isPinned: true });
  }, [updateSession]);
  
  // Unpin a session
  const unpinSession = useCallback(async (sessionId) => {
    return updateSession(sessionId, { isPinned: false });
  }, [updateSession]);
  
  // Load sessions when component mounts
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    archiveSession,
    restoreSession,
    pinSession,
    unpinSession,
  };
}
