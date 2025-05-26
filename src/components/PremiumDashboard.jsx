"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Book, 
  Clock, 
  PlusCircle, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Layout,
  Star,
  Trash2,
  MoreHorizontal,
  StarHalf,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNotebooks, useSearchNotebooks, useTags } from '@/lib/hooks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import MobileBottomNav from './MobileBottomNav';

export default function PremiumDashboard() {
  const router = useRouter();
  const [view, setView] = useState('table');
  const [sortBy, setSortBy] = useState('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState(null);
  const [filterStarred, setFilterStarred] = useState(false);
  const [selectedNotebooks, setSelectedNotebooks] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const { notebooks, isLoading, isError, mutate } = useNotebooks();
  const { notebooks: searchResults, isLoading: isSearching } = useSearchNotebooks(debouncedSearchQuery || '');
  const { tags } = useTags();

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset search results when query is empty
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      mutate(); // Refresh notebooks when search query is cleared
    }
  }, [debouncedSearchQuery, mutate]);
  
  // Filter and sort notebooks
  const displayedNotebooks = React.useMemo(() => {
    let filteredBooks = [];
    
    // Handle search results
    if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '' && searchResults) {
      filteredBooks = [...searchResults];
    } else if (notebooks) {
      filteredBooks = [...notebooks];
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
          (typeof tag === 'object' && tag.id === filterTag)
        )
      );
    }
    
    // Apply starred filter
    if (filterStarred) {
      filteredBooks = filteredBooks.filter(notebook => notebook.isFavorite);
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
  }, [notebooks, searchResults, debouncedSearchQuery, sortBy, filterTag, filterStarred]);

  // Handle notebook deletion
  const handleDeleteNotebook = async (notebook) => {
    try {
      // Handle bulk deletion
      if (Array.isArray(notebook)) {
        // Show toast for bulk deletion start
        toast.loading(`Deleting ${notebook.length} notebooks...`);
        
        const deletePromises = notebook.map(id => 
          fetch(`/api/notebooks/${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(deletePromises);
        
        toast.dismiss();
        toast.success(`${notebook.length} notebooks deleted successfully`);
        setSelectedNotebooks([]);
      } else {
        // Single notebook deletion
        const response = await fetch(`/api/notebooks/${notebook.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete notebook');
        }
        
        toast.success('Notebook deleted');
      }
      
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
  
  // Clear all filters
  const clearFilters = () => {
    setFilterTag(null);
    setFilterStarred(false);
    setSearchQuery('');
    setDebouncedSearchQuery(''); // Also clear the debounced value immediately
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading notebooks</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
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
            <AlertDialogTitle>
              {Array.isArray(notebookToDelete) 
                ? `Delete ${notebookToDelete.length} Notebooks` 
                : "Delete Notebook"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {Array.isArray(notebookToDelete)
                ? `Are you sure you want to delete ${notebookToDelete.length} notebooks? This action cannot be undone.`
                : `Are you sure you want to delete "${notebookToDelete?.title || 'Untitled Notebook'}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteNotebook(notebookToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {Array.isArray(notebookToDelete) 
                ? `Delete ${notebookToDelete.length} notebooks` 
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Notebooks</h1>
          <p className="text-muted-foreground">{notebooks.length} notebooks available</p>
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
          {isSearching ? (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
              <div className="h-4 w-4 rounded-full border-2 border-r-transparent border-primary animate-spin"></div>
            </div>
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input 
            placeholder="Search notebooks..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 lg:justify-center">
          <Button 
            variant={!filterTag && !filterStarred ? "default" : "outline"} 
            size="sm" 
            className={!filterTag && !filterStarred ? "bg-primary text-primary-foreground" : ""}
            onClick={clearFilters}
          >
            All
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filter
                {(filterTag || filterStarred) && (
                  <Badge className="ml-2 px-1 py-0 h-5 bg-primary text-white">
                    {(filterTag ? 1 : 0) + (filterStarred ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Tags</h4>
                    {filterTag && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setFilterTag(null)}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 border rounded-md bg-background/50">
                    {tags?.map(tag => (
                      <Badge 
                        key={tag.id}
                        variant={filterTag === tag.id ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          filterTag === tag.id ? "shadow-sm" : "hover:bg-muted"
                        )}
                        onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {!tags?.length && (
                      <div className="text-sm text-muted-foreground p-2">No tags available</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={filterStarred ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setFilterStarred(!filterStarred)}
                    >
                      <Star className="h-3.5 w-3.5" fill={filterStarred ? "currentColor" : "none"} />
                      Favorites
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={clearFilters}
                    disabled={!filterTag && !filterStarred && !debouncedSearchQuery}
                  >
                    Reset all filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex justify-between lg:justify-end space-x-2">
          {/* View toggles */}
          <div className="flex bg-muted rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2.5 rounded-sm",
                view === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              onClick={() => setView('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2.5 rounded-sm",
                view === "list" ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2.5 rounded-sm",
                view === "table" ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              onClick={() => setView('table')}
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sort dropdown */}
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Sort</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-xs ml-1"
            >
              <option value="updated">Last updated</option>
              <option value="created">Created date</option>
              <option value="title">Name</option>
            </select>
          </Button>
        </div>
      </div>
      
      {/* Create new notebook prominent card */}
      <Card className="mb-6 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border-violet-500/20 hover:shadow-md transition-all">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Start a New Notebook</h3>
            <p className="text-muted-foreground">Capture your thoughts, ideas, memories or anything that matters to you.</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-600/90 hover:to-indigo-600/90 text-white shadow-md self-start" 
            onClick={() => router.push('/notebooks/new')}
            size="lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Notebook
          </Button>
        </CardContent>
      </Card>
      
      {/* Notebooks Display - Grid, List, or Table View */}
      {view === 'table' ? (
        <div className="animate-in fade-in-50">
          <div className="rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedNotebooks.length > 0 && selectedNotebooks.length === displayedNotebooks.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedNotebooks(displayedNotebooks.map(n => n.id));
                        } else {
                          setSelectedNotebooks([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedNotebooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No notebooks found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedNotebooks.map((notebook) => (
                    <TableRow 
                      key={notebook.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedNotebooks.includes(notebook.id) 
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/70"
                      )}
                      onClick={() => router.push(`/notebooks/${notebook.id}`)}
                    >
                      <TableCell className="p-0 pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedNotebooks.includes(notebook.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedNotebooks([...selectedNotebooks, notebook.id]);
                            } else {
                              setSelectedNotebooks(selectedNotebooks.filter(id => id !== notebook.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {notebook.isFavorite && <StarHalf className="h-4 w-4 text-amber-400" />}
                          {notebook.title || 'Untitled Notebook'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {notebook.tags && Array.isArray(notebook.tags) && notebook.tags.length > 0 ? (
                            notebook.tags.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {typeof tag === 'string' ? tag : tag.name || 'Untitled'}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                          {notebook.tags && Array.isArray(notebook.tags) && notebook.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{notebook.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notebook.updatedAt ? format(new Date(notebook.updatedAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {notebook.entryCount || 0} entries
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/notebooks/${notebook.id}`)}>
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => toggleFavorite(notebook, e)}>
                              {notebook.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className={cn(
          'grid gap-4 animate-in fade-in-50',
          view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        )}>
          {/* Create new notebook inline card */}
          <Card 
            className="h-full border-dashed hover:border-primary/30 hover:bg-accent/50 hover:shadow-md transition-all flex flex-col items-center justify-center p-6 cursor-pointer"
            role="button"
            onClick={() => router.push('/notebooks/new')}
          >
            <PlusCircle className="h-8 w-8 text-primary/70 mb-4" />
            <h3 className="font-medium">New Notebook</h3>
            <p className="text-sm text-muted-foreground mt-1">Start with a blank notebook</p>
          </Card>
          
          {displayedNotebooks.map((notebook) => (
            <Card 
              key={notebook.id}
              className={cn(
                "h-full hover:shadow-md transition-all border-border/50 relative group",
                view === 'grid' ? 'flex flex-col' : 'flex flex-row items-center'
              )}
              onClick={() => router.push(`/notebooks/${notebook.id}`)}
              role="button"
            >
              {/* Quick actions shown on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => toggleFavorite(notebook, e)}>
                      {notebook.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
              
              {/* Favorite indicator */}
              {notebook.isFavorite && (
                <div className="absolute top-2 left-2">
                  <Star className="h-4 w-4 text-amber-400" />
                </div>
              )}
              
              <div className={cn(
                view === 'grid' ? 'w-full' : 'w-2/3'
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className={cn(
                      view === 'grid' ? 'line-clamp-1' : 'text-lg line-clamp-1 flex-1'
                    )}>
                      {notebook.title || 'Untitled Notebook'}
                    </CardTitle>
                    {notebook.updatedAt && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {notebook.content?.substring(0, 120) || 'No content yet'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {notebook.tags && Array.isArray(notebook.tags) && notebook.tags.length > 0 ? (
                      notebook.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {typeof tag === 'string' ? tag : tag.name || 'Untitled'}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    )}
                    {notebook.tags && Array.isArray(notebook.tags) && notebook.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{notebook.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Book className="h-3.5 w-3.5" />
                      <span>{notebook.entryCount || 0} entries</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{Math.round((notebook.wordCount || 0) / 200)} min read</span>
                    </div>
                  </div>
                </CardContent>
              </div>
              {view !== 'grid' && (
                <div className="flex-shrink-0 p-4">
                  <Button 
                    variant="outline"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/notebooks/${notebook.id}`);
                    }}
                  >
                    Open
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Bulk actions bar */}
      {selectedNotebooks.length > 0 && (
        <div className="bg-muted/80 backdrop-blur-sm fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2.5 rounded-lg shadow-lg border z-10 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{selectedNotebooks.length} selected</span>
          <Button
            variant="ghost" 
            size="sm"
            className="text-xs"
            onClick={() => setSelectedNotebooks([])}
          >
            Clear selection
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="ml-2 gap-1.5"
            onClick={() => {
              setNotebookToDelete(selectedNotebooks);
              setShowDeleteAlert(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </Button>
        </div>
      )}
      
      {/* Mobile bottom navigation */}
      <MobileBottomNav onCreateNew={() => router.push('/notebooks/new')} />
      
      {/* Add padding for bottom nav on mobile */}
      <div className="md:hidden h-20"></div>
    </div>
  );
}
