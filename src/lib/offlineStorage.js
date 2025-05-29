/**
 * Utility functions for handling offline data storage and synchronization
 */

// Save notebook to local storage for offline access
export const saveNotebookOffline = (notebook) => {
    try {
        // Get existing offline notebooks
        const offlineNotebooks = JSON.parse(localStorage.getItem('reflecto-offline-notebooks') || '[]');

        // Check if notebook already exists in offline storage
        const existingIndex = offlineNotebooks.findIndex(n => n.id === notebook.id);

        if (existingIndex >= 0) {
            // Update existing notebook
            offlineNotebooks[existingIndex] = {
                ...notebook,
                lastUpdated: new Date().toISOString(),
                syncStatus: 'pending'
            };
        } else {
            // Add new notebook
            offlineNotebooks.push({
                ...notebook,
                lastUpdated: new Date().toISOString(),
                syncStatus: 'pending'
            });
        }

        // Save back to localStorage
        localStorage.setItem('reflecto-offline-notebooks', JSON.stringify(offlineNotebooks));
        return true;
    } catch (error) {
        console.error('Error saving notebook offline:', error);
        return false;
    }
};

// Get a notebook from offline storage
export const getOfflineNotebook = (notebookId) => {
    try {
        const offlineNotebooks = JSON.parse(localStorage.getItem('reflecto-offline-notebooks') || '[]');
        return offlineNotebooks.find(notebook => notebook.id === notebookId) || null;
    } catch (error) {
        console.error('Error getting offline notebook:', error);
        return null;
    }
};

// Get all offline notebooks
export const getAllOfflineNotebooks = () => {
    try {
        return JSON.parse(localStorage.getItem('reflecto-offline-notebooks') || '[]');
    } catch (error) {
        console.error('Error getting all offline notebooks:', error);
        return [];
    }
};

// Queue an API operation for later syncing when back online
export const queueOfflineOperation = (url, method, data) => {
    try {
        const pendingOperations = JSON.parse(localStorage.getItem('reflecto-offline-operations') || '[]');

        pendingOperations.push({
            url,
            method,
            data,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('reflecto-offline-operations', JSON.stringify(pendingOperations));
        return true;
    } catch (error) {
        console.error('Error queuing offline operation:', error);
        return false;
    }
};

// Optimistic update of notebook
export const updateNotebookOptimistically = (notebookId, updates) => {
    try {
        // Get existing notebooks from cache
        const offlineNotebooks = JSON.parse(localStorage.getItem('reflecto-offline-notebooks') || '[]');

        // Find the notebook
        const index = offlineNotebooks.findIndex(n => n.id === notebookId);

        if (index >= 0) {
            // Update notebook with new data
            offlineNotebooks[index] = {
                ...offlineNotebooks[index],
                ...updates,
                lastUpdated: new Date().toISOString(),
                syncStatus: 'pending'
            };

            // Save back to localStorage
            localStorage.setItem('reflecto-offline-notebooks', JSON.stringify(offlineNotebooks));

            // Queue the update operation for later sync
            queueOfflineOperation(
                `/api/notebooks/${notebookId}`,
                'PUT',
                updates
            );

            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating notebook optimistically:', error);
        return false;
    }
};

// Check if we're offline
export const isOffline = () => {
    return typeof navigator !== 'undefined' && !navigator.onLine;
};

// Get pending operations count
export const getPendingOperationsCount = () => {
    try {
        const pendingOperations = JSON.parse(localStorage.getItem('reflecto-offline-operations') || '[]');
        return pendingOperations.length;
    } catch (error) {
        console.error('Error getting pending operations count:', error);
        return 0;
    }
};

// Process all pending operations when back online
export const syncOfflineChanges = async () => {
    if (isOffline()) return { success: false, message: 'Still offline' };

    try {
        const pendingOperations = JSON.parse(localStorage.getItem('reflecto-offline-operations') || '[]');

        if (pendingOperations.length === 0) {
            return { success: true, message: 'No pending changes to sync', syncedCount: 0 };
        }

        const results = [];
        const failedOperations = [];

        // Process each operation sequentially to avoid race conditions
        for (const operation of pendingOperations) {
            try {
                const response = await fetch(operation.url, {
                    method: operation.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(operation.data),
                });

                if (!response.ok) {
                    throw new Error(`Failed to sync operation: ${response.status}`);
                }

                results.push({
                    success: true,
                    url: operation.url,
                    data: await response.json()
                });
            } catch (error) {
                console.error('Error syncing operation:', error);
                failedOperations.push(operation);
                results.push({
                    success: false,
                    url: operation.url,
                    error: error.message
                });
            }
        }

        // Update storage to only keep failed operations
        localStorage.setItem('reflecto-offline-operations', JSON.stringify(failedOperations));

        // Update notebook sync status
        updateNotebookSyncStatus();

        return {
            success: true,
            message: `Synced ${results.length - failedOperations.length} of ${results.length} operations`,
            results,
            syncedCount: results.length - failedOperations.length,
            failedCount: failedOperations.length
        };
    } catch (error) {
        console.error('Error in sync process:', error);
        return {
            success: false,
            message: `Sync failed: ${error.message}`,
            error
        };
    }
};

// Update notebook sync status based on pending operations
export const updateNotebookSyncStatus = () => {
    try {
        const offlineNotebooks = JSON.parse(localStorage.getItem('reflecto-offline-notebooks') || '[]');
        const pendingOperations = JSON.parse(localStorage.getItem('reflecto-offline-operations') || '[]');

        // Group pending operations by notebook ID
        const pendingByNotebook = pendingOperations.reduce((acc, op) => {
            // Extract notebook ID from URL path like /api/notebooks/123
            const matches = op.url.match(/\/notebooks\/([^\/]+)/);
            if (matches && matches[1]) {
                const notebookId = matches[1];
                acc[notebookId] = [...(acc[notebookId] || []), op];
            }
            return acc;
        }, {});

        // Update sync status for each notebook
        const updatedNotebooks = offlineNotebooks.map(notebook => {
            const hasPendingOps = pendingByNotebook[notebook.id] && pendingByNotebook[notebook.id].length > 0;
            return {
                ...notebook,
                syncStatus: hasPendingOps ? 'pending' : 'synced'
            };
        });

        localStorage.setItem('reflecto-offline-notebooks', JSON.stringify(updatedNotebooks));
        return true;
    } catch (error) {
        console.error('Error updating notebook sync status:', error);
        return false;
    }
};

// Get the sync status for a specific notebook
export const getNotebookSyncStatus = (notebookId) => {
    try {
        const offlineNotebooks = JSON.parse(localStorage.getItem('reflecto-offline-notebooks') || '[]');
        const notebook = offlineNotebooks.find(n => n.id === notebookId);

        if (!notebook) return 'unknown';
        return notebook.syncStatus || 'unknown';
    } catch (error) {
        console.error('Error getting notebook sync status:', error);
        return 'error';
    }
};

// Register network status event listeners
export const initOfflineSync = (callback = () => { }) => {
    if (typeof window === 'undefined') return;

    // When coming back online, try to sync changes
    window.addEventListener('online', async () => {
        const result = await syncOfflineChanges();
        callback({
            type: 'online',
            message: 'Connection restored',
            syncResult: result
        });
    });

    // When going offline, update UI
    window.addEventListener('offline', () => {
        callback({
            type: 'offline',
            message: 'Connection lost, switching to offline mode'
        });
    });

    return () => {
        window.removeEventListener('online', syncOfflineChanges);
        window.removeEventListener('offline', () => { });
    };
};
