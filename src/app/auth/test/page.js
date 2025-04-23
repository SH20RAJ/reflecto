"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function AuthTest() {
  const { data: session, status } = useSession();
  const [envCheck, setEnvCheck] = useState(null);
  const [authDebug, setAuthDebug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch environment check data
        const envResponse = await fetch('/api/env-check');
        const envData = await envResponse.json();
        setEnvCheck(envData);

        // Fetch auth debug data
        const authResponse = await fetch('/api/auth-debug');
        const authData = await authResponse.json();
        setAuthDebug(authData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/notebooks" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Authentication Test Page</h1>
            <p className="text-muted-foreground">
              This page helps diagnose authentication issues with your Reflecto application.
            </p>
          </div>
          
          <Tabs defaultValue="session">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="session">Session</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="auth-debug">Auth Debug</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="session" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-bold mb-4">Session Status: {status}</h2>
              
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Session Data:</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="environment" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
              
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Environment Check:</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(envCheck, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="auth-debug" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-bold mb-4">Auth Debug Information</h2>
              
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Auth Debug Data:</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(authDebug, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="actions" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-bold mb-4">Authentication Actions</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Test the sign-in process with Google
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleGoogleSignIn}
                      className="w-full"
                    >
                      Sign in with Google
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sign Out</CardTitle>
                    <CardDescription>
                      Test the sign-out process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full"
                      variant="destructive"
                    >
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Navigation</CardTitle>
                    <CardDescription>
                      Navigate to other relevant pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <Button asChild variant="outline">
                      <Link href="/auth/signin">Sign In Page</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/notebooks">Notebooks</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/">Home</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
