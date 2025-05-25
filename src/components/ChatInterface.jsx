"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import ChatHistorySidebar from './ChatHistorySidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessagesList } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ChatInterface() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const scrollRef = useRef(null);
  
  const {
    activeSessionId,
    sessions,
    messages,
    loading,
    sending,
    startNewChat,
    openChat,
    sendAndGetResponse
  } = useChat();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);
  
  // Handle message submission
  const handleSendMessage = async (message) => {
    try {
      if (!activeSessionId) {
        await startNewChat();
      }
      await sendAndGetResponse(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar className={sidebarOpen || !isMobile ? 'block' : 'hidden'} />
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader onToggleSidebar={toggleSidebar} />
        
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea ref={scrollRef} className="h-full">
            <div className="px-4 py-6">
              <ChatMessagesList messages={messages} />
            </div>
          </ScrollArea>
        </div>
        
        <ChatInput
          onSend={handleSendMessage}
          isLoading={sending}
          disabled={loading}
        />
      </div>
    </div>
  );
}
