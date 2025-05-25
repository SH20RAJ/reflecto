"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = "Type your message...",
  disabled = false,
  autoFocus = true
}) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) return;
    
    onSend(message.trim());
    setMessage('');
    
    // Reset the textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift key)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Auto-resize textarea
  const handleInput = (e) => {
    const textarea = e.target;
    
    // Reset height to auto to get the proper scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height based on scrollHeight, with a max height
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col px-4 py-3 bg-white dark:bg-gray-950 border-t"
    >
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            className="resize-none py-3 pr-10 min-h-[60px] max-h-[200px]"
            rows={1}
          />
        </div>
        
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>Press Enter to send, Shift+Enter for a new line</p>
      </div>
    </form>
  );
}
