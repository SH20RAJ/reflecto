"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AuthError() {
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
      </main>

      <Footer />
    </div>
  );
}
