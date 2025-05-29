"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotebooks, useNotebooksByTag, useSearchNotebooks, useTags } from '@/lib/hooks';
import { toast } from "sonner";

import {
  MobileNotebookList,
  NotebooksHeader,
  NotebooksSearch,
  NotebooksTable,
  NotebooksGrid,
  NotebooksList,
  NotebooksEmpty,
  NotebooksPagination,
  CreateNotebookDialog
} from '@/components/notebooks';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 40;

// Client component that uses searchParams
function NotebooksContent() {
  const { status } = useSession();
  const router = useRouter();

  // State for notebooks
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('recent');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State for create notebook dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotebook, setNewNotebook] = useState({ title: 'New Notebook', content: '', tags: '' });
  const [isCreating, setIsCreating] = useState(false);

  // State for delete notebook dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const [deletingNotebookId, setDeletingNotebookId] = useState(null);

  // Fetch notebooks
  const { notebooks, isLoading: isLoadingNotebooks, mutate: mutateNotebooks } = useNotebooks();
  const { tags, isLoading: isLoadingTags } = useTags();
  const { notebooks: tagNotebooks, isLoading: isLoadingTagNotebooks } = useNotebooksByTag(selectedTag);
  const { results: searchResults, isLoading: isSearching } = useSearchNotebooks(searchQuery);

  // Loading states
  const isLoadingState = isLoadingNotebooks;
  const isTagFilterLoading = selectedTag && isLoadingTagNotebooks;
  const isSortingLoading = false;

  // Load view mode preference from localStorage
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('reflecto-view-mode');
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
    } catch (error) {
      console.error('Error loading view mode preference:', error);
    }
  }, []);

  // Determine which notebooks and pagination to display
  const displayedNotebooks = useMemo(() => {
    // First, determine the base set of notebooks based on filters
    let baseNotebooks = searchQuery ? searchResults :
      selectedTag ? tagNotebooks :
        notebooks;

    // Then, sort the notebooks based on sortBy and sortDirection
    return [...(baseNotebooks || [])].sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil((displayedNotebooks?.length || 0) / ITEMS_PER_PAGE);
  const paginatedNotebooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedNotebooks?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];
  }, [displayedNotebooks, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag, sortBy, sortDirection]);

  // Handle tag selection
  const handleTagSelect = useCallback((tagId) => {
    setSelectedTag(tagId);
    setSearchQuery('');
  }, []);

  // Handle notebook actions
  const handleViewNotebook = useCallback((id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(`/notebooks/${id}`);
  }, [router]);

  const handleEditNotebook = useCallback((id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(`/notebooks/${id}`);
  }, [router]);

  const openDeleteDialog = useCallback((notebook, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNotebookToDelete(notebook);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteNotebook = useCallback(async () => {
    if (!notebookToDelete) return;

    try {
      setDeletingNotebookId(notebookToDelete.id);
      const response = await fetch(`/api/notebooks/${notebookToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notebook');
      }

      // Update the notebooks list
      mutateNotebooks();
      toast.success('Notebook deleted successfully');
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error('Failed to delete notebook');
    } finally {
      setDeletingNotebookId(null);
      setIsDeleteDialogOpen(false);
      setNotebookToDelete(null);
    }
  }, [notebookToDelete, mutateNotebooks]);

  // Function to handle notebook creation
  const handleCreateNotebook = useCallback(async () => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNotebook.title,
          content: newNotebook.content,
          tags: newNotebook.tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create notebook');
      }

      const data = await response.json();

      // Close dialog and reset form
      setIsDialogOpen(false);
      setNewNotebook({ title: 'New Notebook', content: '', tags: '' });

      // Show success toast
      toast.success('Notebook created successfully!');

      // Navigate to the new notebook or refresh the list
      if (data.id) {
        router.push(`/notebook/${data.id}`);
      } else {
        // Refresh the notebooks list
        refetchData();
      }
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [newNotebook, mutateNotebooks, router]);

  // Function to refetch notebooks data after operations
  const refetchData = useCallback(() => {
    if (selectedTag) {
      // Use mutateNotebooks instead of undefined mutateTagged
      mutateNotebooks();
    } else if (searchQuery) {
      // For search results we also refresh the notebooks data
      mutateNotebooks();
    } else {
      mutateNotebooks();
    }
  }, [selectedTag, searchQuery, mutateNotebooks]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSelectedTag(null);
    setSearchQuery('');
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setShowDateFilter(false);
    setCurrentPage(1);
  }, []);

  // Get available months for calendar filtering
  const getAvailableMonths = useCallback(() => {
    const months = {};
    notebooks?.forEach(notebook => {
      const date = new Date(notebook.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (!months[year]) {
        months[year] = {};
      }
      if (!months[year][month]) {
        months[year][month] = 0;
      }
      months[year][month]++;
    });
    return months;
  }, [notebooks]);

  if (status !== "authenticated") {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg max-w-md mx-auto">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please sign in to view and create notebooks.
        </p>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={() => router.push('/auth/signin')}
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Header with title, filters, and actions */}
      <NotebooksHeader
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tags={tags || []}
        isLoadingTags={isLoadingTags}
        isTagFilterLoading={isTagFilterLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        isSortingLoading={isSortingLoading}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        getAvailableMonths={getAvailableMonths}
        resetFilters={resetFilters}
        handleTagSelect={handleTagSelect}
        setIsDialogOpen={setIsDialogOpen}
        setNewNotebook={setNewNotebook}
      />

      {/* Search */}
      <div className="mb-6">
        <NotebooksSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedTag={setSelectedTag}
          setCurrentPage={setCurrentPage}
          isSearchLoading={isSearching}
        />
      </div>

      {/* Notebooks display */}
      {isLoadingState ? (
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
      ) : displayedNotebooks?.length === 0 && !searchQuery && !selectedTag ? (
        <NotebooksEmpty
          onCreateNotebook={() => {
            setNewNotebook({ title: 'New Notebook', content: '', tags: '' });
            setIsDialogOpen(true);
          }}
        />
      ) : (
        <>
          {/* Mobile view - always shown on small screens */}
          <MobileNotebookList
            notebooks={paginatedNotebooks}
            onView={handleViewNotebook}
            onEdit={handleEditNotebook}
            onDelete={openDeleteDialog}
            deletingNotebookId={deletingNotebookId}
          />

          {/* Desktop view - grid, list, or table based on viewMode */}
          {viewMode === 'table' ? (
            <NotebooksTable
              notebooks={paginatedNotebooks}
              sortBy={sortBy}
              sortDirection={sortDirection}
              setSortBy={setSortBy}
              setSortDirection={setSortDirection}
              handleViewNotebook={handleViewNotebook}
              openDeleteDialog={openDeleteDialog}
              deletingNotebookId={deletingNotebookId}
              router={router}
            />
          ) : viewMode === 'grid' ? (
            <NotebooksGrid
              notebooks={paginatedNotebooks}
              handleViewNotebook={handleViewNotebook}
              handleEditNotebook={handleEditNotebook}
              openDeleteDialog={openDeleteDialog}
              deletingNotebookId={deletingNotebookId}
            />
          ) : (
            <NotebooksList
              notebooks={paginatedNotebooks}
              handleViewNotebook={handleViewNotebook}
              handleEditNotebook={handleEditNotebook}
              openDeleteDialog={openDeleteDialog}
              deletingNotebookId={deletingNotebookId}
            />
          )}

          {/* Pagination */}
          <NotebooksPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}

      {/* Create Notebook Dialog */}
      <CreateNotebookDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        newNotebook={newNotebook}
        setNewNotebook={setNewNotebook}
        handleCreateNotebook={handleCreateNotebook}
        isCreating={isCreating}
      />

      {/* Delete Notebook Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your notebook
              {notebookToDelete && <span className="font-medium"> "{notebookToDelete.title}"</span>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotebook}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
