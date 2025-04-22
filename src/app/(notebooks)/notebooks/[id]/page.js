"use client";

import { useState, useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, Trash, FileText, Code, Save, X, Tag as TagIcon, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import MarkdownEditor from "@/components/MarkdownEditor";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Helper function to ensure content is in markdown format
const ensureMarkdownFormat = (content) => {
  if (!content) return '';

  try {
    // Check if content might be in JSON format (legacy)
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.blocks) {
          // Convert Editor.js format to markdown
          return parsed.blocks
            .map(block => {
              if (block.type === 'paragraph') return block.data.text;
              if (block.type === 'header') return '#'.repeat(block.data.level) + ' ' + block.data.text;
              if (block.type === 'list') {
                return block.data.items.map(item => `- ${item}`).join('\n');
              }
              if (block.type === 'quote') return `> ${block.data.text}`;
              if (block.type === 'code') return `\`\`\`${block.data.language || ''}\n${block.data.code}\n\`\`\``;
              return '';
            })
            .filter(text => text)
            .join('\n\n');
        }
      } catch (e) {
        // Not valid JSON, return as is
      }
    }
    return content;
  } catch (e) {
    console.error('Error processing content:', e);
    return content;
  }
};

export default function NotebookPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const notebookId = unwrappedParams.id;

  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [notebook, setNotebook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorData, setEditorData] = useState(null);
  const [title, setTitle] = useState('');
  const [viewMode, setViewMode] = useState('editor');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && notebookId) {
      fetchNotebook();
    } else if (status === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, notebookId, status]);

  const fetchNotebook = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks/${notebookId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Notebook not found");
          router.push('/notebooks');
          return;
        }
        throw new Error('Failed to fetch notebook');
      }

      const data = await response.json();
      setNotebook(data);
      setTitle(data.title);

      // Set editor data from content
      if (typeof data.content === 'string' && data.content) {
        try {
          // Process content to ensure it's in markdown format
          const markdownContent = ensureMarkdownFormat(data.content);
          setEditorData(markdownContent);
        } catch (error) {
          console.error('Error handling notebook content:', error);
          setEditorData(data.content || '');
        }
      } else {
        // Set empty editor data
        setEditorData('');
      }
    } catch (error) {
      console.error('Error fetching notebook:', error);
      toast.error("Error loading notebook");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorSave = async () => {
    if (!isEditing) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: JSON.stringify(editorData),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notebook');
      }

      const updatedNotebook = await response.json();
      setNotebook(updatedNotebook);
      setIsEditing(false);
      toast.success("Notebook saved successfully");
    } catch (error) {
      console.error('Error updating notebook:', error);
      toast.error("Failed to save notebook");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notebook');
      }

      toast.success("Notebook deleted successfully");
      router.push('/notebooks');
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error("Failed to delete notebook");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(notebook.title);

    // Reset editor data to original
    if (typeof notebook.content === 'string' && notebook.content) {
      try {
        // Process content to ensure it's in markdown format
        const markdownContent = ensureMarkdownFormat(notebook.content);
        setEditorData(markdownContent);
      } catch (error) {
        console.error('Error handling notebook content:', error);
        setEditorData(notebook.content || '');
      }
    } else {
      // Set empty editor data
      setEditorData('');
    }
  };

  if (!isAuthenticated && status !== "loading") {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => router.push('/notebooks')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notebooks
        </Button>

        {!isLoading && notebook && !isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your notebook.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleEditorSave}
              disabled={isSaving}
              className="gap-1"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ) : notebook ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-4xl font-bold mb-2 border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Untitled"
                    />
                  ) : (
                    <h1 className="text-4xl font-bold">{notebook.title}</h1>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {format(new Date(notebook.createdAt), 'MMMM d, yyyy')}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Updated {format(new Date(notebook.updatedAt), 'MMMM d, yyyy h:mm a')}</span>
                </div>

                {notebook.tags && notebook.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <TagIcon className="h-3.5 w-3.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {notebook.tags.map(tag => (
                        <Badge key={tag.id} variant="outline" className="text-xs rounded-full px-2 py-0 h-5">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              {!isEditing && (
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="editor" className="flex items-center gap-1.5 text-xs">
                      <Code className="h-3.5 w-3.5" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="markdown" className="flex items-center gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      Raw Markdown
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            {isEditing ? (
              editorData && (
                <MarkdownEditor
                  initialValue={editorData}
                  onChange={(data) => setEditorData(data)}
                  readOnly={false}
                />
              )
            ) : (
              <Tabs value={viewMode} className="w-full">
                <TabsContent value="editor">
                  {editorData && (
                    <MarkdownEditor
                      initialValue={editorData}
                      onChange={(data) => setEditorData(data)}
                      readOnly={true}
                    />
                  )}
                </TabsContent>
                <TabsContent value="markdown">
                  {/* Display markdown directly */}
                  <MarkdownEditor
                    initialValue={notebook.content || ''}
                    readOnly={true}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Notebook not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/notebooks')}
          >
            Go back to notebooks
          </Button>
        </div>
      )}
    </div>
  );
}
