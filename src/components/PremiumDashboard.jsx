"use client";

import React, { useState } from 'react';
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
  Layout
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNotebooks, useSearchNotebooks } from '@/lib/hooks';

export default function PremiumDashboard() {
  const router = useRouter();
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const { notebooks, isLoading, isError, mutate } = useNotebooks();
  const { notebooks: searchResults, isLoading: isSearching } = useSearchNotebooks(searchQuery || '');

  const displayedNotebooks = React.useMemo(() => {
    if (searchQuery && searchQuery.trim() !== '' && searchResults) {
      return searchResults;
    }
    if (!notebooks) return [];
    
    const sorted = [...notebooks].sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
    return sorted;
  }, [notebooks, searchResults, searchQuery, sortBy]);

  if (isLoading || isSearching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading notebooks...</div>
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
        
        <Button className="mt-4 md:mt-0" onClick={() => router.push('/notebooks/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Notebook
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
          <Button variant="default" size="sm" className="bg-primary text-primary-foreground">All</Button>
          <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1" />Filter</Button>
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
      
      {/* Notebooks Grid */}
      <div className={cn(
        'grid gap-4 animate-in fade-in-50',
        view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'
      )}>
        {displayedNotebooks.map((notebook) => (
          <Link href={`/notebooks/${notebook.id}`} key={notebook.id}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1">{notebook.title}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notebook.updatedAt), 'MMM d')}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {notebook.content?.substring(0, 120) || 'No content yet'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {notebook.tags && Array.isArray(notebook.tags) ? (
                    notebook.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="flex items-center">
                        <Badge variant="secondary" className="text-xs">
                          {typeof tag === 'string' ? tag : tag.name || 'Untitled'}
                        </Badge>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
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
            </Card>
          </Link>
        ))}
        
        {/* Create new notebook card */}
        <Link href="/notebooks/new">
          <Card className="h-full border-dashed hover:border-primary/30 hover:bg-accent/50 transition-colors flex flex-col items-center justify-center p-6">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="font-medium">Create new notebook</h3>
            <p className="text-sm text-muted-foreground mt-1">Start with a blank notebook</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
