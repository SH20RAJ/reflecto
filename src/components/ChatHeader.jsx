"use client";

import React, { useState, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { 
  Edit2, 
  Save, 
  X, 
  Archive, 
  ArchiveRestore, 
  Pin, 
  PinOff, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

export function ChatHeader({ 
  onToggleSidebar 
}) {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const { 
    activeSessionId, 
    sessions, 
    updateSession,
    archiveSession,
    restoreSession,
    pinSession,
    unpinSession,
    deleteSession
  } = useChat();
  
  const inputRef = useRef(null);
  
  // Get the active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const sessionTitle = activeSession?.title || 'New conversation';
  const isArchived = activeSession?.isArchived || false;
  const isPinned = activeSession?.isPinned || false;
  
  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };
  
  const handleSave = async () => {
    if (!activeSessionId || !inputRef.current) return;
    
    const newTitle = inputRef.current.value.trim();
    if (newTitle) {
      await updateSession(activeSessionId, { title: newTitle });
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };
  
  // If no active session, render a simple header
  if (!activeSessionId || !activeSession) {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-950">
        <h2 className="text-xl font-semibold">Chat with Luna AI</h2>
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-950">
      <div className="flex-1 flex items-center">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              ref={inputRef}
              defaultValue={sessionTitle}
              className="h-9"
              onKeyDown={handleKeyDown}
              placeholder="Conversation title..."
              maxLength={100}
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold truncate">{sessionTitle}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditClick}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPinned ? (
                <DropdownMenuItem onClick={() => unpinSession(activeSessionId)}>
                  <PinOff className="h-4 w-4 mr-2" />
                  Unpin conversation
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => pinSession(activeSessionId)}>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin conversation
                </DropdownMenuItem>
              )}
              
              {isArchived ? (
                <DropdownMenuItem onClick={() => restoreSession(activeSessionId)}>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore from archive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => archiveSession(activeSessionId)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive conversation
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={() => deleteSession(activeSessionId)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
