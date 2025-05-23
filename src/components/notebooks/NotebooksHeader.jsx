import React from 'react';
import { Tag, ArrowUpDown, Sparkles, LayoutGrid, List, Loader2, CalendarDays } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

const NotebooksHeader = ({ 
  selectedTag, 
  setSelectedTag, 
  tags, 
  isLoadingTags, 
  isTagFilterLoading,
  viewMode, 
  setViewMode, 
  sortBy, 
  setSortBy, 
  sortDirection, 
  setSortDirection, 
  isSortingLoading,
  showDateFilter,
  setShowDateFilter,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  getAvailableMonths,
  resetFilters,
  handleTagSelect,
  setIsDialogOpen,
  setNewNotebook
}) => {
  // Function to save view mode preference to localStorage
  const saveViewModePreference = (mode) => {
    try {
      localStorage.setItem('reflecto-view-mode', mode);
    } catch (error) {
      console.error('Error saving view mode preference:', error);
    }
  };

  // Function to handle sort
  const handleSort = (type) => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection(type === 'alphabetical' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background pb-4 md:mt-0 mt-20">
      <div className="flex border-b-1/2 flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedTag ? (
              <div className="flex items-center gap-2">
                <span>Tag:</span>
                <Badge variant="outline" className="text-base font-normal py-1 px-3">
                  {tags.find(t => t.id === selectedTag)?.name || 'Loading...'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-8 w-8 p-0"
                  onClick={() => {
                    setSelectedTag(null);
                  }}
                >
                  <span className="sr-only">Clear tag filter</span>
                  ×
                </Button>
              </div>
            ) : 'All Notebooks'}
          </h1>
          {showDateFilter && selectedMonth !== null && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Filtered by: {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={resetFilters}
                >
                  <span className="sr-only">Clear filter</span>
                  ×
                </Button>
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tags Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-9">
                {isTagFilterLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Tag className="h-3.5 w-3.5" />
                )}
                Tags {isTagFilterLoading && '(Loading...)'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoadingTags ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading tags...</span>
                </div>
              ) : tags.length > 0 ? (
                tags.map(tag => (
                  <DropdownMenuItem
                    key={tag.id}
                    className="flex justify-between"
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    <div className="flex items-center">
                      <Tag className="mr-2 h-3.5 w-3.5" />
                      {tag.name}
                    </div>
                    <Badge variant="secondary" className="ml-auto">{tag.count}</Badge>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No tags found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="border rounded-md flex">
            <Button
              variant={viewMode === 'grid' ? "subtle" : "ghost"}
              size="sm"
              className={`px-3 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => {
                setViewMode('grid');
                saveViewModePreference('grid');
              }}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "subtle" : "ghost"}
              size="sm"
              className={`px-3 rounded-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
              onClick={() => {
                setViewMode('list');
                saveViewModePreference('list');
              }}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? "subtle" : "ghost"}
              size="sm"
              className={`px-3 rounded-none ${viewMode === 'table' ? 'bg-muted' : ''}`}
              onClick={() => {
                setViewMode('table');
                saveViewModePreference('table');
              }}
              title="Table view"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </Button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-9">
                {isSortingLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUpDown className="h-3.5 w-3.5" />
                )}
                Sort {sortBy === 'recent' ? '(Recent)' : sortBy === 'oldest' ? '(Oldest)' : sortBy === 'alphabetical' ? '(A→Z)' : ''}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => handleSort('recent')}
                className={sortBy === 'recent' ? 'bg-muted' : ''}
                disabled={isSortingLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Most recent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort('oldest')}
                className={sortBy === 'oldest' ? 'bg-muted' : ''}
                disabled={isSortingLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Oldest first
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort('alphabetical')}
                className={sortBy === 'alphabetical' ? 'bg-muted' : ''}
                disabled={isSortingLoading}
              >
                <span className="mr-2 font-mono">A→Z</span>
                Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Notebook Button */}
          <Button
            className="gap-1.5"
            variant="default"
            style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
            onClick={() => {
              setNewNotebook({ title: 'New Notebook', content: '', tags: '' });
              setIsDialogOpen(true);
            }}
          >
            <Sparkles className="h-4 w-4" /> New Notebook
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotebooksHeader;
