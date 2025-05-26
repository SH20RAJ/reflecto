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
  const [newNotebook, setNewNotebook] = useState({ title: '', content: '', tags: '' });
  const [isCreating, setIsCreating] = useState(false);

  // State for notebook deletion
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const [deletingNotebookId, setDeletingNotebookId] = useState(null);

  // Data fetching hooks
  const { notebooks, isLoading: isLoadingNotebooks, isError, mutate } = useNotebooks();
  const { notebooks: taggedNotebooks, isLoading: isLoadingTagged } = useNotebooksByTag(selectedTag);
  const { notebooks: searchResults, isLoading: isSearching } = useSearchNotebooks(searchQuery || '');
  const { tags, isLoading: isLoadingTags } = useTags();

  // Save view mode to localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('notebooksViewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const saveViewModePreference = useCallback((mode) => {
    localStorage.setItem('notebooksViewMode', mode);
  }, []);

  // Filter and sort notebooks
  const displayedNotebooks = useMemo(() => {
    let result = notebooks;
    
    if (selectedTag) {
      result = taggedNotebooks || [];
    }
    
    if (searchQuery) {
      result = searchResults || [];
    }
    
    // Sort the notebooks
    return [...result].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'recent') {
        return sortDirection === 'asc'
          ? new Date(a.updatedAt) - new Date(b.updatedAt)
          : new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'created') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }, [notebooks, taggedNotebooks, searchResults, selectedTag, searchQuery, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(displayedNotebooks.length / ITEMS_PER_PAGE);
  const paginatedNotebooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedNotebooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedNotebooks, currentPage]);

  // Navigation
  const handleViewNotebook = useCallback((id) => {
    router.push(`/notebooks/${id}`);
  }, [router]);

  const handleEditNotebook = useCallback((id) => {
    router.push(`/notebooks/${id}`);
  }, [router]);

  // Handle notebook deletion
  const openDeleteDialog = useCallback((notebook, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNotebookToDelete(notebook);
    setShowDeleteAlert(true);
  }, []);

  const handleDeleteNotebook = useCallback(async () => {
    if (!notebookToDelete) return;
    
    try {
      setDeletingNotebookId(notebookToDelete.id);
      
      const res = await fetch(`/api/notebooks/${notebookToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete notebook');
      }
      
      // Show toast and refresh data
      toast.success('Notebook deleted successfully');
      mutate();
      
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error('Failed to delete notebook');
    } finally {
      setDeletingNotebookId(null);
      setShowDeleteAlert(false);
      setNotebookToDelete(null);
    }
  }, [notebookToDelete, mutate]);

  // Handle notebook creation
  const createNotebook = useCallback(async (data) => {
    try {
      setIsCreating(true);
      
      const res = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content || '',
          tags: data.tags.split(',').filter(tag => tag.trim()),
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create notebook');
      }
      
      const notebook = await res.json();
      
      // Show toast and refresh data
      toast.success('Notebook created successfully');
      mutate();
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Navigate to the new notebook
      router.push(`/notebooks/${notebook.id}`);
      
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook');
    } finally {
      setIsCreating(false);
    }
  }, [mutate, router]);

  // Loading and error states
  const isLoading = isLoadingNotebooks || isLoadingTagged || (searchQuery && isSearching);

  return (
    <div className="container max-w-7xl pt-4 pb-10 md:py-6 px-4 md:px-6">
      {/* Header with title, filters, and view controls */}
      <NotebooksHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        saveViewModePreference={saveViewModePreference}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        onCreateNew={() => {
          setNewNotebook({ title: 'New Notebook', content: '', tags: '' });
          setIsDialogOpen(true);
        }}
        tags={tags}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
      
      {/* Search input */}
      <NotebooksSearch
      className="mb-4"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        setCurrentPage={() => setCurrentPage(1)}
      />
      
      {/* Loading state */}
      {isLoading ? (
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
      ) : displayedNotebooks?.length === 0 && !searchQuery && !selectedTag ? (
        <NotebooksEmpty 
          onCreateNotebook={() => {
            setNewNotebook({ title: 'New Notebook', content: '', tags: '' });
            setIsDialogOpen(true);
          }} 
        />
      ) : (
        <>
          {/* Mobile view - enhanced for better mobile experience */}
          <MobileNotebookList 
            notebooks={paginatedNotebooks}
            onView={handleViewNotebook}
            onEdit={handleEditNotebook}
            onDelete={openDeleteDialog}
            deletingNotebookId={deletingNotebookId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateNew={() => {
              setNewNotebook({ title: 'New Notebook', content: '', tags: '' });
              setIsDialogOpen(true);
            }}
            showFilter={selectedTag || showDateFilter}
            onToggleFilter={() => setShowDateFilter(!showDateFilter)}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            viewMode={viewMode}
            setViewMode={(mode) => {
              setViewMode(mode);
              saveViewModePreference(mode);
            }}
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
        createNotebook={createNotebook}
        isCreating={isCreating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{notebookToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNotebook}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
