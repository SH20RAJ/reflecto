import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";

const NotebooksSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  setSelectedTag, 
  setCurrentPage,
  isSearchLoading 
}) => {
  return (
    <div className="relative hidden sm:block">
      {isSearchLoading ? (
        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      )}
      <Input
        placeholder="Search notebooks..."
        className="pl-8 w-full"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setSelectedTag(null); // Clear tag filter when searching
          setCurrentPage(1); // Reset to first page
        }}
      />
      {isSearchLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-xs text-muted-foreground">Searching...</span>
        </div>
      )}
    </div>
  );
};

export default NotebooksSearch;
