import React from 'react';
import { format } from 'date-fns';
import { MoreVertical, Trash, Eye, Edit, Loader2, Tag, Clock, Calendar, Star, StarOff, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const MobileNotebookList = ({ 
  notebooks, 
  onView, 
  onEdit, 
  onDelete, 
  deletingNotebookId 
}) => {
  if (!notebooks || notebooks.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed rounded-lg bg-muted/20">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary h-6 w-6">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
              <path d="M12 11h4"></path>
              <path d="M12 16h4"></path>
              <path d="M8 11h.01"></path>
              <path d="M8 16h.01"></path>
            </svg>
          </div>
          <p className="text-muted-foreground font-medium">No notebooks found</p>
          <p className="text-muted-foreground text-xs text-center max-w-xs">Try creating a new notebook or adjust your filters</p>
        </div>
      </div>
    );
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-3 md:hidden mb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {notebooks.map(notebook => (
        <motion.div 
          key={notebook.id}
          variants={item}
          className="relative overflow-hidden bg-card rounded-xl shadow-sm"
          whileTap={{ scale: 0.98 }}
        >
          {/* Card content that's clickable */}
          <div 
            className="flex flex-col p-4 pb-3"
            onClick={(e) => onView(notebook.id, e)}
          >
            {/* Gradient accents */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/30"></div>
            
            {/* Public badge */}
            {notebook.isPublic && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">Public</Badge>
              </div>
            )}
            
            {/* Title area */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold leading-tight line-clamp-2 pr-16">
                {notebook.title || "Untitled Notebook"}
              </h3>
            </div>
            
            {/* Date and meta info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(notebook.updatedAt), 'MMM d')}</span>
              </div>
              
              {notebook.tags && notebook.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{notebook.tags.length} tags</span>
                </div>
              )}
            </div>
            
            {/* Preview snippet - if available */}
            {notebook.content && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {notebook.content
                  .replace(/[#*`>_~\[\]]/g, '')
                  .replace(/\n/g, ' ')
                  .trim()
                  .substring(0, 120)}
                {notebook.content.length > 120 ? '...' : ''}
              </p>
            )}
          </div>
          
          {/* Actions toolbar */}
          <div className="flex items-center justify-between bg-muted/30 px-3 py-2 border-t border-border/30">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-2 text-xs rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onView(notebook.id, e);
                }}
              >
                <Eye className="h-3 w-3 mr-1.5" />
                View
              </Button>
              
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-2 text-xs rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(notebook.id, e);
                }}
              >
                <Edit className="h-3 w-3 mr-1.5" />
                Edit
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Star className="h-4 w-4" />
                  Add to favorites
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  className="gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with notebook
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(notebook, e);
                  }}
                  disabled={deletingNotebookId === notebook.id}
                >
                  {deletingNotebookId === notebook.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Tag pills (show only if tags exist) */}
          {notebook.tags && notebook.tags.length > 0 && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-1.5 max-w-full">
              {notebook.tags.slice(0, 3).map(tag => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-[10px] py-0 px-2 h-5 bg-background/80 border-muted-foreground/20"
                >
                  {tag.name}
                </Badge>
              ))}
              {notebook.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-background/80 border-muted-foreground/20">
                  +{notebook.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MobileNotebookList;
