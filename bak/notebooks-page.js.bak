/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useNotebooks, useNotebooksByTag, useSearchNotebooks, useTags } from '@/lib/hooks';
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { Tag, CalendarDays, Clock, ArrowUpDown, Sparkles, ChevronLeft, ChevronRight, Hash, Search, LayoutGrid, List, MoreVertical, Edit, Trash, Eye, Calendar, Loader2 } from 'lucide-react';
import { MobileNotebookList } from '@/components/notebooks';

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NovelEditor from "@/components/NovelEditor";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";


// Client component that uses searchParams
function NotebooksContent() {
  const { status } = useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingState, setIsLoadingState] = useState(true);
  // Initialize view mode from localStorage or default to 'table'
  const [viewMode, setViewMode] = useState('table'); // 'grid', 'list', or 'table'

  // Load saved view mode preference from localStorage on initial render
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('reflecto-view-mode');
      if (savedViewMode && ['grid', 'list', 'table'].includes(savedViewMode)) {
        setViewMode(savedViewMode);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Default to table view if localStorage is not available
    }
  }, []);

  // Use SWR hooks for data fetching
  const {
    notebooks,
    pagination,
    isLoading: isLoadingNotebooks,
    mutate: mutateNotebooks
  } = useNotebooks(currentPage);

  const { tags, isLoading: isLoadingTags } = useTags();

  // Search state
  const {
    notebooks: searchResults,
    pagination: searchPagination,
    isLoading: isSearching
  } = useSearchNotebooks(searchQuery || null, currentPage);
  const [newNotebook, setNewNotebook] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'alphabetical'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const searchParams = useSearchParams();
  const isSessionLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Get notebooks by tag if a tag is selected
  const {
    notebooks: tagNotebooks,
    pagination: tagPagination,
    isLoading: isLoadingTagNotebooks
  } = useNotebooksByTag(selectedTag, currentPage);

  // Determine which notebooks and pagination to display
  const displayedNotebooks = useMemo(() => {
    // First, determine the base set of notebooks based on filters
    let baseNotebooks = searchQuery ? searchResults :
                       selectedTag ? tagNotebooks :
                       notebooks;

    // Then, sort the notebooks based on sortBy and sortDirection
    return [...baseNotebooks].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        // Sort alphabetically by title
        const comparison = a.title.localeCompare(b.title);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortBy === 'created') {
        // Sort by creation date
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'status') {
        // Sort by public/private status
        // Public notebooks first if ascending, private first if descending
        const statusA = a.isPublic ? 1 : 0;
        const statusB = b.isPublic ? 1 : 0;
        return sortDirection === 'asc' ? statusB - statusA : statusA - statusB;
      } else {
        // Sort by updated date (recent or oldest)
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [searchQuery, searchResults, selectedTag, tagNotebooks, notebooks, sortBy, sortDirection]);

  const displayedPagination = searchQuery ? searchPagination :
                             selectedTag ? tagPagination :
                             pagination;

  // We'll use isLoadingNotebooks specifically for the notebooks loading UI
  // Other loading states are used for specific UI elements

  // Create specific loading states for UI elements
  const isSearchLoading = isSearching && searchQuery;
  const isTagFilterLoading = isLoadingTagNotebooks && selectedTag;
  const [isSortingLoading, setIsSortingLoading] = useState(false); // We'll use this for client-side sorting animations

  // Debug loading state
  console.log('Loading states:', {
    isLoadingNotebooks,
    isLoadingTags,
    isSearching,
    isLoadingTagNotebooks,
    isLoadingState,
    isSessionLoading,
    isAuthenticated,
    isSearchLoading,
    isTagFilterLoading,
    isSortingLoading,
    notebooksCount: notebooks.length,
    tagsCount: tags.length
  });

  // Fetch data when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if we should open the new notebook dialog
      if (searchParams.get('new') === 'true') {
        setIsDialogOpen(true);
      }

      // Check if we should filter by tag
      const tagId = searchParams.get('tag');
      if (tagId) {
        setSelectedTag(tagId);
      }

      // Set loading state to false once we have checked for data
      // We'll let the isLoadingNotebooks state handle the loading UI
      setIsLoadingState(false);
    } else if (status === 'unauthenticated') {
      setIsLoadingState(false);
    }
  }, [isAuthenticated, status, searchParams]);





  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Create a new notebook
  const handleCreateNotebook = async () => {
    if (!newNotebook.title.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNotebook.title,
          content: newNotebook.content,
          tags: newNotebook.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Notebook created successfully!');
        setNewNotebook({ title: '', content: '', tags: '' });
        setIsDialogOpen(false);

        // Navigate to the new notebook in edit mode
        router.push(`/notebooks/${data.id}?edit=true`);
      } else {
        toast.error('Failed to create notebook');
        console.error('Failed to create notebook');
      }
    } catch (error) {
      toast.error('Error creating notebook');
      console.error('Error creating notebook:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // View a notebook
  const handleViewNotebook = (id, e) => {
    // If the click came from the dropdown menu, don't navigate
    if (e && e.defaultPrevented) return;
    router.push(`/notebooks/${id}`);
  };

  const handleEditNotebook = (id, e) => {
    e.preventDefault();
    router.push(`/notebooks/${id}?edit=true`);
  };

  const [deletingNotebookId, setDeletingNotebookId] = useState(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);

  const handleDeleteNotebook = async (id, e) => {
    if (e) e.preventDefault();

    console.log('Starting delete process for notebook ID:', id);

    if (!id) {
      console.error('No notebook ID provided for deletion');
      toast.error('Error: No notebook ID provided');
      return;
    }

    // Set the deleting state for this notebook
    setDeletingNotebookId(id);

    try {
      console.log('Making DELETE API call to:', `/api/notebooks/${id}`);

      // Make the API call first before updating the UI
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      // Try to get the response body for more detailed error information
      let responseBody;
      try {
        responseBody = await response.clone().json();
        console.log('Response body:', responseBody);
      } catch (e) {
        console.log('Could not parse response as JSON:', e);
      }

      if (response.ok) {
        // Log success
        console.log('Successfully deleted notebook from API');

        try {
          // Get the current data from SWR cache for debugging
          const currentSWRData = await mutateNotebooks();
          console.log('Current SWR data before update:', currentSWRData);

          if (!currentSWRData || !currentSWRData.notebooks) {
            console.warn('SWR cache is empty or missing notebooks array');
            // Force a complete revalidation
            await mutateNotebooks(undefined, { revalidate: true });
          } else {
            // Only update the UI after successful deletion
            await mutateNotebooks(
              currentData => {
                if (!currentData) {
                  console.log('No current data in SWR cache');
                  return currentData;
                }

                console.log('Updating SWR cache with filtered notebooks');
                // Filter out the deleted notebook from the current data
                const updatedNotebooks = currentData.notebooks.filter(notebook => notebook.id !== id);

                // Create the updated data structure
                const updatedData = {
                  ...currentData,
                  notebooks: updatedNotebooks,
                  notebooksCount: (currentData.notebooksCount || updatedNotebooks.length) - 1
                };

                console.log('Updated SWR data:', updatedData);
                return updatedData;
              },
              { revalidate: false } // Don't revalidate immediately to avoid race conditions
            );

            // Force a revalidation after a short delay to ensure consistency
            setTimeout(() => {
              console.log('Triggering delayed revalidation');
              mutateNotebooks(undefined, { revalidate: true });
            }, 300);
          }
        } catch (mutateError) {
          console.error('Error updating SWR cache:', mutateError);
          // If there's an error with the SWR update, force a complete revalidation
          await mutateNotebooks(undefined, { revalidate: true });
        }

        toast.success('Notebook deleted successfully');

        // Reset all dialog states
        setIsAlertDialogOpen(false);
        setNotebookToDelete(null);
      } else {
        // Handle error response
        let errorMessage = 'Failed to delete notebook';
        try {
          if (responseBody) {
            console.error('Error response body:', responseBody);
            errorMessage = responseBody.error || errorMessage;
          } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error('An error occurred while deleting the notebook');

      // Try to recover by forcing a revalidation
      try {
        await mutateNotebooks(undefined, { revalidate: true });
      } catch (e) {
        console.error('Failed to revalidate after error:', e);
      }
    } finally {
      // Clear the deleting state
      setDeletingNotebookId(null);
      console.log('Delete process completed');
    }
  };

  // Function to open the delete confirmation dialog
  const openDeleteDialog = (notebook, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Opening delete dialog for notebook:', notebook);
    setNotebookToDelete(notebook);
    setIsAlertDialogOpen(true);
  };

  // Function to close the delete confirmation dialog
  const closeDeleteDialog = () => {
    console.log('Closing delete dialog');
    setIsAlertDialogOpen(false);
    setTimeout(() => {
      setNotebookToDelete(null);
    }, 100); // Small delay to ensure the dialog closes properly before clearing the state
  };

  // Sort notebooks
  const handleSort = (type) => {
    // Set a temporary loading state
    setIsSortingLoading(true);
    setSortBy(type);

    // Simulate a short delay to show the loading state
    setTimeout(() => {
      setIsSortingLoading(false);
    }, 300);

    // Note: With SWR, we don't need to manually sort the notebooks
    // The sorting will be handled on the server side in a future update
  };

  // Filter notebooks by month and year
  const filterByDate = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowDateFilter(true);
    setCurrentPage(1);
  };

  // Get available months with notebooks
  const getAvailableMonths = () => {
    const months = {};
    notebooks.forEach(notebook => {
      const date = new Date(notebook.updatedAt);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (!months[year]) {
        months[year] = new Set();
      }
      months[year].add(month);
    });

    return months;
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth(null);
    setShowDateFilter(false);
    setSelectedTag(null);
    setCurrentPage(1);
  };

  // Handle tag selection
  const handleTagSelect = (tagId) => {
    if (selectedTag === tagId) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagId);
      setCurrentPage(1);
    }
  };

  return (
    <div className='p-4'>
      {/* Global AlertDialog for notebook deletion */}
      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{notebookToDelete?.title}"? This action cannot be undone and will permanently delete your notebook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              closeDeleteDialog();
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                console.log('Delete button clicked for notebook:', notebookToDelete);
                if (notebookToDelete && notebookToDelete.id) {
                  handleDeleteNotebook(notebookToDelete.id, e);
                } else {
                  console.error('No notebook selected for deletion or missing ID');
                  toast.error('Error: Could not identify notebook to delete');
                  closeDeleteDialog();
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingNotebookId === notebookToDelete?.id}
            >
              {deletingNotebookId === notebookToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="sticky top-0 z-50 bg-background pb-4 md:mt-0 mt-20">
        <div className="flex border-b-1/2 flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedTag ? (
                <div className="flex items-center gap-2">
                  <span>Tag:</span>
                  <Badge variant="outline" className="text-base font-normal py-1 px-3">
                    {tags.find(t => t.id === selectedTag)?.name || 'Loading...'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0"
                    onClick={() => {
                      setSelectedTag(null);
                      setCurrentPage(1);
                    }}
                  >
                    <span className="sr-only">Clear tag filter</span>
                    ×
                  </Button>
                </div>
              ) : 'All Notebooks'}
            </h1>
            {showDateFilter && selectedMonth !== null && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Filtered by: {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={resetFilters}
                  >
                    <span className="sr-only">Clear filter</span>
                    ×
                  </Button>
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-9">
                  {isTagFilterLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Tag className="h-3.5 w-3.5" />
                  )}
                  Tags {isTagFilterLoading && '(Loading...)'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoadingTags ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading tags...</span>
                  </div>
                ) : tags.length > 0 ? (
                  tags.map(tag => (
                    <DropdownMenuItem
                      key={tag.id}
                      className="flex justify-between"
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      <div className="flex items-center">
                        <Hash className="mr-2 h-3.5 w-3.5" />
                        {tag.name}
                      </div>
                      <Badge variant="secondary" className="ml-auto">{tag.count}</Badge>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No tags found</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="border rounded-md flex">
              <Button
                variant={viewMode === 'grid' ? "subtle" : "ghost"}
                size="sm"
                className={`px-3 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                onClick={() => {
                  setViewMode('grid');
                  try {
                    localStorage.setItem('reflecto-view-mode', 'grid');
                  } catch (error) {
                    console.error('Error saving view mode preference:', error);
                  }
                }}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "subtle" : "ghost"}
                size="sm"
                className={`px-3 rounded-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
                onClick={() => {
                  setViewMode('list');
                  try {
                    localStorage.setItem('reflecto-view-mode', 'list');
                  } catch (error) {
                    console.error('Error saving view mode preference:', error);
                  }
                }}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? "subtle" : "ghost"}
                size="sm"
                className={`px-3 rounded-none ${viewMode === 'table' ? 'bg-muted' : ''}`}
                onClick={() => {
                  setViewMode('table');
                  try {
                    localStorage.setItem('reflecto-view-mode', 'table');
                  } catch (error) {
                    console.error('Error saving view mode preference:', error);
                  }
                }}
                title="Table view"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-9">
                  {isSortingLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  )}
                  Sort {sortBy === 'recent' ? '(Recent)' : sortBy === 'oldest' ? '(Oldest)' : sortBy === 'alphabetical' ? '(A→Z)' : ''}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleSort('recent')}
                  className={sortBy === 'recent' ? 'bg-muted' : ''}
                  disabled={isSortingLoading}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Most recent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort('oldest')}
                  className={sortBy === 'oldest' ? 'bg-muted' : ''}
                  disabled={isSortingLoading}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort('alphabetical')}
                  className={sortBy === 'alphabetical' ? 'bg-muted' : ''}
                  disabled={isSortingLoading}
                >
                  <span className="mr-2 font-mono">A→Z</span>
                  Alphabetical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDateFilter(!showDateFilter)}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {showDateFilter ? 'Hide calendar filter' : 'Filter by date'}
                </DropdownMenuItem>
                {showDateFilter && (
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Filter by month</div>
                    <div className="grid grid-cols-3 gap-1">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                        const hasNotebooks = Object.values(getAvailableMonths()).some(months =>
                          months.has(index) && selectedYear in getAvailableMonths()
                        );
                        return (
                          <Button
                            key={month}
                            variant={selectedMonth === index ? "default" : "outline"}
                            size="sm"
                            className={`text-xs ${!hasNotebooks ? 'opacity-50' : ''}`}
                            disabled={!hasNotebooks}
                            onClick={() => filterByDate(index, selectedYear)}
                          >
                            {month}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedYear(selectedYear - 1)}
                      >
                        {selectedYear - 1}
                      </Button>
                      <span className="text-sm font-medium">{selectedYear}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedYear(selectedYear + 1)}
                      >
                        {selectedYear + 1}
                      </Button>
                    </div>
                    {selectedMonth !== null && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 text-xs"
                        onClick={resetFilters}
                      >
                        Clear filter
                      </Button>
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-1.5"
                  variant="default"
                  style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
                  onClick={() => {
                    setNewNotebook({ title: 'New Notebook', content: '', tags: '' });
                    setIsDialogOpen(true);
                  }}
                >
                  <Sparkles className="h-4 w-4" /> New Notebook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notebook</DialogTitle>
                  <DialogDescription>
                    Capture your thoughts, insights, and experiences.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your notebook a title"
                      value={newNotebook.title}
                      onChange={(e) => setNewNotebook({...newNotebook, title: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <div className="border rounded-md">
                      <NovelEditor
                        initialValue={newNotebook.content}
                        onChange={(data) => setNewNotebook({...newNotebook, content: data})}
                        readOnly={false}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., gratitude, work, insights"
                      value={newNotebook.tags}
                      onChange={(e) => setNewNotebook({...newNotebook, tags: e.target.value})}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateNotebook} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Notebook'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          {isSearchLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          )}
          <Input
            placeholder="Search notebooks..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedTag(null); // Clear tag filter when searching
              setCurrentPage(1); // Reset to first page
            }}
          />
          {isSearchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-muted-foreground">Searching...</span>
            </div>
          )}
        </div>
      </div>

      {isSessionLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7 ,8, 9].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isAuthenticated ? (
        isLoadingNotebooks ? (
          // Show loading skeleton while notebooks are being fetched
          <div className="space-y-6">
            {/* Table loading skeleton */}
            <div className="rounded-md border mb-8 overflow-hidden shadow-sm animate-pulse">
              <div className="w-full">
                {/* Table header skeleton */}
                <div className="bg-muted/30 border-b">
                  <div className="grid grid-cols-6 px-4 py-3">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded ml-auto"></div>
                  </div>
                </div>
                {/* Table rows skeleton */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="border-b last:border-b-0">
                    <div className="grid grid-cols-6 px-4 py-4 gap-4">
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="flex gap-1">
                        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      </div>
                      <div className="h-5 w-8 bg-gray-200 dark:bg-gray-800 rounded ml-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : notebooks.length === 0 ? (
          // Show a welcome message with create button instead of a loader for new users
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Welcome to Reflecto!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first notebook to capture your thoughts and reflections.
            </p>
            <Button
              size="lg"
              className="gap-2"
              variant="default"
              style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
              onClick={() => {
                setNewNotebook({
                  title: 'My First Notebook',
                  content: `# Welcome to your first notebook!

This is a place to capture your thoughts, ideas, and reflections. You can use markdown formatting to organize your content.

## Getting Started
- Write anything that comes to mind
- Use tags to organize your notebooks
- Come back regularly to build your reflection practice

Enjoy your journaling journey with Reflecto!`,
                  tags: 'welcome,first-notebook'
                });
                setIsDialogOpen(true);
              }}
            >
              <Sparkles className="h-4 w-4" />
              Create Your First Notebook
            </Button>
          </div>
        ) : notebooks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'No notebooks found matching your search.' : 'You don\'t have any notebooks yet.'}
            </p>
            {!searchQuery && (
              <Button
                variant="default"
                style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
                onClick={() => {
                setNewNotebook({
                  title: 'My First Notebook',
                  content: `# Welcome to your first notebook!

This is a place to capture your thoughts, ideas, and reflections. You can use markdown formatting to organize your content.

## Getting Started
- Write anything that comes to mind
- Use tags to organize your notebooks
- Come back regularly to build your reflection practice

Enjoy your journaling journey with Reflecto!`,
                  tags: 'welcome,first-notebook'
                });
                setIsDialogOpen(true);
              }}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Notebook
              </Button>
            )}
          </div>
        ) : (
          <div className='h-screen'>
            {viewMode === 'table' ? (
              <div className="rounded-md border mb-8 overflow-hidden shadow-md bg-card">
                <div className="max-h-[calc(100vh)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm shadow-sm">
                    <TableRow className="border-b hover:bg-transparent">
                      <TableHead className="w-[40%] py-3 font-semibold text-foreground">
                        <div className="flex items-center cursor-pointer group"
                          onClick={() => {
                            if (sortBy === 'alphabetical') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy('alphabetical');
                              setSortDirection('asc');
                            }
                          }}
                        >
                          <span className="font-medium">Title</span>
                          <span className={`ml-2 transition-opacity ${sortBy === 'alphabetical' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                            {sortDirection === 'asc' ?
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg> :
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead className="py-3 font-semibold text-foreground">
                        <div className="flex items-center cursor-pointer group"
                          onClick={() => {
                            // Define a new sort type for created date
                            const newSortBy = 'created';
                            if (sortBy === newSortBy) {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy(newSortBy);
                              setSortDirection('desc'); // Default to newest first
                            }
                          }}
                        >
                          <span className="font-medium">Created</span>
                          <span className={`ml-2 transition-opacity ${sortBy === 'created' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                            {sortDirection === 'asc' ?
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg> :
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead className="py-3 font-semibold text-foreground">
                        <div className="flex items-center cursor-pointer group"
                          onClick={() => {
                            if (sortBy === 'recent' || sortBy === 'oldest') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                              setSortBy(sortDirection === 'asc' ? 'oldest' : 'recent');
                            } else {
                              setSortBy('recent');
                              setSortDirection('desc');
                            }
                          }}
                        >
                          <span className="font-medium">Updated</span>
                          <span className={`ml-2 transition-opacity ${(sortBy === 'recent' || sortBy === 'oldest') ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                            {sortDirection === 'asc' ?
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg> :
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead className="py-3 font-semibold text-foreground">
                        <div className="flex items-center cursor-pointer group"
                          onClick={() => {
                            // Define a new sort type for status
                            const newSortBy = 'status';
                            if (sortBy === newSortBy) {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy(newSortBy);
                              setSortDirection('asc'); // Default to public first
                            }
                          }}
                        >
                          <span className="font-medium">Status</span>
                          <span className={`ml-2 transition-opacity ${sortBy === 'status' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                            {sortDirection === 'asc' ?
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg> :
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            }
                          </span>
                        </div>
                      </TableHead>
                      <TableHead className="py-3 font-semibold text-foreground">
                        <span className="font-medium">Tags</span>
                      </TableHead>
                      <TableHead className="text-right py-3 font-semibold text-foreground">
                        <span className="font-medium">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedNotebooks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p className="mb-2">No notebooks found</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchQuery('');
                                setSelectedTag(null);
                                setCurrentPage(1);
                              }}
                            >
                              Reset filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedNotebooks.map((notebook, index) => (
                        <TableRow
                          key={notebook.id}
                          className={`cursor-pointer hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-muted/20 dark:bg-muted/10' : ''}`}
                          onClick={(e) => handleViewNotebook(notebook.id, e)}
                        >
                          <TableCell className="py-3.5">
                            <Button
                              variant={"link"}
                              className="p-0 text-foreground font-medium hover:text-primary"
                            >
                              {notebook.title}
                            </Button>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm py-3.5 whitespace-nowrap">
                            {format(new Date(notebook.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm py-3.5 whitespace-nowrap">
                            {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="py-3.5">
                            {notebook.isPublic ? (
                              <Badge variant="outline" className="text-xs py-0 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Public</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs py-0 h-5 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">Private</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {notebook.tags.slice(0, 3).map(tag => (
                                <div
                                  key={tag.id}
                                  className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full cursor-pointer hover:bg-muted/80"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/notebooks?tag=${tag.id}`);
                                  }}
                                >
                                  <Tag className="mr-1 h-2.5 w-2.5" />
                                  {tag.name}
                                </div>
                              ))}
                              {notebook.tags.length > 3 && (
                                <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                  +{notebook.tags.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-3.5">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                onClick={(e) => openDeleteDialog(notebook, e)}
                                disabled={deletingNotebookId === notebook.id}
                              >
                                {deletingNotebookId === notebook.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile view - always shown on small screens */}
                <MobileNotebookList
                  notebooks={displayedNotebooks}
                  onView={handleViewNotebook}
                  onEdit={handleEditNotebook}
                  onDelete={openDeleteDialog}
                  deletingNotebookId={deletingNotebookId}
                />

                {/* Desktop view - grid or list based on viewMode */}
                <div className={`hidden md:${viewMode === 'grid' ? 'grid grid-cols-2 xl:grid-cols-3 gap-5' : viewMode === 'list' ? 'block space-y-4' : ''} mb-8`}>
                  {displayedNotebooks.map((notebook) => {
                    return viewMode === 'grid' ? (
                  <Card
                    key={notebook.id}
                    className="cursor-pointer rounded-lg hover:shadow-lg transition-all hover:border-primary/20 overflow-hidden group relative bg-card/50 backdrop-blur-sm border-muted/60"
                    onClick={(e) => handleViewNotebook(notebook.id, e)}
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              openDeleteDialog(notebook, e);
                            }}
                            disabled={deletingNotebookId === notebook.id}
                          >
                            {deletingNotebookId === notebook.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {notebook.isPublic && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs">Public</Badge>
                      </div>
                    )}

                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary/30"></div>

                    <CardHeader className="pb-2 pt-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          <span>{format(new Date(notebook.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1.5" />
                          <span>{format(new Date(notebook.updatedAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-medium group-hover:text-primary transition-colors">{notebook.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                        {notebook.content ? (
                          // Display markdown content
                          (() => {
                            try {
                              // Check if it's JSON (legacy format)
                              if (notebook.content.trim().startsWith('{') || notebook.content.trim().startsWith('[')) {
                                try {
                                  const parsed = JSON.parse(notebook.content);
                                  if (parsed.blocks) {
                                    // Legacy Editor.js format
                                    return parsed.blocks
                                      .filter(block => block.type === 'paragraph')
                                      .map(block => block.data.text)
                                      .join(' ')
                                      .substring(0, 150) + '...';
                                  }
                                } catch (e) {
                                  // Not valid JSON, treat as markdown
                                }
                              }
                              // Plain markdown - strip any markdown syntax for preview
                              return notebook.content
                                .replace(/[#*`>_~\[\]]/g, '') // Remove markdown symbols
                                .replace(/\n/g, ' ') // Replace newlines with spaces
                                .trim()
                                .substring(0, 150) + (notebook.content.length > 150 ? '...' : '');
                            } catch (e) {
                              return notebook.content.substring(0, 150) + '...';
                            }
                          })()
                        ) : 'No content'}
                      </p>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1 shadow-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleViewNotebook(notebook.id, e);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditNotebook(notebook.id, e);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </div>

                        {notebook.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {notebook.tags.slice(0, 2).map(tag => (
                              <div
                                key={tag.id}
                                className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full cursor-pointer hover:bg-muted/80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  router.push(`/notebooks?tag=${tag.id}`);
                                }}
                              >
                                <Tag className="mr-1 h-2.5 w-2.5" />
                                {tag.name}
                              </div>
                            ))}
                            {notebook.tags.length > 2 && (
                              <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                +{notebook.tags.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    key={notebook.id}
                    className="border rounded-lg p-5 cursor-pointer hover:shadow-lg transition-all hover:border-primary/20 group flex flex-col md:flex-row gap-4 relative bg-card/50 backdrop-blur-sm border-muted/60"
                    onClick={(e) => handleViewNotebook(notebook.id, e)}
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/80 to-primary/30 rounded-l-lg"></div>
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              openDeleteDialog(notebook, e);
                            }}
                            disabled={deletingNotebookId === notebook.id}
                          >
                            {deletingNotebookId === notebook.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          <span>Created {format(new Date(notebook.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1.5" />
                          <span>Updated {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}</span>
                        </div>
                        {notebook.isPublic && (
                          <Badge variant="outline" className="text-xs py-0 h-5">
                            Public
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-primary transition-colors mb-3">{notebook.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {notebook.content ? (
                          (() => {
                            try {
                              if (notebook.content.trim().startsWith('{') || notebook.content.trim().startsWith('[')) {
                                try {
                                  const parsed = JSON.parse(notebook.content);
                                  if (parsed.blocks) {
                                    return parsed.blocks
                                      .filter(block => block.type === 'paragraph')
                                      .map(block => block.data.text)
                                      .join(' ')
                                      .substring(0, 150) + '...';
                                  }
                                } catch (e) {}
                              }
                              return notebook.content
                                .replace(/[#*`>_~\[\]]/g, '')
                                .replace(/\n/g, ' ')
                                .trim()
                                .substring(0, 150) + (notebook.content.length > 150 ? '...' : '');
                            } catch (e) {
                              return notebook.content.substring(0, 150) + '...';
                            }
                          })()
                        ) : 'No content'}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleViewNotebook(notebook.id, e);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditNotebook(notebook.id, e);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </div>

                        {notebook.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {notebook.tags.map(tag => (
                              <div
                                key={tag.id}
                                className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full cursor-pointer hover:bg-muted/80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  router.push(`/notebooks?tag=${tag.id}`);
                                }}
                              >
                                <Tag className="mr-1 h-2.5 w-2.5" />
                                {tag.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              </>
            )}

            {/* Pagination */}
            {displayedPagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-12">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(displayedPagination.page - 1)}
                    disabled={!displayedPagination.hasPrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: displayedPagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current page
                      return page === 1 ||
                             page === displayedPagination.totalPages ||
                             Math.abs(page - displayedPagination.page) <= 1;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis between non-consecutive pages
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="text-muted-foreground px-2">...</span>
                          )}
                          <Button
                            variant={displayedPagination.page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(displayedPagination.page + 1)}
                    disabled={!displayedPagination.hasMore}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg max-w-md mx-auto">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please sign in to view and create notebooks.
          </p>
          <Button onClick={() => router.push('/auth/signin')}>Sign In with Google</Button>
        </div>
      )}
    </div>
  );
}

// Main page component that wraps the client component in Suspense
export default function NotebooksPage() {
  return (
    <Suspense fallback={
      <div>
        <div className="sticky top-0 z-50 bg-background pb-4 md:mt-0 mt-20">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-4"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse"></div>
        </div>
        {/* Table loading skeleton */}
        <div className="rounded-md border mb-8 overflow-hidden shadow-sm animate-pulse">
          <div className="w-full">
            {/* Table header skeleton */}
            <div className="bg-muted/30 border-b">
              <div className="grid grid-cols-6 px-4 py-3">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded ml-auto"></div>
              </div>
            </div>
            {/* Table rows skeleton */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border-b last:border-b-0">
                <div className="grid grid-cols-6 px-4 py-4 gap-4">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="flex gap-1">
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                  <div className="h-5 w-8 bg-gray-200 dark:bg-gray-800 rounded ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <NotebooksContent />
    </Suspense>
  );
}
