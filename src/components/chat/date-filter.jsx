"use client";

import React from 'react';
import { format } from "date-fns";
import { X, Filter, CalendarRange } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

/**
 * Date Range Filter Badge - displays current filter if active
 */
export function DateRangeBadge({ dateRange, onClear, className = "" }) {
  if (!dateRange.isActive) return null;
  
  return (
    <Badge variant="outline" className={`flex items-center gap-1 bg-primary/10 dark:bg-primary/20 ${className}`}>
      <CalendarRange className="h-3 w-3" />
      <span className="text-xs">
        {dateRange.startDate ? format(dateRange.startDate, 'MMM d, yyyy') : 'Start'} -
        {dateRange.endDate ? format(dateRange.endDate, 'MMM d, yyyy') : 'End'}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 ml-1"
        onClick={onClear}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}

/**
 * Date Range Filter - allows selecting date range for filtering
 */
export function DateRangeFilter({ 
  isOpen, 
  onOpenChange, 
  dateRange,
  onDateChange,
  onToggleActive,
  onClear
}) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs">Date Range</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filter by Date Range</h4>
            <p className="text-xs text-muted-foreground">
              Limit your search to notebooks within a specific date range.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className="justify-start text-left font-normal h-8 text-xs dark:bg-muted/50"
                  >
                    {dateRange.startDate ? (
                      format(dateRange.startDate, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                    <Calendar className="h-4 w-4 ml-auto opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.startDate}
                    onSelect={(date) => onDateChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className="justify-start text-left font-normal h-8 text-xs dark:bg-muted/50"
                  >
                    {dateRange.endDate ? (
                      format(dateRange.endDate, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                    <Calendar className="h-4 w-4 ml-auto opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.endDate}
                    onSelect={(date) => onDateChange('endDate', date)}
                    initialFocus
                    disabled={(date) => {
                      return dateRange.startDate ? date < dateRange.startDate : false
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="activate-filter" className="text-xs mb-1">Activate Filter</Label>
              <span className="text-xs text-muted-foreground">
                Apply date range to searches
              </span>
            </div>
            <Switch
              id="activate-filter"
              checked={dateRange.isActive}
              onCheckedChange={onToggleActive}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
