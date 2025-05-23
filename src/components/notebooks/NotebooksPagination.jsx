import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NotebooksPagination = ({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4 mb-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Logic to show pages around current page
          let pageNum;
          if (totalPages <= 5) {
            // If 5 or fewer pages, show all
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            // If near start, show first 5
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            // If near end, show last 5
            pageNum = totalPages - 4 + i;
          } else {
            // Otherwise show current and 2 on each side
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(pageNum)}
              className="h-8 w-8 p-0"
            >
              {pageNum}
            </Button>
          );
        })}
        
        {/* Show ellipsis if there are more pages */}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <span className="px-1">...</span>
        )}
        
        {/* Always show last page if not in view */}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            className="h-8 w-8 p-0"
          >
            {totalPages}
          </Button>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NotebooksPagination;
