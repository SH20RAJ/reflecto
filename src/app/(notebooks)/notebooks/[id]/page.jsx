"use client";

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useTags } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  Save,
  Calendar,
  Clock,
  Tag,
  MoreVertical,
  ChevronLeft,
  ArrowLeft,
  Share2,
  Download,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  X,
  Plus,
  Search,
  StickyNote,
  MessageSquare,
  MessageCircle,
  Star,
  StarOff,
  PencilRuler,
  UserRound,
  AlignJustify,
  Settings,
  Sparkles
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Premium tag input component
const PremiumTagInput = ({ selectedTags, setSelectedTags, allTags, disabled }) => {
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
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg min-h-[46px] border border-border/30 mb-1">
        {selectedTags.map(tag => (
          <Badge 
            key={tag.id} 
            variant="secondary" 
            className="px-2 py-0.5 h-7 gap-1 group"
          >
            <span>{tag.name}</span>
            {!disabled && (
              <button 
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove ${tag.name} tag`}
              >
                <X className="h-3 w-3" />
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
              placeholder={selectedTags.length ? "Add another tag..." : "Add tags..."}
              className="h-7 min-w-[120px] max-w-[200px] border-none bg-transparent px-1 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  className="absolute top-full left-0 mt-1 w-48 z-10 bg-popover shadow-md rounded-md border border-border p-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <div className="max-h-40 overflow-auto py-1">
                    {filteredTags.slice(0, 5).map(tag => (
                      <div
                        key={tag.id}
                        className="px-2 py-1.5 text-sm hover:bg-muted rounded-sm cursor-pointer flex items-center justify-between"
                        onMouseDown={() => handleAddTag(tag)}
                      >
                        <span>{tag.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          {tag.count || 0}
                        </Badge>
                      </div>
                    ))}
                    {inputValue.trim() && !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
                      <div
                        className="px-2 py-1.5 text-sm hover:bg-muted rounded-sm cursor-pointer flex items-center text-primary"
                        onMouseDown={handleCreateTag}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Create "{inputValue}"
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
      {!disabled && (
        <p className="text-xs text-muted-foreground px-2">
          Type and press Enter to create a new tag
        </p>
      )}
    </div>
  );
};

// AI Sidebar Component (for notebook insights)
const AISidebar = ({ notebook, content }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setInsights({
        sentiment: 'Positive',
        mainTopics: ['Work', 'Goals', 'Productivity'],
        wordCount: content?.split(/\s+/).filter(Boolean).length || 0,
        keyInsights: [
          'You seem focused on professional growth',
          'There are signs of increased optimism from previous entries',
          'Several action items mentioned could be added to your task list'
        ],
        suggestedTags: ['work-life', 'goals', 'productivity']
      });
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content]);

  return (
    <motion.div 
      className="border-l border-border/30 h-full overflow-auto p-5 space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary/70" />
          Notebook Insights
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent"
          />
          <p className="mt-4 text-sm text-muted-foreground">Analyzing your notebook...</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
              <div className="font-medium text-sm flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                {insights.sentiment}
              </div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Word Count</div>
              <div className="font-medium text-sm">{insights.wordCount} words</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Main Topics</h4>
            <div className="flex flex-wrap gap-2">
              {insights.mainTopics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="px-2 py-1">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Key Insights</h4>
            <ul className="space-y-2">
              {insights.keyInsights.map((insight, i) => (
                <li key={i} className="text-sm bg-muted/20 p-2 rounded-md border-l-2 border-primary/30">
                  {insight}
                </li>
              ))}
            </ul>
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
          
          <div className="pt-3 border-t border-border/20">
            <Button variant="outline" className="w-full justify-center gap-2 text-primary">
              <MessageCircle className="h-4 w-4" />
              Ask Luna about this entry
            </Button>
          </div>
        </div>
      )}
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
  const [sidebarTab, setSidebarTab] = useState('ai');

  // Fetch all available tags
  const { tags: allTags } = useTags();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="h-24 w-24 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/20 border-l-transparent" />
        </motion.div>
        <p className="mt-6 text-lg text-muted-foreground">Loading notebook...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container py-3 flex items-center justify-between gap-4 max-w-7xl">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 h-9 w-9 rounded-full" 
              onClick={() => router.push('/notebooks')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="relative group flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold focus-visible:ring-transparent border-transparent bg-transparent px-0 py-0 h-auto max-w-md"
                placeholder="Untitled Notebook"
              />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={toggleStarred}
                  >
                    {isStarred ? (
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    ) : (
                      <StarOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isStarred ? 'Remove from starred' : 'Add to starred'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={togglePublicStatus}
                  >
                    {notebook?.isPublic ? (
                      <Eye className="h-5 w-5 text-green-500" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{notebook?.isPublic ? 'Make private' : 'Make public'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <AlignJustify className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => handleEditorSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('editor')}>
                  <PencilRuler className="h-4 w-4 mr-2" />
                  <span>Editor</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('chat')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Chat with Luna</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={togglePublicStatus}>
                  {notebook?.isPublic ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      <span>Make Private</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      <span>Make Public</span>
                    </>
                  )}
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
        
        {/* Metadata bar */}
        <motion.div 
          className="border-t border-border/20 bg-muted/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="container py-2 flex flex-wrap items-center gap-6 text-sm text-muted-foreground max-w-7xl">
            <div className="flex items-center gap-5">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>Created {notebook && notebook.createdAt ? format(new Date(notebook.createdAt), 'MMM d, yyyy') : 'Just now'}</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>Updated {notebook && (lastSaved || notebook.updatedAt) ? format(new Date(lastSaved || notebook.updatedAt), 'MMM d, yyyy h:mm a') : 'Just now'}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              <span>Tags:</span>
              <div className="ml-2 flex flex-wrap gap-2 items-center">
                {selectedTags.length ? (
                  selectedTags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="px-1.5 py-0 h-5">
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm italic text-muted-foreground/70">No tags</span>
                )}
                {selectedTags.length > 3 && (
                  <Badge variant="outline" className="px-1.5 py-0 h-5">
                    +{selectedTags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="ml-auto flex items-center">
              <Button 
                variant={autoSaveEnabled ? "default" : "outline"}
                size="sm" 
                className="h-7 text-xs gap-1.5 rounded-full px-3"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              >
                {autoSaveEnabled ? "Auto-save on" : "Auto-save off"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="container px-4 border-t border-border/10 bg-background/80">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border/10 w-full justify-start h-12 p-0">
              <TabsTrigger 
                value="editor" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:rounded-none data-[state=active]:bg-transparent rounded-none px-4 h-12"
              >
                <PencilRuler className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:rounded-none data-[state=active]:bg-transparent rounded-none px-4 h-12"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 container max-w-7xl">
          <div className="py-6 h-full">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="editor" className="mt-0 h-full">
                <div className="h-full flex flex-col">
                  {/* Tag Manager */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <PremiumTagInput 
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                      allTags={allTags}
                    />
                  </div>
                  
                  {/* Editor Area */}
                  <div className="flex-1 bg-muted/20 rounded-lg p-6 border border-border/30 min-h-[500px]">
                    {/* Editor would be here - using placeholder for this example */}
                    <textarea 
                      className="w-full h-full text-base leading-relaxed resize-none border-none bg-transparent focus:outline-none focus:ring-0"
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
              
              <TabsContent value="chat" className="mt-0 h-full">
                <div className="border border-border/30 rounded-lg h-full min-h-[600px] overflow-hidden">
                  <NotebookChat 
                    notebookId={notebookId} 
                    initialContent={notebook?.content || ''}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              className="w-72 h-[calc(100vh-140px)] sticky top-[140px]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs defaultValue="ai" className="h-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="ai">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="h-full">
                  <AISidebar notebook={notebook} content={editorData} />
                </TabsContent>
                <TabsContent value="info" className="h-full">
                  <div className="border-l border-border/30 h-full overflow-auto p-5">
                    <h3 className="text-lg font-medium mb-4">Notebook Details</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">General</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Status</span>
                            <Badge variant={notebook?.isPublic ? "secondary" : "outline"}>
                              {notebook?.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Starred</span>
                            <Badge variant={isStarred ? "secondary" : "outline"}>
                              {isStarred ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Words</span>
                            <span className="text-sm text-muted-foreground">
                              {editorData?.split(/\s+/).filter(Boolean).length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">History</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-sm">Created</span>
                            <div className="text-right">
                              <div className="text-sm">
                                {format(new Date(notebook.createdAt), 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(notebook.createdAt), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm">Updated</span>
                            <div className="text-right">
                              <div className="text-sm">
                                {format(new Date(lastSaved || notebook.updatedAt), 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(lastSaved || notebook.updatedAt), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Author</h4>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              <UserRound className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">You</div>
                            <div className="text-xs text-muted-foreground">Owner</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Actions</h4>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Notebook
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export as PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start text-sm text-red-600 hover:text-red-700"
                            onClick={() => setConfirmDeleteDialog(true)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Notebook
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notebook
              <span className="font-medium text-foreground"> "{title || 'Untitled'}" </span> 
              and remove it from our servers.
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
