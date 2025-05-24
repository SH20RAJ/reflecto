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
  Save,
  Tag,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  X,
  Plus,
  MessageCircle,
  ArrowLeft,
  PencilRuler,
  Share2,
  Download,
  Star,
  StarOff,
  MoreVertical,
  Sparkles,
  Info,
  Menu
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import NotebookChat from '@/components/NotebookChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Minimalist tag input component
const MinimalistTagInput = ({ selectedTags, setSelectedTags, allTags, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Filter available tags based on input and already selected tags
  const filteredTags = allTags
    ? allTags.filter(tag => {
        const alreadySelected = selectedTags.some(selectedTag => selectedTag.id === tag.id);
        const matchesInput = tag.name.toLowerCase().includes(inputValue.toLowerCase());
        return !alreadySelected && matchesInput;
      })
    : [];

  // Add an existing tag
  const handleAddTag = (tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
      setInputValue('');
    }
  };

  // Create and add a new tag
  const handleCreateTag = () => {
    if (inputValue.trim()) {
      const newTag = {
        id: `new-${Date.now()}`, // Temporary ID for new tag
        name: inputValue.trim()
      };
      setSelectedTags([...selectedTags, newTag]);
      setInputValue('');
    }
  };

  // Remove a tag
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

// AI Sidebar Component (for notebook insights)
const AISidebar = ({ notebook, content }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setInsights({
        sentiment: 'Positive',
        mainTopics: ['Work', 'Goals', 'Productivity', 'Personal Growth'],
        wordCount: content?.split(/\s+/).filter(Boolean).length || 0,
        keyInsights: [
          'You seem focused on professional growth',
          'There are signs of increased optimism from previous entries',
          'Several action items mentioned could be added to your task list',
          'Consider exploring the productivity techniques mentioned in more depth'
        ],
        suggestedTags: ['work-life', 'goals', 'productivity', 'growth', 'reflection'],
        readingTime: Math.max(1, Math.round(content?.split(/\s+/).filter(Boolean).length / 200)) || 1,
        recommendations: [
          'Try breaking down your larger goals into smaller milestones',
          'Consider adding more specific examples to support your reflections'
        ]
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [content]);

  const handleAddSuggestedTag = (tagName) => {
    // Only add the tag if it doesn't already exist
    if (!selectedTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      const newTag = {
        id: `new-${Date.now()}`,
        name: tagName
      };
      setSelectedTags(prevTags => [...prevTags, newTag]);
      // Could add a toast notification here
    }
  };

  return (
    <motion.div 
      className="h-full overflow-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-border/10 bg-gradient-to-r from-background via-background to-muted/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Luna AI Insights
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-powered analysis of your notebook content to help you gain deeper insights.
        </p>
      </div>
      
      <div className="p-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent"
            />
            <p className="mt-4 text-sm text-muted-foreground">Analyzing your notebook...</p>
            <p className="mt-2 text-xs text-muted-foreground">Luna is reviewing your content for insights</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights" className="space-y-5 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/10 hover:border-border/30 transition-colors">
                      <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                      <div className="font-medium text-sm flex items-center">
                        <motion.span 
                          className="h-2.5 w-2.5 bg-green-500 rounded-full mr-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.span>
                        {insights.sentiment}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/10 hover:border-border/30 transition-colors">
                      <div className="text-xs text-muted-foreground mb-1">Reading Time</div>
                      <div className="font-medium text-sm flex items-center">
                        <motion.span className="text-primary mr-1">📖</motion.span>
                        {insights.readingTime} min read
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      Main Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.mainTopics.map((topic, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="px-2 py-0.5 bg-gradient-to-r from-secondary/40 to-secondary hover:from-secondary/50 hover:to-secondary/90 transition-all duration-300"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-500" />
                      Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {insights.keyInsights.map((insight, i) => (
                        <motion.li 
                          key={i} 
                          className="text-sm bg-muted/20 p-2.5 rounded-md border-l-2 border-primary/40 hover:bg-muted/40 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {insight}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <MessageCircle className="h-3.5 w-3.5 mr-2 text-blue-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec, i) => (
                        <motion.li 
                          key={i} 
                          className="text-sm bg-muted/20 p-2.5 rounded-md border-l-2 border-blue-500/40 hover:bg-muted/40 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          {rec}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-5 mt-0">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Word Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-muted/20 p-2 rounded-sm">
                        <span className="text-xs">Word Count</span>
                        <span className="text-xs font-medium">{insights.wordCount} words</span>
                      </div>
                      <div className="flex justify-between items-center bg-muted/20 p-2 rounded-sm">
                        <span className="text-xs">Created</span>
                        <span className="text-xs font-medium">{notebook?.createdAt ? format(new Date(notebook.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-muted/20 p-2 rounded-sm">
                        <span className="text-xs">Status</span>
                        <Badge variant={notebook?.isPublic ? "secondary" : "outline"} className="text-xs">
                          {notebook?.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Suggested Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.suggestedTags.map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                          + {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="pt-3 border-t border-border/20">
              <Button variant="outline" className="w-full justify-center gap-2 text-primary hover:bg-primary/5 transition-colors">
                <MessageCircle className="h-4 w-4" />
                Ask Luna about this entry
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function PremiumNotebookPage({ params }) {
  const unwrappedParams = React.use(params);
  const notebookId = unwrappedParams.id;

  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [notebook, setNotebook] = useState(null);
  const [editorData, setEditorData] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  const [confirDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Fetch all available tags
  const { tags: allTags } = useTags();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setTitle(data.title);
      setSelectedTags(data.tags || []);
      setIsStarred(data.isStarred || false);

      // Set editor data from content
      if (typeof data.content === 'string' && data.content) {
        // Simply set the content as is - the editor will handle markdown formatting
        setEditorData(data.content);
      } else {
        // Set empty editor data
        setEditorData('');
      }
    } catch (error) {
      console.error('Error fetching notebook:', error);
      toast.error("Error loading notebook");
    } finally {
      setIsLoading(false);
    }
  }, [notebookId, router]);

  useEffect(() => {
    if (isAuthenticated && notebookId) {
      fetchNotebook();
    } else if (status === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, notebookId, status, fetchNotebook, router]);

  const handleEditorSave = async (isAutoSave = false) => {
    try {
      if (!isAutoSave) {
        setIsSaving(true);
      }

      // Process tags correctly - extract tag names for new tags and IDs for existing tags
      const processedTags = selectedTags.map(tag => {
        // If it's a new tag (has a temporary ID starting with 'new-'), send the name
        if (tag.id.startsWith('new-')) {
          return tag.name;
        }
        // Otherwise, send the ID for existing tags
        return tag.id;
      });

      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: editorData,
          tags: processedTags,
          isStarred,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notebook');
      }

      const updatedNotebook = await response.json();
      setNotebook(updatedNotebook);
      setLastSaved(new Date());

      if (!isAutoSave) {
        toast.success("Notebook saved successfully");
      }
    } catch (error) {
      console.error('Error updating notebook:', error);
      if (!isAutoSave) {
        toast.error("Failed to save notebook");
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notebook');
      }

      toast.success("Notebook deleted successfully");
      router.push('/notebooks');
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error("Failed to delete notebook");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteDialog(false);
    }
  };

  const togglePublicStatus = async () => {
    try {
      const newStatus = !notebook.isPublic;
      
      const response = await fetch(`/api/notebooks/${notebookId}/public`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update public status');
      }

      setNotebook({ ...notebook, isPublic: newStatus });
      toast.success(`Notebook is now ${newStatus ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error updating public status:', error);
      toast.error("Failed to update status");
    }
  };

  // Toggle starred status
  const toggleStarred = () => {
    setIsStarred(!isStarred);
    // We'll save this when the notebook is saved
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-16 w-16 rounded-full border-2 border-t-primary border-r-transparent border-b-primary/20 border-l-transparent" />
        </motion.div>
        <p className="mt-4 text-muted-foreground">Loading notebook...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-10 border-b border-border/10 bg-background/95 backdrop-blur">
        <div className="container max-w-full px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8" 
              onClick={() => router.push('/notebooks')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium focus-visible:ring-transparent border-none bg-transparent px-0 h-9 w-full max-w-md"
              placeholder="Untitled Notebook"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Last saved indicator (subtle) */}
            {lastSaved && (
              <span className="text-xs text-muted-foreground mr-2 hidden sm:inline-block">
                Saved {format(lastSaved, 'h:mm a')}
              </span>
            )}
            
            {/* Only most important actions in header */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleStarred}
                  >
                    {isStarred ? (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isStarred ? 'Remove from starred' : 'Add to starred'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant={isSidebarOpen ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Info className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleEditorSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline-block ml-1">Save</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('editor')}>
                  <PencilRuler className="h-4 w-4 mr-2" />
                  <span>Editor</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('chat')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Chat with Luna</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    <span>Public</span>
                  </div>
                  <div className="flex items-center h-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 p-0" 
                      onClick={togglePublicStatus}
                    >
                      {notebook?.isPublic ? (
                        <span className="text-xs text-green-500">On</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Off</span>
                      )}
                    </Button>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  <span>Export</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 dark:text-red-400" 
                  onClick={() => setConfirmDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 w-full">
          <div className="h-full">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="editor" className="mt-0 h-full px-4 py-2">
                <div className="h-full flex flex-col">
                  {/* Tag Manager - Simplified */}
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <MinimalistTagInput 
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                      allTags={allTags}
                    />
                  </div>
                  
                  {/* Editor Area - Maximized */}
                  <div className="flex-1 rounded-md">
                    <textarea 
                      className="w-full h-full text-lg leading-relaxed resize-none border-none focus:outline-none focus:ring-0 p-1"
                      value={editorData || ''}
                      onChange={(e) => {
                        setEditorData(e.target.value);
                        if (autoSaveEnabled) {
                          // Debounced auto-save would go here
                        }
                      }}
                      placeholder="Start writing your thoughts here..."
                    ></textarea>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0 h-full px-4 py-2">
                <div className="rounded-md h-full overflow-hidden">
                  <NotebookChat 
                    notebookId={notebookId} 
                    initialContent={notebook?.content || ''}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right Sidebar with AI Insights */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              className="w-80 border-l border-border/10 h-[calc(100vh-50px)] sticky top-[50px]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AISidebar
                notebook={notebook}
                content={editorData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently delete "{title || 'Untitled'}" from your notebooks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
