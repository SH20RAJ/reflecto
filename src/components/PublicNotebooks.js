import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, Tag, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function PublicNotebooks({ username = null }) {
  const [notebooks, setNotebooks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotebooks = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = username 
        ? `/api/notebooks/public/user/${username}?page=${page}&limit=${pagination.limit}`
        : `/api/notebooks/public?page=${page}&limit=${pagination.limit}`;
        
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notebooks');
      }
      
      const data = await response.json();
      setNotebooks(data.notebooks);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching public notebooks:', err);
      setError('Failed to load notebooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks(1);
  }, [username]);

  const handlePageChange = (newPage) => {
    fetchNotebooks(newPage);
  };

  if (loading && notebooks.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchNotebooks(1)}>Try Again</Button>
      </div>
    );
  }

  if (notebooks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          {username 
            ? `${username} hasn't published any public notebooks yet.`
            : 'No public notebooks found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notebooks.map((notebook) => (
          <Card key={notebook.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">
                <Link href={`/notebooks/public/${notebook.id}`} className="hover:underline">
                  {notebook.title}
                </Link>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="line-clamp-3 text-sm text-muted-foreground">
                {notebook.content.substring(0, 200)}
              </div>
              
              {notebook.tags && notebook.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {notebook.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                  {notebook.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{notebook.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <Link href={`/profile/${notebook.user.username}`} className="hover:underline">
                  {notebook.user.name || notebook.user.username || 'Anonymous'}
                </Link>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(notebook.updatedAt), { addSuffix: true })}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevious}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
