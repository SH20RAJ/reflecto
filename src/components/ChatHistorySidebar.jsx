"use client";

import React, { useState } from 'react';
import { useChat } from '@/hooks/use-chat';
import { 
  PlusCircle, MessageSquare, Archive, Pin, Trash2, 
  Search, Menu, X, MoreVertical, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    return 'Unknown date';
  }
}

const ChatSessionItem = ({ 
  session, 
  isActive, 
  onClick, 
  onPin, 
  onUnpin, 
  onArchive, 
  onDelete 
}) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 mb-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={() => onClick(session.id)}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-sm truncate">{session.title || 'New conversation'}</p>
            {session.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {formatDate(session.lastMessageAt || session.createdAt)}
          </p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {session.isPinned ? (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onUnpin(session.id);
            }}>
              Unpin conversation
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onPin(session.id);
            }}>
              Pin conversation
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onArchive(session.id);
          }}>
            Archive conversation
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="text-red-600">
            Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function ChatHistorySidebar({ className = "" }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const { 
    activeSessionId,
    sessions,
    loading,
    openChat,
    startNewChat,
    pinSession,
    unpinSession,
    archiveSession,
    restoreSession,
    deleteSession
  } = useChat();
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  if (isMobile && !isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-30"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>
    );
  }
  
  // Filter sessions based on search query and archived status
  const filteredSessions = sessions
    .filter(session => !showArchived ? !session.isArchived : session.isArchived)
    .filter(session => 
      session.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Separate pinned and non-pinned sessions
  const pinnedSessions = filteredSessions.filter(session => session.isPinned);
  const unpinnedSessions = filteredSessions.filter(session => !session.isPinned);
  
  return (
    <div className={`flex flex-col border-r bg-white dark:bg-gray-950 h-full ${isOpen ? 'w-64' : 'w-0'} transition-all duration-200 ${className}`}>
      {isOpen && (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Chat History</h2>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="p-3">
            <Button 
              variant="default" 
              className="w-full flex items-center justify-center gap-2"
              onClick={startNewChat}
            >
              <PlusCircle className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          
          <div className="p-3 pt-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search conversations"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between px-3 py-1">
            <Button 
              variant="ghost" 
              className={`text-xs ${!showArchived ? 'font-bold' : ''}`}
              onClick={() => setShowArchived(false)}
            >
              Active
            </Button>
            <Button 
              variant="ghost" 
              className={`text-xs ${showArchived ? 'font-bold' : ''}`}
              onClick={() => setShowArchived(true)}
            >
              Archived
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3">
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-500">Loading conversations...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  {showArchived 
                    ? 'No archived conversations' 
                    : 'No conversations yet'}
                </div>
              ) : (
                <>
                  {/* Pinned sessions */}
                  {pinnedSessions.length > 0 && (
                    <>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>Pinned</span>
                        <Separator className="ml-2 flex-1" />
                      </div>
                      {pinnedSessions.map(session => (
                        <ChatSessionItem 
                          key={session.id}
                          session={session}
                          isActive={session.id === activeSessionId}
                          onClick={openChat}
                          onPin={pinSession}
                          onUnpin={unpinSession}
                          onArchive={archiveSession}
                          onDelete={deleteSession}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Unpinned sessions */}
                  {unpinnedSessions.length > 0 && (
                    <>
                      {pinnedSessions.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 my-2">
                          <span>{showArchived ? 'Archived' : 'Other'}</span>
                          <Separator className="ml-2 flex-1" />
                        </div>
                      )}
                      
                      {unpinnedSessions.map(session => (
                        <ChatSessionItem
                          key={session.id}
                          session={session}
                          isActive={session.id === activeSessionId}
                          onClick={openChat}
                          onPin={pinSession}
                          onUnpin={unpinSession}
                          onArchive={showArchived ? restoreSession : archiveSession}
                          onDelete={deleteSession}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
