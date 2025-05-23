import React from 'react';
import { format } from 'date-fns';
import { Tag, MoreVertical, Trash, Eye, Edit, Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NotebooksGrid = ({ 
  notebooks, 
  handleViewNotebook, 
  handleEditNotebook, 
  openDeleteDialog, 
  deletingNotebookId 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
      {notebooks.map((notebook) => (
        <Card
          key={notebook.id}
          className="cursor-pointer rounded-lg hover:shadow-lg transition-all hover:border-primary/20 overflow-hidden group relative bg-card/50 backdrop-blur-sm border-muted/60"
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

          {notebook.isPublic && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs">Public</Badge>
            </div>
          )}

          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary/30"></div>

          <CardHeader className="pb-2 pt-6">
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
            <CardTitle className="text-xl font-medium group-hover:text-primary transition-colors">{notebook.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
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

            <div className="flex justify-between items-center pt-2">
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
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {notebook.tags.slice(0, 2).map(tag => (
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
                  {notebook.tags.length > 2 && (
                    <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      +{notebook.tags.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotebooksGrid;
