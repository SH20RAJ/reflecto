"use client";

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useTags } from '@/lib/hooks';
import { toast } from "sonner";

import {
  NotebookHeader,
  NotebookActions,
  NotebookEditor,
  NotebookSkeleton,
  NotFoundState
} from '@/components/notebook';




export default function NotebookPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const notebookId = unwrappedParams.id;

  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [notebook, setNotebook] = useState(null);
  const [editorData, setEditorData] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Fetch all available tags
  const { tags: allTags } = useTags();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotebook = useCallback(async () => {
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
      setSelectedTags(data.tags || []);

      // Set editor data from content
      if (typeof data.content === 'string' && data.content) {
        // Simply set the content as is - the editor will handle markdown formatting
        setEditorData(data.content);
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
  }, [notebookId, router]);

  useEffect(() => {
    if (isAuthenticated && notebookId) {
      fetchNotebook();
    } else if (status === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, notebookId, status, fetchNotebook, router]);

  const handleEditorSave = async (isAutoSave = false) => {
    try {
      if (!isAutoSave) {
        setIsSaving(true);
      }

      // Process tags correctly - extract tag names for new tags and IDs for existing tags
      const processedTags = selectedTags.map(tag => {
        // If it's a new tag (has a temporary ID starting with 'new-'), send the name
        if (tag.id.startsWith('new-')) {
          return tag.name;
        }
        // Otherwise, send the ID for existing tags
        return tag.id;
      });

      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: editorData,
          tags: processedTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notebook');
      }

      const updatedNotebook = await response.json();
      setNotebook(updatedNotebook);

      if (!isAutoSave) {
        toast.success("Notebook saved successfully");
      }
    } catch (error) {
      console.error('Error updating notebook:', error);
      if (!isAutoSave) {
        toast.error("Failed to save notebook");
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
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

  const handleAutoSave = async () => {
    await handleEditorSave(true);
  };



  if (!isAuthenticated && status !== "loading") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="relative p-4 md:p-8 lg:p-12   mx-auto">
      {/* Actions Bar */}
      {!isLoading && notebook && (
        <NotebookActions
          onBack={() => router.push('/notebooks')}
          onSave={handleEditorSave}
          onDelete={handleDelete}
          isSaving={isSaving}
          isDeleting={isDeleting}
        />
      )}

      {isLoading ? (
        <NotebookSkeleton />
      ) : notebook ? (
        <div className="mx-auto pt-2 md:pt-0">
          {/* Header with title, metadata and tags */}
          <NotebookHeader
            notebook={notebook}
            title={title}
            setTitle={setTitle}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          />

          {/* Editor */}
          <NotebookEditor
            initialContent={editorData}
            onChange={setEditorData}
            autoSaveEnabled={true}
            onAutoSave={handleAutoSave}
            notebookId={notebookId}
          />
        </div>
      ) : (
        <NotFoundState onBack={() => router.push('/notebooks')} />
      )}
    </div>
  );
}
