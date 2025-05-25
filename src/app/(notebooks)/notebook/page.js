"use client";

import Notebook from "@/components/Notebook";

export default function NotebookPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Reflections</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Write your thoughts and track your personal growth
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-2">
          <Notebook />
        </div>
      </div>
    </div>
  );
}
