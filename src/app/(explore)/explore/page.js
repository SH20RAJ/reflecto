'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function ExplorePage() {
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
  const router = useRouter();

  const fetchNotebooks = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/notebooks/public?page=${page}&limit=${pagination.limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch public notebooks');
      }
      
      const data = await response.json();
      setNotebooks(data.notebooks);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching public notebooks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const handlePageChange = (newPage) => {
    fetchNotebooks(newPage);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Explore Public Notebooks</h1>
      </div>

      {loading && notebooks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchNotebooks()}>Try Again</Button>
        </div>
      ) : notebooks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No public notebooks found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <Card key={notebook.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">
                    <Link href={`/notebooks/public/${notebook.id}`} className="hover:underline">
                      {notebook.title || 'Untitled'}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notebook.user?.image} alt={notebook.user?.name || 'User'} />
                      <AvatarFallback>{getInitials(notebook.user?.name)}</AvatarFallback>
                    </Avatar>
                    <Link 
                      href={`/profile/${notebook.user?.username || notebook.userId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {notebook.user?.name || 'Anonymous'}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {truncateContent(notebook.content)}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2">
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(notebook.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(notebook.updatedAt)}
                    </span>
                  </div>
                  {notebook.tags && notebook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {notebook.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
