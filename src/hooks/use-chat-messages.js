"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook for managing chat messages within a session
 * @param {string} sessionId - ID of the chat session
 * @returns {Object} - Chat messages management functions and state
 */
export function useChatMessages(sessionId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch all messages for a chat session
  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${sessionId}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load conversation messages');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  
  // Send a new message
  const sendMessage = useCallback(async (content, role = 'user') => {
    if (!sessionId) return;
    
    try {
      setSending(true);
      const response = await fetch(`/api/chats/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          role,
          metadata: {} // Optional metadata
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [sessionId]);
  
  // Get AI response for a message
  const getAIResponse = useCallback(async (userMessage) => {
    if (!sessionId) return;
    
    try {
      setSending(true);
      
      // First send the user message
      await sendMessage(userMessage, 'user');
      
      // Then request AI response
      const response = await fetch(`/api/chats/${sessionId}/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const aiMessage = await response.json();
      setMessages(prev => [...prev, aiMessage]);
      return aiMessage;
    } catch (err) {
      // Create an error message
      const errorMessage = {
        content: "Sorry, I couldn't process your request. Please try again.",
        role: 'assistant',
        isError: true,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
      toast.error('Failed to get AI response');
      return errorMessage;
    } finally {
      setSending(false);
    }
  }, [sessionId, sendMessage]);
  
  return {
    messages,
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
    getAIResponse
  };
}
