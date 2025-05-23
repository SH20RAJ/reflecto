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
    <div className="flex flex-col h-[calc(100vh)]">
      <NotebookChat />
    </div>
  );
}
