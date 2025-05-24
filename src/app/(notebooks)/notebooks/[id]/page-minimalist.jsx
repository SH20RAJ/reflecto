"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useTags } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  Save, Clock, Tag, ChevronLeft, Trash2, Loader2,
  Eye, EyeOff, X, Plus, MessageCircle, Star, StarOff,
  MoreVertical, Sparkles
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import NotebookChat from '@/components/NotebookChat';

// Minimalist tag input component
const MinimalistTagInput = ({ selectedTags, setSelectedTags, allTags, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const filteredTags = allTags
    ? allTags.filter(tag => {
        const alreadySelected = selectedTags.some(selectedTag => selectedTag.id === tag.id);
        const matchesInput = tag.name.toLowerCase().includes(inputValue.toLowerCase());
        return !alreadySelected && matchesInput;
      })
    : [];

  const handleAddTag = (tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
      setInputValue('');
    }
  };

  const handleCreateTag = () => {
    if (inputValue.trim()) {
      const newTag = {
        id: `new-${Date.now()}`,
        name: inputValue.trim()
      };
      setSelectedTags([...selectedTags, newTag]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagId) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  return (
    <div className="relative flex items-center gap-2">
      {selectedTags.map(tag => (
        <Badge 
          key={tag.id} 
          variant="outline" 
          className="px-2 py-0.5 h-6 text-xs gap-1"
        >
          <span>{tag.name}</span>
          {!disabled && (
            <button 
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Remove ${tag.name} tag`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}
      
      {!disabled && (
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
            placeholder={selectedTags.length ? "Add tag..." : "Add tags..."}
            className="h-6 min-w-[100px] max-w-[150px] border-none bg-transparent text-xs focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTag();
              }
            }}
          />
          
          {showTagSuggestions && inputValue && filteredTags.length > 0 && (
            <AnimatePresence>
              <motion.div 
                className="absolute top-full left-0 mt-1 w-48 z-10 bg-popover shadow-md rounded-md border border-border/20 p-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <div className="max-h-40 overflow-auto">
                  {filteredTags.slice(0, 5).map(tag => (
                    <div
                      key={tag.id}
                      className="px-2 py-1 text-xs hover:bg-muted/50 rounded-sm cursor-pointer flex items-center justify-between"
                      onMouseDown={() => handleAddTag(tag)}
                    >
                      <span>{tag.name}</span>
                    </div>
                  ))}
                  {inputValue.trim() && !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
                    <div
                      className="px-2 py-1 text-xs hover:bg-muted/50 rounded-sm cursor-pointer flex items-center text-primary"
                      onMouseDown={handleCreateTag}
                    >
                      <Plus className="h-2.5 w-2.5 mr-1" /> Create "{inputValue}"
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
};

// AI Insights Panel - Only shown when requested
const AIInsights = ({ notebook, content, isVisible, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    // Simulate loading insights
    setIsLoading(true);
    setTimeout(() => {
      setInsights({
        sentiment: "Positive",
        wordCount: content?.split(/\s+/).filter(Boolean).length || 0,
        mainTopics: ["Productivity", "Learning", "Self-reflection"],
        keyInsights: [
          "Consistent focus on personal growth throughout the entry",
          "Several references to new skills being developed",
          "Pattern of positive reflection on challenges"
        ],
        suggestedTags: ["productivity", "learning", "growth", "reflection"]
      });
      setIsLoading(false);
    }, 1500);
  }, [content]);

  if (!isVisible) return null;

  return (
    <motion.div 
      className="fixed inset-y-0 right-0 w-72 bg-background border-l border-border/20 shadow-lg p-4 z-30"
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      exit={{ x: 300 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-primary/70" />
          Notebook Insights
        </h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-xs text-muted-foreground">Analyzing your notebook...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 p-2 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
              <div className="text-xs flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                {insights.sentiment}
              </div>
            </div>
            <div className="bg-muted/30 p-2 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Words</div>
              <div className="text-xs">{insights.wordCount}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs font-medium">Main Topics</h4>
            <div className="flex flex-wrap gap-1">
              {insights.mainTopics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="px-1.5 py-0.5 text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-1">Key Insights</h4>
            <ul className="space-y-1.5">
              {insights.keyInsights.map((insight, i) => (
                <li key={i} className="text-xs bg-muted/20 p-1.5 rounded-md border-l-2 border-primary/30">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-1">Suggested Tags</h4>
            <div className="flex flex-wrap gap-1">
              {insights.suggestedTags.map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/20 mt-3">
            <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 text-xs text-primary">
              <MessageCircle className="h-3 w-3" />
              Ask Luna about this entry
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function MinimalistNotebookPage({ params }) {
  const unwrappedParams = React.use(params);
  const notebookId = unwrappedParams.id;
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const textareaRef = useRef(null);
  
  // Core notebook state
  const [notebook, setNotebook] = useState(null);
  const [editorData, setEditorData] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  // Fetch all available tags
  const { tags: allTags } = useTags();

  const fetchNotebook = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks/${notebookId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Notebook not found");
          router.push('/notebooks');
          return;
        }
        throw new Error('Failed to fetch notebook');
      }

      const data = await response.json();
      setNotebook(data);
      setTitle(data.title || 'Untitled');
      setSelectedTags(data.tags || []);
      setIsStarred(data.isStarred || false);
      setIsPublic(data.isPublic || false);

      // Set editor data from content
      setEditorData(typeof data.content === 'string' ? data.content : '');
    } catch (error) {
      console.error('Error fetching notebook:', error);
      toast.error("Failed to load notebook");
    } finally {
      setIsLoading(false);
    }
  }, [notebookId, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotebook();
    } else if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [fetchNotebook, isAuthenticated, notebookId, status, router]);

  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: editorData,
          tags: selectedTags,
          isPublic,
          isStarred
        }),
      });

      if (!response.ok) throw new Error('Failed to save notebook');
      
      const updatedData = await response.json();
      setNotebook(updatedData);
      setLastSaved(new Date());
      toast.success('Notebook saved');
    } catch (error) {
      console.error('Error saving notebook:', error);
      toast.error('Failed to save notebook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notebook');
      
      toast.success('Notebook deleted');
      router.push('/notebooks');
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error('Failed to delete notebook');
    }
  };

  const toggleStarred = () => {
    setIsStarred(prev => !prev);
  };

  const togglePublicStatus = () => {
    setIsPublic(prev => !prev);
  };

  const focusEditor = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Minimal header bar */}
      <header className="border-b border-border/20 h-14 flex items-center px-4 sticky top-0 z-10 bg-background/95 backdrop-blur-md">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => router.push('/notebooks')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 w-[250px] text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-medium py-0"
              placeholder="Untitled"
            />
          </div>
          
          <div className="flex items-center gap-1">
            {/* Status indicators */}
            <div className="text-xs text-muted-foreground mr-2 hidden sm:flex items-center gap-1">
              {lastSaved && (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Saved {format(new Date(lastSaved), 'h:mm a')}</span>
                </>
              )}
            </div>
            
            {/* Tag display on header */}
            <div className="hidden md:block mr-2">
              <MinimalistTagInput
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                allTags={allTags}
              />
            </div>

            {/* Mode toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setIsChatMode(!isChatMode)}
                  >
                    {isChatMode ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isChatMode ? 'Switch to Editor' : 'Switch to Chat'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Insights button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setShowInsights(true)}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show Insights</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Star button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={toggleStarred}
                  >
                    {isStarred ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isStarred ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Save button */}
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 text-xs gap-1 ml-1"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save
            </Button>

            {/* Options menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={togglePublicStatus}>
                  {isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {isPublic ? 'Make Private' : 'Make Public'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleStarred}>
                  {isStarred ? <StarOff className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                  {isStarred ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Notebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Tags on mobile */}
        <div className="block md:hidden px-4 py-2 border-b border-border/10">
          <MinimalistTagInput
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          />
        </div>
        
        {/* Editor/Chat content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto h-full max-w-3xl px-5 py-5">
            <AnimatePresence mode="wait">
              {isChatMode ? (
                <motion.div 
                  key="chat" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <NotebookChat 
                    notebookId={notebookId}
                    initialContent={notebook?.content || ''}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="editor" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-full"
                  onClick={focusEditor}
                >
                  <textarea
                    ref={textareaRef}
                    className="w-full h-full min-h-[calc(100vh-180px)] text-base leading-relaxed resize-none border-none focus:outline-none focus:ring-0 bg-transparent p-0"
                    value={editorData}
                    onChange={(e) => setEditorData(e.target.value)}
                    placeholder="Start writing your thoughts here..."
                  ></textarea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      {/* AI Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <AIInsights 
            notebook={notebook}
            content={editorData}
            isVisible={showInsights}
            onClose={() => setShowInsights(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notebook and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
