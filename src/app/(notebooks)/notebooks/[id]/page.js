"use client";

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, Trash, Save, X, Tag as TagIcon, Calendar, Clock, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTags } from '@/lib/hooks';
import PublicToggle from '@/components/PublicToggle';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import NovelEditor from "@/components/NovelEditor";




export default function NotebookPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const notebookId = unwrappedParams.id;

  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [notebook, setNotebook] = useState(null);
  const [editorData, setEditorData] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

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

  // Autosave functionality
  useEffect(() => {
    if (!autoSaveEnabled || !notebook || !editorData) return;

    // Create autosave timer
    const autoSaveTimer = setTimeout(async () => {
      try {
        // Only save if there's actual content and the notebook exists
        if (editorData && notebook) {
          await handleEditorSave(true);
        }
      } catch (error) {
        console.error('Autosave error:', error);
      }
    }, 10000); // 10 seconds

    // Cleanup timer on component unmount or when dependencies change
    return () => clearTimeout(autoSaveTimer);
  }, [editorData, title, selectedTags, autoSaveEnabled, notebook]);



  const handleEditorSave = async () => {
    try {
      setIsSaving(true);

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notebook');
      }

      const updatedNotebook = await response.json();
      setNotebook(updatedNotebook);
      toast.success("Notebook saved successfully");
    } catch (error) {
      console.error('Error updating notebook:', error);
      toast.error("Failed to save notebook");
    } finally {
      setIsSaving(false);
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
      setIsDeleting(false);
    }
  };



  if (!isAuthenticated && status !== "loading") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="relative ">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 relative z-[51] md:mt-4 mt-20 ">
        <Button
          variant="secondary"
          className="gap-1 self-start"
          onClick={() => router.push('/notebooks')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notebooks
        </Button>

        {!isLoading && notebook && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleEditorSave}
              disabled={isSaving}
              className="gap-1"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your notebook.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Skeleton className="h-12 w-3/4 mb-2" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-5/6" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
            </div>
          </div>
        </div>
      ) : notebook ? (
        <div className=" mx-auto pt-2 md:pt-0">
          <div className="mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-4xl font-bold mb-2 border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Untitled"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {format(new Date(notebook.createdAt), 'MMMM d, yyyy')}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Updated {format(new Date(notebook.updatedAt), 'MMMM d, yyyy h:mm a')}</span>
                </div>

                <PublicToggle
                  notebookId={notebookId}
                  initialIsPublic={notebook.isPublic}
                  onToggle={(isPublic) => {
                    // Update the local notebook state when the toggle changes
                    setNotebook({...notebook, isPublic});
                  }}
                />

                <div className="flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5" />
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {selectedTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs rounded-full px-2 py-0 h-5 flex items-center gap-1"
                      >
                        {tag.name}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}

                    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-5 px-2 text-xs rounded-full">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Tag
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" side="right" align="start">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2 text-sm">
                                <div className="mb-2">No tags found</div>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Create new tag"
                                    className="h-7 text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => {
                                      if (newTag.trim()) {
                                        const newTagObj = { id: `new-${Date.now()}`, name: newTag.trim() };
                                        setSelectedTags([...selectedTags, newTagObj]);
                                        setNewTag('');
                                        setIsTagPopoverOpen(false);
                                      }
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {allTags
                                .filter(tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id))
                                .map(tag => (
                                  <CommandItem
                                    key={tag.id}
                                    onSelect={() => {
                                      setSelectedTags([...selectedTags, tag]);
                                      setIsTagPopoverOpen(false);
                                    }}
                                  >
                                    <TagIcon className="h-3 w-3 mr-2" />
                                    {tag.name}
                                  </CommandItem>
                                ))
                              }
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>


          </div>

          <div className="pt-4 border-t">
            <NovelEditor
              initialValue={editorData}
              onChange={(data) => setEditorData(data)}
              readOnly={false}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Notebook not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/notebooks')}
          >
            Go back to notebooks
          </Button>
        </div>
      )}
    </div>
  );
}
