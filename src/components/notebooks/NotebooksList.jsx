import React from 'react';
import { format } from 'date-fns';
import { Tag, MoreVertical, Trash, Eye, Edit, Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NotebooksList = ({ 
  notebooks, 
  handleViewNotebook, 
  handleEditNotebook, 
  openDeleteDialog, 
  deletingNotebookId 
}) => {
  return (
    <div className="space-y-4 mb-8">
      {notebooks.map((notebook) => (
        <div
          key={notebook.id}
          className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary/20 relative group bg-card/50 backdrop-blur-sm"
          onClick={(e) => handleViewNotebook(notebook.id, e)}
        >
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    openDeleteDialog(notebook, e);
                  }}
                  disabled={deletingNotebookId === notebook.id}
                >
                  {deletingNotebookId === notebook.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{notebook.title}</h3>
                {notebook.isPublic && (
                  <Badge variant="secondary" className="text-xs">Public</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <span>{format(new Date(notebook.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1.5" />
                  <span>{format(new Date(notebook.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">
                {notebook.content ? (
                  // Display markdown content
                  (() => {
                    try {
                      // Check if it's JSON (legacy format)
                      if (notebook.content.trim().startsWith('{') || notebook.content.trim().startsWith('[')) {
                        try {
                          const parsed = JSON.parse(notebook.content);
                          if (parsed.blocks) {
                            // Legacy Editor.js format
                            return parsed.blocks
                              .filter(block => block.type === 'paragraph')
                              .map(block => block.data.text)
                              .join(' ')
                              .substring(0, 150) + '...';
                          }
                        } catch (e) {
                          // Not valid JSON, treat as markdown
                        }
                      }
                      // Plain markdown - strip any markdown syntax for preview
                      return notebook.content
                        .replace(/[#*`>_~\[\]]/g, '') // Remove markdown symbols
                        .replace(/\n/g, ' ') // Replace newlines with spaces
                        .trim()
                        .substring(0, 150) + (notebook.content.length > 150 ? '...' : '');
                    } catch (e) {
                      return notebook.content.substring(0, 150) + '...';
                    }
                  })()
                ) : 'No content'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewNotebook(notebook.id, e);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditNotebook(notebook.id, e);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>

              {notebook.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {notebook.tags.slice(0, 3).map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full cursor-pointer hover:bg-muted/80"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/notebooks?tag=${tag.id}`;
                      }}
                    >
                      <Tag className="mr-1 h-2.5 w-2.5" />
                      {tag.name}
                    </div>
                  ))}
                  {notebook.tags.length > 3 && (
                    <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      +{notebook.tags.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotebooksList;
