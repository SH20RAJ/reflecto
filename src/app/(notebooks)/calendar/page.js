"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { useNotebooks } from '@/lib/hooks';
import { useRouter } from "next/navigation";
import { format, getMonth, getYear } from 'date-fns';
import { CalendarIcon, ChevronDown, Book } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [monthlyNotebooks, setMonthlyNotebooks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const { notebooks, isLoading: isLoadingNotebooks } = useNotebooks();
  const isAuthenticated = status === "authenticated";

  // Set loading state based on authentication and data loading
  useEffect(() => {
    if (isAuthenticated && !isLoadingNotebooks) {
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [isAuthenticated, status, isLoadingNotebooks]);

  // Define processNotebooks function before using it
  const processNotebooks = useCallback(() => {
    // Fix any notebooks with invalid dates
    const fixedNotebooks = notebooks.map(notebook => {
      const notebookCopy = {...notebook};
      // Check if createdAt or updatedAt is null or invalid
      if (!notebookCopy.createdAt || new Date(notebookCopy.createdAt).getFullYear() < 2000) {
        notebookCopy.createdAt = new Date().toISOString();
      }
      if (!notebookCopy.updatedAt || new Date(notebookCopy.updatedAt).getFullYear() < 2000) {
        notebookCopy.updatedAt = new Date().toISOString();
      }
      return notebookCopy;
    });

    // Extract all years from notebook dates
    const notebookYears = [...new Set(fixedNotebooks.map(notebook =>
      getYear(new Date(notebook.updatedAt))
    ))].sort((a, b) => b - a); // Sort descending

    setYears(notebookYears);

    if (notebookYears.length > 0 && !notebookYears.includes(selectedYear)) {
      setSelectedYear(notebookYears[0]);
    }

    // Group notebooks by month for the selected year
    const monthlyData = {};

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = [];
    }

    // Group notebooks by month
    fixedNotebooks.forEach(notebook => {
      const date = new Date(notebook.updatedAt);
      const year = getYear(date);
      const month = getMonth(date);

      if (year === selectedYear) {
        if (!monthlyData[month]) {
          monthlyData[month] = [];
        }
        monthlyData[month].push(notebook);
      }
    });

    setMonthlyNotebooks(monthlyData);
  }, [notebooks, selectedYear, setYears, setSelectedYear, setMonthlyNotebooks]);

  // Process notebooks to get years and monthly counts
  useEffect(() => {
    if (notebooks.length > 0) {
      processNotebooks();
    }
  }, [notebooks, selectedYear, processNotebooks]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedMonth(null);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month === selectedMonth ? null : month);
  };

  const handleViewNotebook = (id) => {
    router.push(`/notebooks/${id}`);
  };

  const getMonthName = (month) => {
    return format(new Date(selectedYear, month, 1), 'MMMM');
  };

  if (!isAuthenticated && status !== "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-medium">Sign in to view calendar</h3>
          <p className="text-muted-foreground">Please sign in to access your notebook calendar.</p>
          <Button onClick={() => router.push('/auth/signin')} className="mt-2">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your notebooks organized by date
          </p>
        </div>

        {!isLoading && years.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                {selectedYear}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {years.map(year => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={selectedYear === year ? "bg-accent" : ""}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : years.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-medium">No notebooks yet</h3>
            <p className="text-muted-foreground">
              Create your first notebook to see it in the calendar.
            </p>
            <Button
              onClick={() => router.push('/notebooks')}
              className="mt-2"
            >
              Go to Notebooks
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, month) => (
              <Card
                key={month}
                className={`overflow-hidden cursor-pointer transition-colors ${
                  selectedMonth === month ? 'border-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => handleMonthSelect(month)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {getMonthName(month)}
                    </CardTitle>
                    {monthlyNotebooks[month]?.length > 0 && (
                      <Badge variant="secondary">
                        {monthlyNotebooks[month].length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {monthlyNotebooks[month]?.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {monthlyNotebooks[month].length} notebook{monthlyNotebooks[month].length !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No notebooks</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedMonth !== null && monthlyNotebooks[selectedMonth]?.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Notebooks from {getMonthName(selectedMonth)} {selectedYear}
                </h2>
              </div>

              <div className="space-y-2">
                {monthlyNotebooks[selectedMonth].map(notebook => (
                  <div
                    key={notebook.id}
                    className="flex items-center p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleViewNotebook(notebook.id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{notebook.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {notebook.content ? notebook.content.substring(0, 100) : 'No content'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
