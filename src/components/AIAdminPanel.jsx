'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, AlertCircle, CheckCircle, Database, Clock, Loader2 } from 'lucide-react';

/**
 * AI Admin Panel component
 * Allows regenerating embeddings for all notebooks
 */
export default function AIAdminPanel() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [queueStatus, setQueueStatus] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [notebookId, setNotebookId] = useState('');
  const [singleStatus, setSingleStatus] = useState('idle'); // idle, loading, success, error

  // Fetch queue status
  const fetchQueueStatus = async () => {
    try {
      const response = await fetch('/api/embeddings/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch queue status');
      }

      const data = await response.json();
      // The data structure from our endpoint has data.data with the queue info
      const queueInfo = data.data || data;
      setQueueStatus(queueInfo);
      
      // If there are items in the queue, continue polling
      if (queueInfo.isProcessing || queueInfo.queueLength > 0) {
        // Already polling, don't need to start another interval
        if (!pollInterval) {
          startPolling();
        }
      } else if (pollInterval) {
        // Nothing in the queue, stop polling
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  // Start polling the queue status
  const startPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    // Poll every 3 seconds
    const interval = setInterval(fetchQueueStatus, 3000);
    setPollInterval(interval);
  };

  // Effect for initial fetch and cleanup
  useEffect(() => {
    fetchQueueStatus();
    
    // Clean up polling when component unmounts
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  // Generate embeddings for all notebooks
  const generateAllEmbeddings = async () => {
    try {
      setStatus('loading');
      setMessage('Starting embedding generation for all notebooks...');
      setProgress(10);

      const response = await fetch('/api/embeddings/generate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setProgress(30);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start embedding generation');
      }

      // Start polling for queue status
      startPolling();

      // Process is running in the background
      setProgress(100);
      setStatus('success');
      setMessage('Embedding generation process has been started successfully! This process runs in the background and may take several minutes to complete.');
    } catch (error) {
      console.error('Error generating embeddings:', error);
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };
  
  // Generate embeddings for a specific notebook
  const generateNotebookEmbedding = async () => {
    if (!notebookId || notebookId.trim() === '') {
      setSingleStatus('error');
      return;
    }
    
    try {
      setSingleStatus('loading');
      
      const response = await fetch('/api/embeddings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notebookId: notebookId.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start embedding generation for notebook');
      }

      // Start polling for queue status
      startPolling();
      
      setSingleStatus('success');
      // Clear the input after successful submission
      setNotebookId('');
    } catch (error) {
      console.error('Error generating notebook embedding:', error);
      setSingleStatus('error');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} className="text-primary" /> AI Features Configuration
        </CardTitle>
        <CardDescription>
          Manage AI search and chat capabilities by generating vector embeddings for all notebooks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Queue Status Display */}
          {queueStatus && (
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Embedding Queue Status</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchQueueStatus}
                  title="Refresh queue status"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex flex-col p-3 border rounded-md bg-white">
                  <span className="text-xs text-muted-foreground">Queue Length</span>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-xl font-semibold">{queueStatus.queueLength}</span>
                  </div>
                </div>
                
                <div className="flex flex-col p-3 border rounded-md bg-white">
                  <span className="text-xs text-muted-foreground">Processing Status</span>
                  <div className="flex items-center mt-1">
                    {queueStatus.isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 text-amber-500 animate-spin" />
                        <span className="text-sm font-semibold">Processing</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm font-semibold">Idle</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col p-3 border rounded-md bg-white">
                  <span className="text-xs text-muted-foreground">Last Updated</span>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              
              {queueStatus.pendingIds && queueStatus.pendingIds.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-1">Pending Notebooks:</h4>
                  <div className="flex flex-wrap gap-2">
                    {queueStatus.pendingIds.map((id, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white">
                        {id.substring(0, 8)}...
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Notebooks Generation Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Generate All Embeddings</h3>
            <p className="text-muted-foreground mb-4">
              Vector embeddings allow the AI to understand the meaning of your notebook content for
              more accurate search and chat responses. Regenerate all embeddings if you've imported
              notebooks or if the search results don't seem relevant.
            </p>

            {status === 'success' && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success!</AlertTitle>
                <AlertDescription className="text-green-700">{message}</AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert className="mb-4 bg-red-50 border-red-200" variant="destructive">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Error</AlertTitle>
                <AlertDescription className="text-red-700">{message}</AlertDescription>
              </Alert>
            )}

            {status === 'loading' && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-blue-600 animate-spin" />
                  <p className="text-blue-600 text-sm">{message}</p>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <Button 
              onClick={generateAllEmbeddings} 
              disabled={status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  {status === 'success' ? 'Regenerate All Embeddings' : 'Generate All Embeddings'}
                </>
              )}
            </Button>
          </div>
          
          {/* Single Notebook Generation Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Generate Single Notebook Embedding</h3>
            <p className="text-muted-foreground mb-4">
              Generate or update embeddings for a specific notebook by entering the notebook ID.
              Use this feature when you've updated a specific notebook and want to refresh its embeddings.
            </p>
            
            <div className="flex gap-2 mb-4">
              <div className="flex-grow">
                <Input 
                  placeholder="Enter notebook ID" 
                  value={notebookId}
                  onChange={(e) => setNotebookId(e.target.value)}
                />
              </div>
              <Button 
                onClick={generateNotebookEmbedding} 
                disabled={singleStatus === 'loading' || !notebookId.trim()}
              >
                {singleStatus === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : singleStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
            
            {singleStatus === 'error' && (
              <Alert className="mt-2 bg-red-50 border-red-200" variant="destructive">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-xs">
                  Please enter a valid notebook ID
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchQueueStatus}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> 
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}
