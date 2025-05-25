"use client";

import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Format timestamp for chat messages
const formatMessageTime = (timestamp) => {
  try {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'h:mm a');
  } catch (error) {
    return '';
  }
};

// Single message component
export function ChatMessage({ 
  message, 
  isLast = false,
  showTimestamp = true
}) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  
  return (
    <div className={cn(
      "flex gap-3 py-4",
      isLast && "mb-4"
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isUser ? "bg-blue-600" : "bg-purple-600"
      )}>
        {!isUser && <AvatarImage src="/reflecto-logo.svg" alt="Luna AI" />}
        <AvatarFallback className="text-white">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'Luna AI'}
          </span>
          {showTimestamp && (
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.createdAt || message.timestamp)}
            </span>
          )}
          {isError && (
            <span className="flex items-center text-xs text-red-500 gap-1">
              <AlertCircle className="h-3 w-3" />
              Error
            </span>
          )}
        </div>
        
        <div className={cn(
          "mt-1 text-sm",
          isError && "text-red-500"
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Component to display message groups with date headers
export function ChatMessagesList({ messages = [] }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-8 text-gray-500">
        <p>Start a conversation with Luna AI</p>
      </div>
    );
  }
  
  const messagesByDate = messages.reduce((groups, message) => {
    // Get date string for grouping
    const timestamp = message.createdAt || message.timestamp || new Date();
    const dateStr = new Date(timestamp).toDateString();
    
    // Add message to appropriate date group
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(message);
    
    return groups;
  }, {});

  // Format date header
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(messagesByDate).map(([dateStr, dateMessages], dateIndex) => (
        <div key={dateStr} className="flex flex-col">
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-500">
              {formatDateHeader(dateStr)}
            </div>
          </div>
          
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {dateMessages.map((message, messageIndex) => (
              <ChatMessage
                key={message.id || `${dateStr}-${messageIndex}`}
                message={message}
                isLast={messageIndex === dateMessages.length - 1}
                showTimestamp={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
