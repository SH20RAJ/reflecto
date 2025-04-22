"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useNotebooks, useNotebooksByTag, useSearchNotebooks, useTags } from '@/lib/hooks';
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { Tag, CalendarDays, Clock, ArrowUpDown, Sparkles, ChevronLeft, ChevronRight, Hash, Search, LayoutGrid, List, MoreVertical, Edit, Trash, Eye } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NovelEditor from "@/components/NovelEditor";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";


export default function NotebooksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
  const [sortBy, setSortBy] = useState('recent');
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
  const displayedNotebooks = searchQuery ? searchResults :
                            selectedTag ? tagNotebooks :
                            notebooks;

  const displayedPagination = searchQuery ? searchPagination :
                             selectedTag ? tagPagination :
                             pagination;

  // Determine loading state
  const isLoading = isLoadingNotebooks || isLoadingTags || isSearching || isLoadingTagNotebooks || isLoadingState;

  // Debug loading state
  console.log('Loading states:', {
    isLoadingNotebooks,
    isLoadingTags,
    isSearching,
    isLoadingTagNotebooks,
    isLoadingState,
    isSessionLoading,
    isAuthenticated,
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

      // Set loading state to false once we have data
      if (notebooks.length > 0 || tags.length > 0) {
        setIsLoadingState(false);
      }
    } else if (status === 'unauthenticated') {
      setIsLoadingState(false);
    }
  }, [isAuthenticated, status, searchParams, notebooks.length, tags.length]);





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

  const handleDeleteNotebook = async (id, e) => {
    e.preventDefault();

    if (!confirm('Are you sure you want to delete this notebook?')) return;

    try {
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Notebook deleted successfully');
        mutateNotebooks(); // Refresh the list
      } else {
        toast.error('Failed to delete notebook');
      }
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error('An error occurred while deleting the notebook');
    }
  };

  // Sort notebooks
  const handleSort = (type) => {
    setSortBy(type);
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
    <div>
      <div className="flex items-center justify-between mb-6">
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

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-9">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tags.length > 0 ? (
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

          <div className="flex items-center gap-2">
            <div className="border rounded-md flex">
              <Button
                variant={viewMode === 'grid' ? "subtle" : "ghost"}
                size="sm"
                className={`px-3 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "subtle" : "ghost"}
                size="sm"
                className={`px-3 rounded-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-9">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleSort('recent')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Most recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('oldest')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('alphabetical')}>
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
                  onClick={() => {
                    setNewNotebook({ title: 'Untitled Notebook', content: '', tags: '' });
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
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
      </div>

      {isSessionLoading || isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        notebooks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'No notebooks found matching your search.' : 'You don\'t have any notebooks yet.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => {
                setNewNotebook({ title: 'Untitled Notebook', content: '', tags: '' });
                setIsDialogOpen(true);
              }}>Create Your First Notebook</Button>
            )}
          </div>
        ) : (
          <div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8' : 'space-y-4 mb-8'}>
              {displayedNotebooks.map((notebook) => {
                return viewMode === 'grid' ? (
                  <Card
                    key={notebook.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20 overflow-hidden group relative"
                    onClick={(e) => handleViewNotebook(notebook.id, e)}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleViewNotebook(notebook.id, e)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleEditNotebook(notebook.id, e)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDeleteNotebook(notebook.id, e)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardHeader className="pb-2 pt-5">
                      <div className="flex items-center text-xs text-muted-foreground mb-1.5">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {format(new Date(notebook.updatedAt), 'MMMM d, yyyy')}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{notebook.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3">
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

                      {notebook.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {notebook.tags.map(tag => (
                            <div key={tag.id} className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              <Tag className="mr-1 h-2.5 w-2.5" />
                              {tag.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    key={notebook.id}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary/20 group flex flex-col md:flex-row gap-4 relative"
                    onClick={(e) => handleViewNotebook(notebook.id, e)}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleViewNotebook(notebook.id, e)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleEditNotebook(notebook.id, e)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDeleteNotebook(notebook.id, e)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center text-xs text-muted-foreground mb-1.5">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {format(new Date(notebook.updatedAt), 'MMMM d, yyyy')}
                      </div>
                      <h3 className="text-lg font-medium group-hover:text-primary transition-colors mb-2">{notebook.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
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
                    </div>
                    {notebook.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 md:mt-0 md:w-1/4 md:justify-end">
                        {notebook.tags.map(tag => (
                          <div key={tag.id} className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Tag className="mr-1 h-2.5 w-2.5" />
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
