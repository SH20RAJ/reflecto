"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Book, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Layout,
  Star,
  Tag,
  Check,
  Timer,
  Trash2,
  StarFilled,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
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

export default function PremiumDashboard() {
  const router = useRouter();
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState(null);
  const [filterStarred, setFilterStarred] = useState(false);
  const [selectedNotebooks, setSelectedNotebooks] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const { notebooks, isLoading, isError, mutate } = useNotebooks();
  const { notebooks: searchResults, isLoading: isSearching } = useSearchNotebooks(searchQuery || '');
  const { tags } = useTags();

  // Reset search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      mutate(); // Refresh notebooks when search query is cleared
    }
  }, [searchQuery, mutate]);
  
  // Filter and sort notebooks
  const displayedNotebooks = React.useMemo(() => {
    let filteredBooks = [];
    
    // Handle search results
    if (searchQuery && searchQuery.trim() !== '' && searchResults) {
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
          (tag.id === filterTag)
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
  }, [notebooks, searchResults, searchQuery, sortBy, filterTag, filterStarred]);

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
  
  // Clear all filters
  const clearFilters = () => {
    setFilterTag(null);
    setFilterStarred(false);
    setSearchQuery('');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading notebooks...</span>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
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
                    {!tags?.length && (
                      <div className="text-sm text-muted-foreground">No tags available</div>
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
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  disabled={!filterTag && !filterStarred}
                >
                  Clear filters
                </Button>
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
      
      {/* Notebooks Grid/List */}
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
              "h-full hover:shadow-md transition-all border-border/50",
              view === 'grid' ? 'flex flex-col' : 'flex flex-row items-center'
            )}
            onClick={() => router.push(`/notebooks/${notebook.id}`)}
            role="button"
          >
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
    </div>
  );
}
