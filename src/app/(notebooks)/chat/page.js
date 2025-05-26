"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NotebookChat from "@/components/NotebookChat";

export default function ChatPage() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  if (!isAuthenticated && status !== "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-medium">Sign in to use chat</h3>
          <p className="text-muted-foreground">Please sign in to chat with your notebook data.</p>
          <Button onClick={() => router.push('/auth/signin')} className="mt-2">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Beta Feature Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                BETA
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                AI Chat - Free Beta Access
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Open for testing • Premium feature coming soon
          </div>
        </div>
      </div>
      
      <NotebookChat />
    </div>
  );
}
