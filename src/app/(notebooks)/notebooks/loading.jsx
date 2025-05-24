import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotebooksLoading() {
  return (
    <div className="container mx-auto p-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Skeleton className="h-10 w-60 mb-2" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="mt-4 md:mt-0 h-12 w-48" />
      </div>
      
      {/* Controls skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-6">
        <Skeleton className="h-10 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-14" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      
      {/* Featured card skeleton */}
      <Skeleton className="w-full h-32 mb-6" />
      
      {/* Notebooks grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full aspect-[4/3]" />
        ))}
      </div>
    </div>
  );
}
