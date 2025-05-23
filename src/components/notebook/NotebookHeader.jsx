import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import PublicToggle from '@/components/PublicToggle';
import TagsManager from './TagsManager';

const NotebookHeader = ({
  notebook,
  title,
  setTitle,
  selectedTags,
  setSelectedTags,
  allTags
}) => {
  if (!notebook) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl md:text-4xl font-bold mb-2 border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Untitled"
            />
          </div>
        </div>

        {/* Mobile metadata - collapsible */}
        <div className="md:hidden">
          <details className="group">
            <summary className="flex items-center cursor-pointer list-none text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Details</span>
              </span>
              <svg
                className="ml-2 h-4 w-4 transition-transform group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created {format(new Date(notebook.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated {format(new Date(notebook.updatedAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
              <PublicToggle
                notebookId={notebook.id}
                initialIsPublic={notebook.isPublic}
                onToggle={(isPublic) => {
                  // Update the notebook in the parent component
                  notebook.isPublic = isPublic;
                }}
              />
            </div>
          </details>
        </div>

        {/* Desktop metadata - always visible */}
        <div className="hidden md:flex md:flex-wrap md:items-center text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {format(new Date(notebook.createdAt), 'MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {format(new Date(notebook.updatedAt), 'MMMM d, yyyy h:mm a')}</span>
          </div>

          <PublicToggle
            notebookId={notebook.id}
            initialIsPublic={notebook.isPublic}
            onToggle={(isPublic) => {
              // Update the notebook in the parent component
              notebook.isPublic = isPublic;
            }}
          />
        </div>

        {/* Tags manager - works on both mobile and desktop */}
        <TagsManager
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          allTags={allTags}
        />
      </div>
    </div>
  );
};

export default NotebookHeader;
