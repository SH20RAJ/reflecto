"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function CreateNotebook() {
  const router = useRouter();
  
  // Create a new notebook and immediately navigate to it
  useEffect(() => {
    const createNewNotebook = async () => {
      try {
        // Show loading toast
        toast.loading('Creating new notebook...');
        
        // Create a new notebook
        const response = await fetch('/api/notebooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Untitled Notebook',
            content: '',
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create notebook');
        }
        
        const data = await response.json();
        
        // Dismiss loading toast and show success
        toast.dismiss();
        toast.success('Notebook created successfully');
        
        // Redirect to the new notebook
        router.push(`/notebooks/${data.id}`);
      } catch (error) {
        console.error('Error creating notebook:', error);
        toast.error('Failed to create notebook');
        router.push('/notebooks');
      }
    };
    
    createNewNotebook();
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
        <span>Creating new notebook...</span>
      </div>
    </div>
  );
}
