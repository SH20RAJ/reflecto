"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PremiumNotebookSidebar from "@/components/PremiumNotebookSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="flex h-screen w-full">
    <div className="w-64 border-r border-border/30 p-6">
      <Skeleton className="h-6 w-32 mb-8" />
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
    <div className="flex-1 p-10">
      <Skeleton className="h-10 w-64 mb-10" />
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-8" />
      
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  </div>
);

export default function NotebookLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

   return (
    <motion.div 
      className="h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex min-h-screen">
        <div className="hidden md:block max-w-68 border-r border-border/30">
          <PremiumNotebookSidebar />
        </div>
        <div className="flex-1 w-full bg-background overflow-y-auto h-screen">
          <div className="w-full mx-auto h-full">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
