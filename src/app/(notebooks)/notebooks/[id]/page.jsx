"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Import debounce function
import { debounce } from 'lodash';
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
import ImprovedTipTapEditor from '@/components/ImprovedTipTapEditor';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

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
const AISidebar = ({ notebook, content, selectedTags, setSelectedTags }) => {
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
      toast.success(`Added tag: ${tagName}`);
    }
  };

  return (
    <motion.div
      className="h-full overflow-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 md:border-b border-b-0 border-border/10 bg-gradient-to-r from-background via-background to-muted/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                Luna
              </h3>
              <p className="text-xs text-muted-foreground">
                Your AI Writing Assistant
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 md:hidden" onClick={() => {
            // Find all sheet close buttons and click the first one
            const closeButtons = document.querySelectorAll('[data-radix-collection-item]');
            if (closeButtons.length > 0) {
              closeButtons[0].click();
            }
          }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
                          onClick={() => handleAddSuggestedTag(tag)}
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
      // Validate title before saving
      if (!title || title.trim() === '') {
        if (!isAutoSave) {
          toast.error("Title is required");
          setIsSaving(false);
        }
        return;
      }

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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));

        // Provide more specific error messages based on status codes
        let errorMessage = 'Failed to save notebook';
        if (response.status === 400) {
          errorMessage = errorData.error || 'Invalid notebook data';
        } else if (response.status === 401) {
          errorMessage = 'You are not authorized to edit this notebook';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to edit this notebook';
        } else if (response.status === 404) {
          errorMessage = 'Notebook not found';
        } else if (response.status === 413) {
          errorMessage = 'Notebook content is too large';
        } else if (response.status === 500) {
          errorMessage = errorData.error || 'Server error - please try again';
        } else if (response.status >= 500) {
          errorMessage = 'Server error - please try again later';
        } else {
          errorMessage = errorData.error || `Failed to update notebook (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      const updatedNotebook = await response.json();
      setNotebook(updatedNotebook);
      setLastSaved(new Date());

      if (!isAutoSave) {
        toast.success("Notebook saved successfully");
      }
    } catch (error) {
      console.error('Error updating notebook:', error);

      // More specific error handling for different types of errors
      let errorMessage = 'Failed to save notebook';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid response from server - please try again';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (!isAutoSave) {
        toast.error(errorMessage, {
          description: 'Your changes may not have been saved. Please try again.',
          duration: 5000,
        });
      } else {
        // For autosave, show a less intrusive notification
        console.warn('Autosave failed:', errorMessage);
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }
  };

  // Debounced auto-save function
  const debouncedAutoSave = useRef(
    debounce((newContent) => {
      // Only save if there are changes
      if (newContent !== editorData) {
        handleEditorSave(true);
      }
    }, 1000)
  ).current;

  useEffect(() => {
    if (autoSaveEnabled) {
      debouncedAutoSave(editorData);
    }
  }, [editorData, autoSaveEnabled, debouncedAutoSave]);

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

      const response = await fetch(`/api/notebooks/${notebookId}/toggle-public`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update public status');
      }

      const data = await response.json();
      setNotebook({ ...notebook, isPublic: data.isPublic });
      toast.success(`Notebook is now ${data.isPublic ? 'public' : 'private'}`);
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
    return;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="h-16 w-16 rounded-full border-2 border-t-primary border-r-transparent border-b-primary/20 border-l-transparent" />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="h-16 w-16 rounded-full border-2 border-t-transparent border-r-primary/30 border-b-transparent border-l-primary/30" />
          </motion.div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading notebook...</p>
        <div className="mt-2 text-xs text-muted-foreground/70">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
          >
            Preparing your writing space
          </motion.span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header (visible on small screens only) */}
      <header className="sticky top-0 z-50 border-b border-border/10 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container flex h-14 max-w-full items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Menu Button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => router.push('/notebooks')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Luna insights trigger - now consistent with navigation icons */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  data-sheet-trigger="true"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[85%] p-0 border-t border-border/20 rounded-t-xl"
              >
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1 rounded-full bg-muted-foreground/20"></div>
                </div>
                <AISidebar
                  notebook={notebook}
                  content={editorData}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1 relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`h-8 w-full truncate bg-transparent px-0 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 ${!title || title.trim() === '' ? 'border-red-500 border-b' : 'border-none'}`}
                placeholder="Untitled Notebook"
                required
                aria-invalid={!title || title.trim() === ''}
                aria-describedby="title-error"
              />
              {(!title || title.trim() === '') && (
                <div id="title-error" className="absolute top-full left-0 text-xs text-red-500 mt-1">
                  Title is required
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant={isSaving ? "outline" : "ghost"}
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => handleEditorSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer" onClick={toggleStarred}>
                  {isStarred ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      <span>Remove from starred</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      <span>Add to starred</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('chat')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Chat with Luna</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setConfirmDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-red-500">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header (hidden on mobile) */}
      <header className="sticky top-0 z-10 border-b border-border/10 bg-background/95 backdrop-blur hidden md:block">
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
              className="text-lg font-medium border-none bg-transparent px-0 h-9 w-[400px] focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Unteditled Notebook"
            />

            <MinimalistTagInput
              className="md:flex-1 hidden sm:flex"
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              allTags={allTags}
              disabled={isSaving}
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
                <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    <span>Auto-save</span>
                  </div>
                  <div className="flex items-center h-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 p-0"
                      onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    >
                      {autoSaveEnabled ? (
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
                  <div className="mb-2 hidden   items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <MinimalistTagInput
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                      allTags={allTags}
                    />
                  </div>

                  {/* Mobile Tag Display - Simplified */}
                  <div className="md:hidden mb-2">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.length > 0 ? (
                        selectedTags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">No tags</div>
                      )}
                    </div>
                  </div>

                  {/* Editor Area - Maximized with TipTap */}
                  <div className="flex-1 pb-4 md:pb-0">
                    <ImprovedTipTapEditor
                      initialContent={editorData || ''}
                      onChange={(newContent) => {
                        setEditorData(newContent);
                        if (autoSaveEnabled) {
                          debouncedAutoSave(newContent);
                        }
                      }}
                      placeholder="Start writing your thoughts here... "
                      className="h-full md:border md:rounded-md dark:border-border/30 md:p-1"
                    />
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
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation (visible on small screens only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/10 p-2 md:hidden z-20">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant={activeTab === 'editor' ? "ghost" : "ghost"}
            size="sm"
            className={cn(
              "h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl",
              activeTab === 'editor' ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab('editor')}
          >
            <PencilRuler className={cn(
              "h-5 w-5",
              activeTab === 'editor' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-[10px]">Editor</span>
            {activeTab === 'editor' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-1 w-6 h-1 rounded-full bg-primary"
              />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground relative"
            onClick={() => {
              // Open the AI insights sheet on mobile
              const sheetTriggerButton = document.querySelector('[data-sheet-trigger="true"]');
              if (sheetTriggerButton) {
                sheetTriggerButton.click();
              }
            }}
          >
            <div className="relative">
              <Sparkles className="h-5 w-5" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"
              />
            </div>
            <span className="text-[10px]">Luna</span>
          </Button>

          <Button
            variant={activeTab === 'chat' ? "ghost" : "ghost"}
            size="sm"
            className={cn(
              "h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl",
              activeTab === 'chat' ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle className={cn(
              "h-5 w-5",
              activeTab === 'chat' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-[10px]">Chat</span>
            {activeTab === 'chat' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-1 w-6 h-1 rounded-full bg-primary"
              />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground"
            onClick={() => router.push('/notebooks')}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.5]">
              <path d="M9 4H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
              <path d="M19 4h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
              <path d="M9 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" />
              <path d="M19 14h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" />
            </svg>
            <span className="text-[10px]">Notebooks</span>
          </Button>
        </div>
      </div>

      {/* Add padding at the bottom on mobile to account for the navigation bar */}
      <div className="h-16 md:hidden"></div>

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

      {/* Floating Action Button for quick save on mobile */}
      <Button
        variant="primary"
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => handleEditorSave(false)}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Save className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
