import React, { useEffect, useState, useCallback } from 'react';
import NovelEditor from "@/components/NovelEditor";
import { toast } from "sonner";
import {
  isOffline,
  updateNotebookOptimistically,
  saveNotebookOffline,
  getNotebookSyncStatus,
  syncOfflineChanges,
  initOfflineSync
} from '@/lib/offlineStorage';

const NotebookEditor = ({
  initialContent,
  onChange,
  autoSaveEnabled = true,
  onAutoSave,
  notebookId,
  notebook
}) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [content, setContent] = useState(initialContent || '');
  const [offlineStatus, setOfflineStatus] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // Init offline sync and monitor network status
  useEffect(() => {
    const updateOfflineStatus = () => {
      const offline = isOffline();
      setOfflineStatus(offline);
    };

    updateOfflineStatus();

    // Initialize offline sync with callback for status notifications
    const cleanup = initOfflineSync(async (event) => {
      if (event.type === 'online') {
        toast.success('Connection restored, syncing changes...');

        // Try to sync when coming back online
        if (pendingSave) {
          await handleSyncChanges();
          setPendingSave(false);
        }

        // Show sync results
        if (event.syncResult?.syncedCount > 0) {
          toast.success(`Synced ${event.syncResult.syncedCount} changes`);
        }

        setOfflineStatus(false);
      } else if (event.type === 'offline') {
        toast.warning('You are offline. Changes will be saved locally.');
        setOfflineStatus(true);
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [pendingSave]);

  // Handle content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  // Handle syncing changes when back online
  const handleSyncChanges = useCallback(async () => {
    if (isOffline() || !notebookId) return;

    try {
      await onAutoSave();
      toast.success("Notebook synced successfully", { duration: 2000 });
    } catch (error) {
      console.error('Error syncing notebook:', error);
      toast.error("Failed to sync notebook. Will try again later.");
    }
  }, [notebookId, onAutoSave]);

  // Autosave functionality
  useEffect(() => {
    if (!autoSaveEnabled || !content || !notebookId) return;

    // Create autosave timer
    const autoSaveTimer = setTimeout(async () => {
      try {
        // Only save if there's actual content and the notebook exists
        if (content && notebookId) {
          if (isOffline()) {
            // Handle offline saving
            if (notebook) {
              updateNotebookOptimistically(notebookId, {
                content,
                updatedAt: new Date().toISOString()
              });

              saveNotebookOffline({
                ...notebook,
                content,
                updatedAt: new Date().toISOString()
              });

              setLastSaved(new Date());
              setPendingSave(true);
              toast.info("Changes saved locally. Will sync when online.", { duration: 3000 });
            }
          } else {
            // Online save
            await onAutoSave();
            setLastSaved(new Date());
            setPendingSave(false);
          }
        }
      } catch (error) {
        console.error('Autosave error:', error);

        // Fallback to local storage on error
        if (notebook) {
          updateNotebookOptimistically(notebookId, { content });
          saveNotebookOffline({
            ...notebook,
            content,
            updatedAt: new Date().toISOString()
          });
          setLastSaved(new Date());
          setPendingSave(true);
          toast.warning("Couldn't save to server. Changes saved locally.", { duration: 3000 });
        }
      }
    }, 5000); // 5 seconds

    // Cleanup timer on component unmount or when dependencies change
    return () => clearTimeout(autoSaveTimer);
  }, [content, autoSaveEnabled, notebookId, onAutoSave, notebook]);

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
