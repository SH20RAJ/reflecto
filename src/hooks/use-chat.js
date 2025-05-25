"use client";

import { useState, useCallback, useEffect } from 'react';
import { useChatSessions } from './use-chat-sessions';
import { useChatMessages } from './use-chat-messages';

/**
 * A combined hook that provides all chat functionality
 * @returns {Object} - Combined chat functionality
 */
export function useChat() {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const sessionHooks = useChatSessions();
  const messageHooks = useChatMessages(activeSessionId);
  
  const { 
    sessions, 
    createSession, 
    updateSession,
    deleteSession,
    archiveSession,
    restoreSession,
    pinSession,
    unpinSession
  } = sessionHooks;
  
  const {
    messages,
    sending,
    sendMessage,
    getAIResponse
  } = messageHooks;
  
  // Start a new chat session
  const startNewChat = useCallback(async () => {
    try {
      const newSession = await createSession();
      setActiveSessionId(newSession.id);
      return newSession;
    } catch (error) {
      console.error('Failed to start new chat:', error);
      throw error;
    }
  }, [createSession]);
  
  // Open an existing chat session
  const openChat = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId);
  }, []);
  
  // Load messages for the current active session
  useEffect(() => {
    if (activeSessionId) {
      messageHooks.fetchMessages();
    }
  }, [activeSessionId, messageHooks]);
  
  // Send a message and get AI response in one function
  const sendAndGetResponse = useCallback(async (content) => {
    // Create a session if none exists
    if (!activeSessionId) {
      const newSession = await startNewChat();
      setActiveSessionId(newSession.id);
    }
    
    return getAIResponse(content);
  }, [activeSessionId, getAIResponse, startNewChat]);
  
  return {
    // Sessions
    activeSessionId,
    sessions,
    loading: sessionHooks.loading || messageHooks.loading,
    error: sessionHooks.error || messageHooks.error,
    
    // Session actions
    startNewChat,
    openChat,
    updateSession,
    deleteSession,
    archiveSession,
    restoreSession,
    pinSession,
    unpinSession,
    
    // Messages
    messages,
    sending,
    sendMessage,
    getAIResponse,
    sendAndGetResponse
  };
}
