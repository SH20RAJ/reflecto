import React, { useEffect, useState } from 'react';
import NovelEditor from "@/components/NovelEditor";
import { toast } from "sonner";

const NotebookEditor = ({ 
  initialContent, 
  onChange, 
  autoSaveEnabled = true,
  onAutoSave,
  notebookId
}) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [content, setContent] = useState(initialContent || '');

  // Handle content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  // Autosave functionality
  useEffect(() => {
    if (!autoSaveEnabled || !content || !notebookId) return;

    // Create autosave timer
    const autoSaveTimer = setTimeout(async () => {
      try {
        // Only save if there's actual content and the notebook exists
        if (content && notebookId) {
          await onAutoSave();
          setLastSaved(new Date());
          // Optional: Show a subtle toast or indicator that autosave happened
          // toast.success("Notebook autosaved", { duration: 2000 });
        }
      } catch (error) {
        console.error('Autosave error:', error);
      }
    }, 10000); // 10 seconds

    // Cleanup timer on component unmount or when dependencies change
    return () => clearTimeout(autoSaveTimer);
  }, [content, autoSaveEnabled, notebookId, onAutoSave]);

  return (
    <div className="pt-4 border-t">
      {lastSaved && (
        <div className="text-xs text-muted-foreground mb-2 text-right">
          Last autosaved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      <NovelEditor
        initialValue={initialContent}
        onChange={handleContentChange}
        readOnly={false}
      />
    </div>
  );
};

export default NotebookEditor;
