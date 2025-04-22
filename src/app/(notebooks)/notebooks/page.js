"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { Search, Plus, Tag, CalendarDays, Clock, Filter } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function NotebooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNotebook, setNewNotebook] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSessionLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Fetch notebooks when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotebooks();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [isAuthenticated, status]);

  // Fetch notebooks from the API
  const fetchNotebooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notebooks');
      if (response.ok) {
        const data = await response.json();
        setNotebooks(data);
      } else {
        console.error('Failed to fetch notebooks');
      }
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === '') {
      fetchNotebooks();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks?q=${encodeURIComponent(e.target.value)}`);
      if (response.ok) {
        const data = await response.json();
        setNotebooks(data);
      } else {
        console.error('Failed to search notebooks');
      }
    } catch (error) {
      console.error('Error searching notebooks:', error);
    } finally {
      setIsLoading(false);
    }
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
        setNotebooks([data, ...notebooks]);
        setNewNotebook({ title: '', content: '', tags: '' });
        setIsDialogOpen(false);
      } else {
        console.error('Failed to create notebook');
      }
    } catch (error) {
      console.error('Error creating notebook:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // View a notebook
  const handleViewNotebook = (id) => {
    router.push(`/notebooks/${id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notebooks</h1>
          <p className="text-muted-foreground mt-1">
            Capture your thoughts and track your personal growth
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-60 lg:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notebooks..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('Filter by date')}>Most recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Filter by name')}>Alphabetical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Notebook
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
                  <Textarea
                    id="content"
                    placeholder="What's on your mind today?"
                    rows={5}
                    value={newNotebook.content}
                    onChange={(e) => setNewNotebook({...newNotebook, content: e.target.value})}
                  />
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
              <Button onClick={() => setIsDialogOpen(true)}>Create Your First Notebook</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <Card
                key={notebook.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewNotebook(notebook.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {format(new Date(notebook.updatedAt), 'MMMM d, yyyy')}
                  </div>
                  <CardTitle>{notebook.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                    {notebook.content ? (
                      // Try to parse JSON content for Editor.js data
                      (() => {
                        try {
                          const parsed = JSON.parse(notebook.content);
                          if (parsed.blocks) {
                            return parsed.blocks
                              .filter(block => block.type === 'paragraph')
                              .map(block => block.data.text)
                              .join(' ')
                              .substring(0, 150) + '...';
                          }
                          return notebook.content.substring(0, 150) + '...';
                        } catch (e) {
                          return notebook.content.substring(0, 150) + '...';
                        }
                      })()
                    ) : 'No content'}
                  </p>

                  {notebook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {notebook.tags.map(tag => (
                        <div key={tag.id} className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
