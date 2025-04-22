"use client";

import { useState, useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, Trash, FileText, Code, Save, X, Tag as TagIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import SimpleRichEditor from "@/components/SimpleRichEditor";
import MarkdownView from "@/components/MarkdownView";

// Import the htmlToMarkdown function
import { htmlToMarkdown } from '@/lib/html-to-markdown';

// Function to generate markdown from HTML content
const generateMarkdownFromContent = (content) => {
  try {
    // If content is a string, check if it's HTML or JSON
    if (typeof content === 'string') {
      // Check if it looks like JSON
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(content);
          // If it's Editor.js format, extract text
          if (parsed.blocks) {
            return parsed.blocks
              .map(block => {
                if (block.type === 'paragraph') return block.data.text;
                if (block.type === 'header') return '#'.repeat(block.data.level) + ' ' + block.data.text;
                return '';
              })
              .join('\n\n');
          }
          return content;
        } catch (e) {
          // If it's not valid JSON, treat it as HTML
          return htmlToMarkdown(content);
        }
      } else {
        // Treat as HTML
        return htmlToMarkdown(content);
      }
    }

    return content || '';
  } catch (error) {
    console.error('Error generating markdown:', error);
    return '';
  }
};

export default function NotebookPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const notebookId = unwrappedParams.id;

  const router = useRouter();
  const { data: session, status } = useSession();
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
          // Check if the content looks like JSON (starts with { or [)
          if (data.content.trim().startsWith('{') || data.content.trim().startsWith('[')) {
            try {
              const parsedContent = JSON.parse(data.content);
              // If it's Editor.js format, convert to HTML
              if (parsedContent.blocks) {
                const html = parsedContent.blocks
                  .map(block => {
                    if (block.type === 'paragraph') return `<p>${block.data.text}</p>`;
                    if (block.type === 'header') return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                    return '';
                  })
                  .join('');
                setEditorData(html);
              } else {
                // It's already in our format
                setEditorData(data.content);
              }
            } catch (e) {
              // If parsing fails, use content as is
              setEditorData(data.content);
            }
          } else {
            // Content is plain text or HTML, use as is
            setEditorData(data.content);
          }
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
        // Check if the content looks like JSON (starts with { or [)
        if (notebook.content.trim().startsWith('{') || notebook.content.trim().startsWith('[')) {
          try {
            const parsedContent = JSON.parse(notebook.content);
            // If it's Editor.js format, convert to HTML
            if (parsedContent.blocks) {
              const html = parsedContent.blocks
                .map(block => {
                  if (block.type === 'paragraph') return `<p>${block.data.text}</p>`;
                  if (block.type === 'header') return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                  return '';
                })
                .join('');
              setEditorData(html);
            } else {
              // It's already in our format
              setEditorData(notebook.content);
            }
          } catch (e) {
            // If parsing fails, use content as is
            setEditorData(notebook.content);
          }
        } else {
          // Content is plain text or HTML, use as is
          setEditorData(notebook.content);
        }
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-semibold mb-2"
                    placeholder="Notebook Title"
                  />
                ) : (
                  <CardTitle className="text-2xl">{notebook.title}</CardTitle>
                )}

                <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                  <span>Updated {format(new Date(notebook.updatedAt), 'MMMM d, yyyy')}</span>

                  {notebook.tags && notebook.tags.length > 0 && (
                    <div className="flex items-center gap-1 ml-4">
                      <TagIcon className="h-3 w-3" />
                      <div className="flex flex-wrap gap-1">
                        {notebook.tags.map(tag => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="editor" className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="markdown" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Markdown
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              editorData && (
                <SimpleRichEditor
                  initialValue={editorData}
                  onChange={(data) => setEditorData(data)}
                  readOnly={false}
                />
              )
            ) : (
              <Tabs value={viewMode} className="w-full">
                <TabsContent value="editor">
                  {editorData && (
                    <SimpleRichEditor
                      initialValue={editorData}
                      onChange={(data) => setEditorData(data)}
                      readOnly={true}
                    />
                  )}
                </TabsContent>
                <TabsContent value="markdown">
                  {/* Generate markdown from content on-the-fly */}
                  <MarkdownView
                    markdown={notebook.content ? generateMarkdownFromContent(notebook.content) : ''}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
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
