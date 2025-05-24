"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  Save,
  Calendar,
  Clock,
  Tag,
  MoreVertical,
  ArrowLeft,
  Share2,
  Download,
  Trash2,
  MessageSquare,
  Star,
  StarOff,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const useNotebook = (id) => {
  const [notebook, setNotebook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotebook = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const res = await fetch(`/api/notebooks/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch notebook');
        }
        
        const data = await res.json();
        setNotebook(data);
      } catch (err) {
        setError(err.message);
        toast.error("Couldn't load notebook");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotebook();
  }, [id]);
  
  return { notebook, setNotebook, isLoading, error };
};

export default function SimplifiedNotebookPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: session } = useSession();
  const { notebook, setNotebook, isLoading, error } = useNotebook(id);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  // Initialize form data when notebook is loaded
  useEffect(() => {
    if (notebook) {
      setTitle(notebook.title || 'Untitled Notebook');
      setContent(notebook.content || '');
      setIsFavorite(notebook.isFavorite || false);
    }
  }, [notebook]);
  
  // Save notebook function
  const saveNotebook = async () => {
    if (!id || !title.trim()) return;
    
    try {
      setIsSaving(true);
      
      const res = await fetch(`/api/notebooks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content,
          isFavorite: isFavorite,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save notebook');
      }
      
      const updatedNotebook = await res.json();
      setNotebook(updatedNotebook);
      setLastSaved(new Date());
      toast.success('Notebook saved');
    } catch (err) {
      console.error('Error saving notebook:', err);
      toast.error("Couldn't save notebook");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Auto-save on content change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notebook && (title !== notebook.title || content !== notebook.content)) {
        saveNotebook();
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [title, content]);

  // Toggle favorite
  const toggleFavorite = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    try {
      const res = await fetch(`/api/notebooks/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: newFavoriteState,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      toast.success(newFavoriteState ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      setIsFavorite(!newFavoriteState); // Revert on error
      toast.error("Couldn't update favorite status");
    }
  };
  
  // Delete notebook
  const deleteNotebook = async () => {
    try {
      const res = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete notebook');
      }
      
      toast.success('Notebook deleted');
      router.push('/notebooks');
    } catch (err) {
      console.error('Error deleting notebook:', err);
      toast.error("Couldn't delete notebook");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          <span>Loading notebook...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => router.push('/notebooks')}>Back to Notebooks</Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/notebooks')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl md:text-2xl font-medium">Notebook</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                    className="rounded-full"
                  >
                    {isFavorite ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => router.push(`/chat?notebook=${id}`)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
            
            <Button
              variant={isSaving ? "secondary" : "default"}
              size="sm"
              className="gap-1.5"
              onClick={saveNotebook}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={() => window.print()}>
                  <Download className="h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 text-red-500 focus:text-red-500" 
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Title input */}
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notebook title"
            className="border-none bg-transparent text-3xl font-bold p-0 focus-visible:ring-0 h-auto"
          />
        </div>
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Created {notebook?.createdAt ? format(new Date(notebook.createdAt), 'MMM d, yyyy') : 'Just now'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>Updated {lastSaved || notebook?.updatedAt ? format(new Date(lastSaved || notebook?.updatedAt), 'MMM d, yyyy h:mm a') : 'Just now'}</span>
          </div>
          {notebook?.tags && notebook.tags.length > 0 && (
            <div className="flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              <div className="flex flex-wrap gap-1.5">
                {notebook.tags.map(tag => (
                  <Badge key={tag.id} variant="outline" className="text-xs py-0">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="bg-card rounded-lg border border-border/50 shadow-sm">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your notebook content here..."
            className="min-h-[50vh] border-none rounded-lg resize-none p-4 focus-visible:ring-0"
          />
        </div>
        
        {/* Delete alert dialog */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this notebook and all of its contents.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600"
                onClick={deleteNotebook}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
