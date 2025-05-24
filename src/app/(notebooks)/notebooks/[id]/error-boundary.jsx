"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

// This component ensures the notebook exists, otherwise it redirects to create a new one
export default function NotebookErrorBoundary({ children }) {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const id = params?.id;
  
  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    // If the ID is 'new', redirect to the new notebook page
    if (id === 'new') {
      router.push('/notebooks/new');
      return;
    }
    
  }, [id, router, status]);
  
  return <>{children}</>;
}
