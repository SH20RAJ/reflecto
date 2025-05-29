'use client';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

const PWAManager = () => {
    useEffect(() => {
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            // Register our service worker
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('PWA: Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('PWA: Service Worker registration failed:', error);
                });

            // Event listener for online status
            const handleOnlineStatus = () => {
                if (navigator.onLine) {
                    toast.success('You are back online! Syncing changes...');
                    syncOfflineChanges();
                } else {
                    toast.warning('You are offline. Changes will be saved locally and synced when you reconnect.', {
                        duration: 5000,
                    });
                }
            };

            // Add event listeners for online/offline
            window.addEventListener('online', handleOnlineStatus);
            window.addEventListener('offline', handleOnlineStatus);

            // Check initial status
            if (!navigator.onLine) {
                toast.warning('You are offline. Changes will be saved locally and synced when you reconnect.', {
                    duration: 5000,
                });
            }

            // Cleanup event listeners
            return () => {
                window.removeEventListener('online', handleOnlineStatus);
                window.removeEventListener('offline', handleOnlineStatus);
            };
        }
    }, []);

    // Function to sync offline changes when back online
    const syncOfflineChanges = async () => {
        // Get any pending operations from IndexedDB or localStorage
        const pendingOperations = JSON.parse(localStorage.getItem('reflecto-offline-operations') || '[]');

        if (pendingOperations.length === 0) return;

        try {
            // Process each operation one by one
            for (const operation of pendingOperations) {
                try {
                    const { url, method, data, timestamp } = operation;

                    const response = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...data,
                            _offlineTimestamp: timestamp,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to sync operation: ${response.statusText}`);
                    }
                } catch (err) {
                    console.error('Error syncing operation:', err);
                    // We'll keep this operation in the queue for next attempt
                    continue;
                }
            }

            // Clear synced operations
            localStorage.removeItem('reflecto-offline-operations');
            toast.success('All offline changes have been synced successfully!');
        } catch (error) {
            console.error('Error syncing offline changes:', error);
            toast.error('Some changes could not be synced. Will try again later.');
        }
    };

    return null; // This component doesn't render anything
};

export default PWAManager;
