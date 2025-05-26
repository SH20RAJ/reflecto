import React from 'react';
import { format } from 'date-fns';
import { 
  MoreVertical, Trash, Eye, Edit, Loader2, Tag, Clock, Calendar, 
  Star, StarOff, MessageCircle, BookOpen, Search, Plus,
  Filter, ArrowUpDown, LayoutGrid, List as ListIcon  
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

const MobileNotebookList = ({ 
  notebooks, 
  onView, 
  onEdit, 
  onDelete, 
  deletingNotebookId,
  searchQuery,
  setSearchQuery,
  onCreateNew,
  showFilter = false,
  onToggleFilter = () => {},
  sortBy = 'recent',
  setSortBy = () => {},
  sortDirection = 'desc',
  setSortDirection = () => {},
  viewMode = 'grid',
  setViewMode = () => {},
}) => {
  if (!notebooks || notebooks.length === 0) {
    return (
      <div className="md:hidden w-full">
        <div className="sticky top-0 z-20 bg-background pt-2 pb-3 px-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">Notebooks</h1>
            <Button size="sm" variant="outline" onClick={onCreateNew} className="h-8 px-2 gap-1">
              <Plus size={14} /> New
            </Button>
          </div>
          
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notebooks..."
              className="pl-8 h-9"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-8 px-2 ${showFilter ? 'bg-accent' : ''}`}
              onClick={onToggleFilter}
            >
              <Filter size={14} className="mr-1" />
              Filters
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <ArrowUpDown size={14} className="mr-1" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setSortBy('recent')}
                  className={sortBy === 'recent' ? 'bg-accent' : ''}
                >
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy('alphabetical')}
                  className={sortBy === 'alphabetical' ? 'bg-accent' : ''}
                >
                  Alphabetically
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy('created')}
                  className={sortBy === 'created' ? 'bg-accent' : ''}
                >
                  Creation Date
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                  {sortDirection === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="ml-auto flex rounded-md border overflow-hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 rounded-none ${viewMode === 'grid' ? 'bg-accent' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 rounded-none ${viewMode === 'list' ? 'bg-accent' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12 px-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <p className="text-muted-foreground font-medium">No notebooks found</p>
            <p className="text-muted-foreground text-xs text-center max-w-xs">Try creating a new notebook or adjust your filters</p>
            <Button onClick={onCreateNew} className="mt-2">Create Notebook</Button>
          </div>
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
    <div className="md:hidden w-full">
      {/* Mobile header with search */}
      <div className="sticky top-0 z-20 bg-background pt-2 pb-3 px-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Notebooks</h1>
          <Button size="sm" variant="outline" onClick={onCreateNew} className="h-8 px-2 gap-1">
            <Plus size={14} /> New
          </Button>
        </div>
        
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notebooks..."
            className="pl-8 h-9"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 px-2 ${showFilter ? 'bg-accent' : ''}`}
            onClick={onToggleFilter}
          >
            <Filter size={14} className="mr-1" />
            Filters
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <ArrowUpDown size={14} className="mr-1" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setSortBy('recent')}
                className={sortBy === 'recent' ? 'bg-accent' : ''}
              >
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('alphabetical')}
                className={sortBy === 'alphabetical' ? 'bg-accent' : ''}
              >
                Alphabetically
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('created')}
                className={sortBy === 'created' ? 'bg-accent' : ''}
              >
                Creation Date
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                {sortDirection === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="ml-auto flex rounded-md border overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 rounded-none ${viewMode === 'grid' ? 'bg-accent' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 rounded-none ${viewMode === 'list' ? 'bg-accent' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={14} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Notebook list */}
      <div className="h-[calc(100vh-180px)] overflow-auto">
        <motion.div 
          className="grid grid-cols-1 gap-3 p-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {notebooks.map(notebook => (
            <motion.div 
              key={notebook.id}
              variants={item}
              className="relative overflow-hidden bg-card rounded-md border shadow-sm"
              whileTap={{ scale: 0.98 }}
            >
              {/* Card content that's clickable */}
              <div 
                className="flex flex-col p-4"
                onClick={(e) => onView(notebook.id, e)}
              >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/30"></div>
                
                {/* Title area with public badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold leading-tight line-clamp-2">
                    {notebook.title || "Untitled Notebook"}
                  </h3>
                  
                  {notebook.isPublic && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 shrink-0">
                      Public
                    </Badge>
                  )}
                </div>
                
                {/* Preview text if available */}
                {notebook.preview && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {notebook.preview}
                  </p>
                )}
                
                {/* Date and meta info */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(notebook.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {notebook.tags && notebook.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{notebook.tags.length} {notebook.tags.length === 1 ? 'tag' : 'tags'}</span>
                    </div>
                  )}
                </div>
                
                {/* Tag chips for quick visual reference */}
                {notebook.tags && notebook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {notebook.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-secondary/30">
                        {tag}
                      </Badge>
                    ))}
                    {notebook.tags.length > 3 && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-secondary/30">
                        +{notebook.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              {/* Actions row */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className="h-7 px-2 text-xs flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onView(notebook.id);
                    }}
                  >
                    <Eye size={14} /> View
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className="h-7 px-2 text-xs flex items-center gap-1" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(notebook.id);
                    }}
                  >
                    <Edit size={14} /> Edit
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onView(notebook.id);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(notebook.id);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete && onDelete(notebook, e);
                      }}
                    >
                      {deletingNotebookId === notebook.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="mr-2 h-4 w-4" />
                      )}
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MobileNotebookList;
