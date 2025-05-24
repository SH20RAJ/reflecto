import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A component for displaying diffs between notebook versions in a mobile-friendly way
 */
export function NotebookDiff({
  oldContent,
  newContent,
  title = "Changes",
  onClose
}) {
  const [currentView, setCurrentView] = React.useState('split'); // 'split' or 'unified'
  const [currentPage, setCurrentPage] = React.useState(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Split content into pages for mobile viewing
  const contentChunks = React.useMemo(() => {
    const lines = newContent.split('\n');
    const chunkSize = 15; // Number of lines per mobile page
    const chunks = [];
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }
    
    return chunks;
  }, [newContent]);

  // Pagination controls
  const totalPages = contentChunks.length;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg md:static md:backdrop-blur-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col h-full">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="text-lg font-medium">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* View toggle - visible on desktop */}
        <div className="hidden md:flex items-center justify-between p-4 border-b">
          <div className="flex gap-2">
            <Button
              variant={currentView === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('split')}
            >
              Split View
            </Button>
            <Button
              variant={currentView === 'unified' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('unified')}
            >
              Unified View
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {isMobile ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4"
              >
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {contentChunks[currentPage]}
                </pre>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="p-4 flex gap-4">
              {currentView === 'split' ? (
                <>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-2">Previous Version</div>
                    <pre className="text-sm whitespace-pre-wrap font-mono p-4 rounded-lg bg-muted/50">
                      {oldContent}
                    </pre>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-2">Current Version</div>
                    <pre className="text-sm whitespace-pre-wrap font-mono p-4 rounded-lg bg-muted/50">
                      {newContent}
                    </pre>
                  </div>
                </>
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-mono p-4 rounded-lg bg-muted/50 w-full">
                  {newContent}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Mobile pagination controls */}
        {isMobile && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={!hasPrevPage}
              className={cn(
                "h-8 w-8 rounded-full p-0",
                !hasPrevPage && "opacity-50"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasNextPage}
              className={cn(
                "h-8 w-8 rounded-full p-0",
                !hasNextPage && "opacity-50"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
