import React from 'react';
import { format } from 'date-fns';
import { MoreVertical, Trash, Eye, Edit, Loader2, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const MobileNotebookList = ({ 
  notebooks, 
  onView, 
  onEdit, 
  onDelete, 
  deletingNotebookId 
}) => {
  if (!notebooks || notebooks.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No notebooks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:hidden">
      {notebooks.map(notebook => (
        <div 
          key={notebook.id}
          className="border rounded-lg p-4 relative bg-card shadow-sm"
          onClick={(e) => onView(notebook.id, e)}
        >
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary/60 to-primary/20 rounded-l-lg"></div>
          
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(notebook.id, e);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(notebook, e);
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
          
          <h3 className="text-lg font-medium mb-2 pr-8">{notebook.title}</h3>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
            <span>Created {format(new Date(notebook.createdAt), 'MMM d, yyyy')}</span>
            <span>•</span>
            <span>Updated {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}</span>
            {notebook.isPublic && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs py-0 h-5">Public</Badge>
              </>
            )}
          </div>
          
          {notebook.tags && notebook.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {notebook.tags.slice(0, 3).map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
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
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onView(notebook.id, e);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(notebook.id, e);
              }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileNotebookList;
