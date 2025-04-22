"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarkdownView({ markdown = '' }) {
  const [renderedContent, setRenderedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        setIsLoading(true);
        // Dynamically import remark and remark-html to avoid SSR issues
        const { remark } = await import('remark');
        const remarkHtml = await import('remark-html');
        
        // Process the markdown to HTML
        const result = await remark()
          .use(remarkHtml.default)
          .process(markdown);
        
        setRenderedContent(result.toString());
        setIsLoading(false);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setRenderedContent('<p>Error rendering content</p>');
        setIsLoading(false);
      }
    };

    renderMarkdown();
  }, [markdown]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
      />
    </Card>
  );
}
