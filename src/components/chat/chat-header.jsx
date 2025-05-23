"use client";

import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LUNA_PERSONALITIES } from "@/lib/luna-personalities";
import { DateRangeBadge, DateRangeFilter } from "./date-filter";
import { MoodSelector } from "./mood-selector";
import { motion } from "framer-motion";

/**
 * ChatHeader component for displaying Luna's information and controls
 */
export function ChatHeader({ 
  currentPersonality, 
  dateRange,
  showDateFilter,
  setShowDateFilter,
  showMoodSelector,
  setShowMoodSelector,
  handleDateRangeChange,
  toggleDateRangeFilter,
  clearDateRange,
  handlePersonalityChange
}) {
  return (
    <motion.div 
      className="flex justify-between items-center p-4 border-b overflow-scroll"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <Avatar className="h-10 w-10 border-2 border-primary shadow-sm hover:shadow-md transition-shadow">
            <AvatarFallback className={`${LUNA_PERSONALITIES[currentPersonality].color} text-white`}>
              {LUNA_PERSONALITIES[currentPersonality].icon}
            </AvatarFallback>
          </Avatar>
          <motion.span 
            className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-black"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.5,
              type: "spring",
              stiffness: 500
            }}
          />
        </motion.div>
        
        <div>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <motion.span 
              className="bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Luna
            </motion.span>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="outline" className="h-5 ml-1 text-xs font-normal dark:border-muted-foreground/20">
                {LUNA_PERSONALITIES[currentPersonality].name.split(" ")[0]}
              </Badge>
            </motion.div>
          </CardTitle>
          <motion.p 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your Personal Notebook Companion
          </motion.p>
        </div>
      </div>

      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <DateRangeBadge dateRange={dateRange} onClear={clearDateRange} />
        <MoodSelector
          isOpen={showMoodSelector}
          onOpenChange={setShowMoodSelector}
          currentPersonality={currentPersonality}
          onPersonalityChange={handlePersonalityChange}
        />
        
        <DateRangeFilter
          isOpen={showDateFilter}
          onOpenChange={setShowDateFilter}
          dateRange={dateRange}
          onDateChange={handleDateRangeChange}
          onToggleActive={toggleDateRangeFilter}
          onClear={clearDateRange}
        />
      </motion.div>
    </motion.div>
  );
}
