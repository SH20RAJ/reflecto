import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const NotebookSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <Skeleton className="h-12 w-3/4 mb-2" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
        </div>
      </div>
    </div>
  );
};

export default NotebookSkeleton;
