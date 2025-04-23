"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function DbTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      setResult(data);
      if (data.status === 'error') {
        setError(data.message || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Test the connection to your Turso database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Testing connection...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : result?.status === 'success' ? (
            <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Connection Successful</AlertTitle>
              <AlertDescription>Successfully connected to the database</AlertDescription>
            </Alert>
          ) : null}
          
          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Response:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Check if the required environment variables are set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">TURSO_DATABASE_URL</h3>
              <div className={`text-sm ${result?.environment?.TURSO_DATABASE_URL_SET ? 'text-green-600' : 'text-red-600'}`}>
                {result?.environment?.TURSO_DATABASE_URL_SET ? 'Set' : 'Not set'}
              </div>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">TURSO_AUTH_TOKEN</h3>
              <div className={`text-sm ${result?.environment?.TURSO_AUTH_TOKEN_SET ? 'text-green-600' : 'text-red-600'}`}>
                {result?.environment?.TURSO_AUTH_TOKEN_SET ? 'Set' : 'Not set'}
              </div>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">TURSO_DB_URL</h3>
              <div className={`text-sm ${result?.environment?.TURSO_DB_URL_SET ? 'text-green-600' : 'text-red-600'}`}>
                {result?.environment?.TURSO_DB_URL_SET ? 'Set' : 'Not set'}
              </div>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">TURSO_DB_AUTH_TOKEN</h3>
              <div className={`text-sm ${result?.environment?.TURSO_DB_AUTH_TOKEN_SET ? 'text-green-600' : 'text-red-600'}`}>
                {result?.environment?.TURSO_DB_AUTH_TOKEN_SET ? 'Set' : 'Not set'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
