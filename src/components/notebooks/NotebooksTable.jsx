import React from 'react';
import { format } from 'date-fns';
import { Tag, Trash, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const NotebooksTable = ({ 
  notebooks, 
  sortBy, 
  sortDirection, 
  setSortBy, 
  setSortDirection, 
  handleViewNotebook, 
  openDeleteDialog, 
  deletingNotebookId,
  router
}) => {
  // Function to handle column header click for sorting
  const handleSortClick = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection(column === 'alphabetical' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="rounded-md border mb-8 overflow-hidden shadow-md bg-card hidden sm:block">
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm shadow-sm">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="w-[40%] py-3 font-semibold text-foreground">
                <div 
                  className="flex items-center cursor-pointer group"
                  onClick={() => handleSortClick('alphabetical')}
                >
                  <span className="font-medium">Title</span>
                  <span className={`ml-2 transition-opacity ${sortBy === 'alphabetical' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                    {sortDirection === 'asc' ?
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg> :
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    }
                  </span>
                </div>
              </TableHead>
              <TableHead className="py-3 font-semibold text-foreground">
                <div 
                  className="flex items-center cursor-pointer group"
                  onClick={() => handleSortClick('created')}
                >
                  <span className="font-medium">Created</span>
                  <span className={`ml-2 transition-opacity ${sortBy === 'created' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                    {sortDirection === 'asc' ?
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg> :
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    }
                  </span>
                </div>
              </TableHead>
              <TableHead className="py-3 font-semibold text-foreground">
                <div 
                  className="flex items-center cursor-pointer group"
                  onClick={() => handleSortClick('recent')}
                >
                  <span className="font-medium">Updated</span>
                  <span className={`ml-2 transition-opacity ${(sortBy === 'recent' || sortBy === 'oldest') ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                    {sortDirection === 'asc' ?
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg> :
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    }
                  </span>
                </div>
              </TableHead>
              <TableHead className="py-3 font-semibold text-foreground">
                <div 
                  className="flex items-center cursor-pointer group"
                  onClick={() => handleSortClick('status')}
                >
                  <span className="font-medium">Status</span>
                  <span className={`ml-2 transition-opacity ${sortBy === 'status' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                    {sortDirection === 'asc' ?
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg> :
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    }
                  </span>
                </div>
              </TableHead>
              <TableHead className="py-3 font-semibold text-foreground">
                <span className="font-medium">Tags</span>
              </TableHead>
              <TableHead className="text-right py-3 font-semibold text-foreground">
                <span className="font-medium">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notebooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="mb-2">No notebooks found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/notebooks';
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              notebooks.map((notebook, index) => (
                <TableRow
                  key={notebook.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-muted/20 dark:bg-muted/10' : ''}`}
                  onClick={(e) => handleViewNotebook(notebook.id, e)}
                >
                  <TableCell className="py-3.5">
                    <Button
                      variant={"link"}
                      className="p-0 text-foreground font-medium hover:text-primary"
                    >
                      {notebook.title}
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm py-3.5 whitespace-nowrap">
                    {format(new Date(notebook.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm py-3.5 whitespace-nowrap">
                    {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="py-3.5">
                    {notebook.isPublic ? (
                      <Badge variant="outline" className="text-xs py-0 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Public</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs py-0 h-5 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">Private</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {notebook.tags.slice(0, 3).map(tag => (
                        <div
                          key={tag.id}
                          className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full cursor-pointer hover:bg-muted/80"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/notebooks?tag=${tag.id}`);
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
                  </TableCell>
                  <TableCell className="text-right py-3.5">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                        onClick={(e) => openDeleteDialog(notebook, e)}
                        disabled={deletingNotebookId === notebook.id}
                      >
                        {deletingNotebookId === notebook.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default NotebooksTable;
