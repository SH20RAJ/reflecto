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

// Helper function to clean content for preview
const cleanContentForPreview = (content, maxLength = 150) => {
  if (!content || typeof content !== 'string') {
    return 'No content available';
  }
  
  try {
    // Check if content is HTML with tags
    if (content.includes('</p>') || content.includes('</h') || content.includes('</div>')) {
      return content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }
    
    // Check if content is Editor.js or JSON format
    if (content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          const plainText = parsed.blocks
            .map(block => block.data?.text || '')
            .filter(text => text.trim().length > 0)
            .join(' ')
            .replace(/[#*`>_~\\[\\]]/g, '') // Remove markdown symbols
            .trim();
          
          return plainText.substring(0, maxLength) + (plainText.length > maxLength ? '...' : '');
        }
      } catch (e) {
        // Not valid JSON, continue to default handling
      }
    }
    
    // Default handling for plain text or markdown
    return content
      .replace(/[#*`>_~\\[\\]]/g, '') // Remove markdown symbols
      .replace(/\\n/g, ' ') // Replace newlines with spaces
      .replace(/<[^>]*>/g, '') // Remove any potential HTML tags
      .trim()
      .substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  } catch (e) {
    return 'Content preview unavailable';
  }
};

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
              className={`relative border bg-card rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
                viewMode === 'grid' ? 'min-h-[180px]' : 'min-h-[140px]'
              }`}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              onClick={(e) => onView(notebook.id, e)}
            >
              <div 
                className="flex flex-col p-4 cursor-pointer h-full"
              >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/30"></div>
                
                {/* Title area with public badge and star */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <h3 className="text-base font-semibold leading-tight line-clamp-2 flex-1">
                      {notebook.title || "Untitled Notebook"}
                    </h3>
                    
                    {notebook.isStarred && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current shrink-0 mt-0.5" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {notebook.isPublic && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Preview text with improved formatting using our helper function */}
                {notebook.content && (
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground line-clamp-2 bg-secondary/10 px-2 py-1.5 rounded border border-secondary/20">
                      {cleanContentForPreview(notebook.content)}
                    </div>
                  </div>
                )}
                
                {/* Enhanced meta info row with better word count */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(notebook.updatedAt), 'MMM d')}</span>
                    </div>
                    
                    {notebook.tags && notebook.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{notebook.tags.length}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Word count with better calculation */}
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span className="text-[10px]">
                      {notebook.content ? 
                        `~${Math.max(1, Math.ceil(cleanContentForPreview(notebook.content, 1000).split(/\s+/).length))} words` : 
                        'Empty'}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced tag chips */}
                {notebook.tags && notebook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {notebook.tags.slice(0, 4).map((tag, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-[10px] py-0 px-1.5 h-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        {typeof tag === 'string' ? tag : tag.name || 'Tag'}
                      </Badge>
                    ))}
                    {notebook.tags.length > 4 && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                        +{notebook.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              {/* Standardized action buttons - always at the bottom */}
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="h-8 px-3 text-xs flex items-center gap-1.5 transition-colors" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onView(notebook.id);
                  }}
                >
                  <Eye size={12} /> 
                  <span className="font-medium">View</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 text-xs flex items-center gap-1.5 hover:bg-primary/10 transition-colors" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(notebook.id);
                    }}
                  >
                    <Edit size={12} /> 
                    <span className="font-medium">Edit</span>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0 hover:bg-secondary transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onView(notebook.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View notebook</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(notebook.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit notebook</span>
                      </DropdownMenuItem>
                      
                      {notebook.isPublic && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/public/notebooks/${notebook.id}`);
                          }}
                          className="cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          <span>Copy public link</span>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
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
                        <span>Delete notebook</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MobileNotebookList;
