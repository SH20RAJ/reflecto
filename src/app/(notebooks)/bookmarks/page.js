"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Book, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Layout,
  Star,
  MoreHorizontal,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { useNotebooks, useSearchNotebooks, useTags } from '@/lib/hooks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BookmarksPage() {
  const router = useRouter();
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const { notebooks, isLoading, isError, mutate } = useNotebooks();
  const { notebooks: searchResults, isLoading: isSearching } = useSearchNotebooks(searchQuery || '');
  const { tags } = useTags();

  // Filter and sort notebooks - only show favorites
  const bookmarkedNotebooks = React.useMemo(() => {
    let filteredBooks = [];
    
    // Handle search results
    if (searchQuery && searchQuery.trim() !== '' && searchResults) {
      filteredBooks = [...searchResults].filter(notebook => notebook.isFavorite);
    } else if (notebooks) {
      filteredBooks = [...notebooks].filter(notebook => notebook.isFavorite);
    } else {
      return [];
    }
    
    // Apply tag filter
    if (filterTag) {
      filteredBooks = filteredBooks.filter(notebook => 
        notebook.tags && 
        Array.isArray(notebook.tags) && 
        notebook.tags.some(tag => 
          (typeof tag === 'string' && tag === filterTag) || 
          (tag.id === filterTag)
        )
      );
    }
    
    // Sort notebooks
    return filteredBooks.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || Date.now()) - new Date(a.updatedAt || Date.now());
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      }
      if (sortBy === 'title') {
        return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
      }
      return 0;
    });
  }, [notebooks, searchResults, searchQuery, sortBy, filterTag]);

  // Handle notebook deletion
  const handleDeleteNotebook = async (notebook) => {
    try {
      const response = await fetch(`/api/notebooks/${notebook.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notebook');
      }
      
      toast.success('Notebook deleted');
      mutate(); // Refresh notebooks list
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error('Failed to delete notebook');
    } finally {
      setNotebookToDelete(null);
      setShowDeleteAlert(false);
    }
  };
  
  // Confirm deletion of a notebook
  const confirmDelete = (notebook, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setNotebookToDelete(notebook);
    setShowDeleteAlert(true);
  };
  
  // Toggle a notebook's favorite status
  const toggleFavorite = async (notebook, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    try {
      const response = await fetch(`/api/notebooks/${notebook.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !notebook.isFavorite,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      mutate(); // Refresh notebooks list
      toast.success(notebook.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };
  
  // Clear tag filter
  const clearTagFilter = () => {
    setFilterTag(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center px-4 text-center">
          <div className="relative mb-6">
            <div className="h-12 w-12 rounded-full border-4 border-violet-200/30 dark:border-violet-700/30"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-t-violet-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold mb-2">
            Loading your bookmarked notebooks
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Just a moment...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p>Failed to load notebooks</p>
        <Button onClick={() => mutate()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{notebookToDelete?.title || 'Untitled Notebook'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteNotebook(notebookToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Bookmarked Notebooks</h1>
          <p className="text-muted-foreground">{bookmarkedNotebooks.length} bookmarked notebooks</p>
        </div>
        
        <Button 
          className="mt-4 md:mt-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-600/90 hover:to-indigo-600/90 text-white shadow-md" 
          onClick={() => router.push('/notebooks/new')}
          size="lg"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create New Notebook
        </Button>
      </div>
      
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search bookmarked notebooks..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 lg:justify-center">
          <Button 
            variant={!filterTag ? "default" : "outline"} 
            size="sm" 
            className={!filterTag ? "bg-primary text-primary-foreground" : ""}
            onClick={clearTagFilter}
          >
            All Tags
          </Button>
          
          {tags?.map(tag => (
            <Badge 
              key={tag.id}
              variant={filterTag === tag.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2">
          <div className="bg-background border rounded-md flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("rounded-none", view === 'grid' ? "bg-muted" : "")}
              onClick={() => setView('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("rounded-none", view === 'list' ? "bg-muted" : "")}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("rounded-none", view === 'table' ? "bg-muted" : "")}
              onClick={() => setView('table')}
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
          <select 
            className="py-1 px-2 rounded-md border-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
      
      {/* Notebooks Display */}
      {bookmarkedNotebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Star className="h-12 w-12 mb-4 text-yellow-400" />
          <h3 className="text-xl font-bold mb-2">No Bookmarked Notebooks</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't bookmarked any notebooks yet. Bookmark your favorite notebooks by clicking the star icon.
          </p>
          <Button variant="outline" onClick={() => router.push('/notebooks')}>
            Browse Your Notebooks
          </Button>
        </div>
      ) : view === 'table' ? (
        <div className="animate-in fade-in-50">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[50%]">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookmarkedNotebooks.map(notebook => (
                  <TableRow 
                    key={notebook.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/notebooks/${notebook.id}`)}
                  >
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-yellow-500"
                        onClick={(e) => toggleFavorite(notebook, e)}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-primary" /> 
                        {notebook.title || 'Untitled Notebook'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {notebook.tags && notebook.tags.length > 0 ? 
                          notebook.tags.map((tag, idx) => (
                            <Badge variant="outline" key={idx} className="bg-muted/50">
                              {typeof tag === 'string' ? tag : tag.name}
                            </Badge>
                          )) : 
                          <span className="text-muted-foreground text-xs">No tags</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {notebook.updatedAt ? format(new Date(notebook.updatedAt), 'MMM dd, yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/notebooks/${notebook.id}`);
                          }}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => toggleFavorite(notebook, e)}>
                            Remove bookmark
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => confirmDelete(notebook, e)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 animate-in fade-in-50 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {bookmarkedNotebooks.map(notebook => (
            <Card 
              key={notebook.id} 
              className={`cursor-pointer overflow-hidden border hover:border-primary/50 transition-all ${view === 'list' ? 'flex flex-row items-center' : ''}`}
              onClick={() => router.push(`/notebooks/${notebook.id}`)}
            >
              <div className={view === 'list' ? 'flex-1' : ''}>
                <CardHeader className={view === 'list' ? 'py-3' : ''}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-yellow-500"
                        onClick={(e) => toggleFavorite(notebook, e)}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                      <CardTitle className="text-lg">{notebook.title || 'Untitled Notebook'}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/notebooks/${notebook.id}`);
                        }}>
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => toggleFavorite(notebook, e)}>
                          Remove bookmark
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => confirmDelete(notebook, e)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {view === 'grid' && (
                    <CardDescription className="line-clamp-2 h-10">
                      {notebook.description || 'No description provided'}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className={`${view === 'list' ? 'py-3' : ''}`}>
                  <div className="flex flex-wrap gap-1">
                    {notebook.tags && notebook.tags.length > 0 ? 
                      notebook.tags.map((tag, idx) => (
                        <Badge variant="secondary" key={idx}>
                          {typeof tag === 'string' ? tag : tag.name}
                        </Badge>
                      )).slice(0, view === 'grid' ? 3 : 6) : 
                      <Badge variant="outline">No tags</Badge>
                    }
                    {notebook.tags && notebook.tags.length > (view === 'grid' ? 3 : 6) && (
                      <Badge variant="outline">+{notebook.tags.length - (view === 'grid' ? 3 : 6)} more</Badge>
                    )}
                  </div>
                </CardContent>
                {view === 'grid' && (
                  <CardFooter className="text-xs text-muted-foreground">
                    Updated {notebook.updatedAt ? format(new Date(notebook.updatedAt), 'MMM dd, yyyy') : 'recently'}
                  </CardFooter>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
