"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";

  if (error === "OAuthSignin") errorMessage = "Error starting the OAuth sign in process.";
  if (error === "OAuthCallback") errorMessage = "Error in the OAuth callback.";
  if (error === "OAuthCreateAccount") errorMessage = "Error creating OAuth account.";
  if (error === "EmailCreateAccount") errorMessage = "Error creating email account.";
  if (error === "Callback") errorMessage = "Error in the OAuth callback.";
  if (error === "OAuthAccountNotLinked") errorMessage = "Email already in use with different provider.";
  if (error === "EmailSignin") errorMessage = "Error sending the email for sign in.";
  if (error === "CredentialsSignin") errorMessage = "Invalid credentials.";
  if (error === "SessionRequired") errorMessage = "Please sign in to access this page.";
  if (error === "Default") errorMessage = "An unknown error occurred.";

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            There was a problem with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md mb-4">
            {errorMessage}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Loading fallback for Suspense
function AuthErrorFallback() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            There was a problem with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-4 animate-pulse h-12">
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component that wraps the client component in Suspense
export default function AuthError() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<AuthErrorFallback />}>
          <AuthErrorContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
