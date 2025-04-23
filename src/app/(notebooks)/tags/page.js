"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTags } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag, Search, Grid, List, ArrowLeft } from 'lucide-react';
import NotebookSidebar from '@/components/NotebookSidebar';

const TagsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = status === 'authenticated';
  
  // Get tags data using SWR
  const { tags, isLoading, isError } = useTags();
  
  // State for search and view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid'); // 'grid' or 'list'
  
  // Filter tags based on search query
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle search input change
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Toggle view mode
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    router.push(`/tags?view=${mode}`, { scroll: false });
  };
  
  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                All Tags
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse and manage your notebook tags
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 h-9">
                    {viewMode === 'grid' ? (
                      <Grid className="h-3.5 w-3.5" />
                    ) : (
                      <List className="h-3.5 w-3.5" />
                    )}
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleViewMode('grid')}>
                    <Grid className="mr-2 h-4 w-4" />
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleViewMode('list')}>
                    <List className="mr-2 h-4 w-4" />
                    List View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link href="/notebooks">
                <Button variant="ghost" size="sm" className="gap-1 h-9">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Notebooks
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tags..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </div>
          
          {/* Tags Grid/List */}
          {isLoading ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
              : "space-y-3"
            }>
              {Array(8).fill(0).map((_, i) => (
                viewMode === 'grid' ? (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-12" />
                    </CardContent>
                  </Card>
                ) : (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                )
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Error loading tags. Please try again.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tags found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term' : 'Create tags by adding them to your notebooks'}
              </p>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTags.map((tag) => (
                  <Link key={tag.id} href={`/notebooks?tag=${tag.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-lg">{tag.name}</h3>
                        </div>
                        <Badge variant="secondary">{tag.count} {tag.count === 1 ? 'notebook' : 'notebooks'}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTags.map((tag) => (
                  <Link key={tag.id} href={`/notebooks?tag=${tag.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Tag className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      <Badge variant="secondary">{tag.count} {tag.count === 1 ? 'notebook' : 'notebooks'}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default TagsPage;
