"use client";

import React from 'react';
import { CalendarRange, Calendar, Image, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LUNA_PERSONALITIES } from '@/lib/luna-personalities';
import { renderMarkdownToHTML } from '@/lib/markdown-utils';
import { motion } from "framer-motion";

/**
 * A component for displaying a message from Luna (assistant)
 */
export function LunaMessage({ message, className }) {
  const isSystem = message.role === "system";
  const moodConfig = message.mood && LUNA_PERSONALITIES[message.mood];
  
  return (
    <motion.div 
      className={`flex items-start gap-3 max-w-[85%] ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Avatar 
          className={`h-9 w-9 border-2 ${moodConfig?.borderColor || 'border-purple-200'} shadow-sm hover:shadow-md transition-shadow duration-300`}
        >
          <AvatarFallback className={`${moodConfig?.color || 'bg-gradient-to-br from-purple-400 to-indigo-500'}`}>
            {moodConfig?.icon}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <div className="w-full items-start">
        <motion.div
          className={`rounded-lg px-4 py-3 ${
            isSystem
              ? "bg-muted/50 dark:bg-muted/30 border border-dashed text-muted-foreground"
              : moodConfig
              ? `${moodConfig.messageBg} border ${moodConfig.borderColor} shadow-sm`
              : "bg-card dark:bg-card/80 shadow-sm border"
          }`}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 500, 
            damping: 25,
            delay: 0.05
          }}
        >
          {message.role === "assistant" && message.mood && (
            <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-dashed border-opacity-30">
              <motion.div 
                className={`p-0.5 rounded-full ${moodConfig.color}`}
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {moodConfig.icon}
              </motion.div>
              <span className={`text-xs font-medium ${moodConfig.textColor}`}>
                {moodConfig.name}
              </span>
            </div>
          )}
          <div 
            className={`text-sm prose prose-sm max-w-none dark:prose-invert overflow-hidden ${
              message.role === "assistant" && message.mood && moodConfig 
              ? moodConfig.textColor 
              : ""
            }`}
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdownToHTML(
                typeof message.content === 'string' 
                ? message.content 
                : String(message.content)
              )
            }}
          />

          {message.dateRange && (
            <motion.div 
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CalendarRange className="h-3 w-3" />
              <span>
                Filtered: {message.dateRange.startDate ? format(message.dateRange.startDate, 'MMM d, yyyy') : 'Start'} -
                {message.dateRange.endDate ? format(message.dateRange.endDate, 'MMM d, yyyy') : 'End'}
              </span>
            </motion.div>
          )}
        </motion.div>

        {message.entries && message.entries.length > 0 && (
          <EntryResults entries={message.entries} />
        )}
      </div>
    </motion.div>
  );
}

/**
 * A component for displaying a message from the user
 */
export function UserMessage({ message, avatarUrl, userName, className }) {
  return (
    <motion.div 
      className={`flex items-start gap-3 max-w-[85%] flex-row-reverse ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Avatar className="h-9 w-9 border-2 border-indigo-100 dark:border-indigo-800 bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm hover:shadow-md transition-shadow duration-300">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={userName || "You"} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              {userName?.charAt(0) || "U"}
            </AvatarFallback>
          )}
        </Avatar>
      </motion.div>

      <div className="w-full items-end">
        <motion.div 
          className="rounded-lg px-4 py-3 bg-primary text-primary-foreground dark:bg-primary/90 shadow-sm"
          initial={{ opacity: 0, scale: 0.96, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 500, 
            damping: 25
          }}
        >
          <div className="text-sm overflow-hidden">
            {typeof message.content === 'string' ? message.content : String(message.content)}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Component for displaying related notebook entries
 */
function EntryResults({ entries }) {
  return (
    <motion.div 
      className="mt-2"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-medium text-muted-foreground">Related Entries</h4>
        <Badge variant="secondary" className="text-xs">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Badge>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (i * 0.05) }}
          >
            <Card className="p-3 text-sm hover:border-primary/50 transition-colors dark:bg-muted/30 hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{entry.title}</div>
                <div className="flex gap-1">
                  {entry.similarity !== undefined && (
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/50">
                      {entry.similarity}% match
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(entry.date).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-xs line-clamp-2">
                {entry.excerpt}
              </p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {entry.hasImage && (
                  <Badge variant="secondary" className="text-xs">
                    <Image className="h-3 w-3 mr-1" />
                    Contains images
                  </Badge>
                )}
                <Button variant="link" size="sm" className="h-6 p-0 text-xs group flex items-center gap-1">
                  View notebook
                  <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
