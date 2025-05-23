import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NotebooksEmpty = ({ onCreateNotebook }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
      <div className="text-center max-w-md">
        <h3 className="text-lg font-medium mb-2">No notebooks yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first notebook to start writing and organizing your thoughts.
        </p>
        <Button
          className="gap-1.5"
          variant="default"
          style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
          onClick={onCreateNotebook}
        >
          <Sparkles className="h-4 w-4" /> Create Your First Notebook
        </Button>
      </div>
    </div>
  );
};

export default NotebooksEmpty;
