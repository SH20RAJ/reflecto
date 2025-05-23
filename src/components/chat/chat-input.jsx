"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, CalendarRange, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LUNA_PERSONALITIES } from '@/lib/luna-personalities';
import { motion } from "framer-motion";

/**
 * ChatInput component for handling user messages
 */
export function ChatInput({ 
  onSend, 
  loading, 
  currentPersonality, 
  dateRangeActive,
  className,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    onSend(inputValue);
    setInputValue("");
  };

  const inputRef = useRef(null);
  const personalityIcon = currentPersonality && LUNA_PERSONALITIES[currentPersonality]?.icon;
  
  // Focus input on initial render
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  return (
    <motion.form 
      onSubmit={handleSend} 
      className={`flex w-full gap-2 relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex-1 rounded-full border shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground/70">
          {personalityIcon ? (
            <span className="text-xs mr-2">{personalityIcon}</span>
          ) : (
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
          )}
        </div>
        
        <Input
          ref={inputRef}
          placeholder={`Chat with Luna... ${currentPersonality ? `(${LUNA_PERSONALITIES[currentPersonality].name})` : ''}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 pl-10 pr-12 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/50 rounded-full dark:bg-muted/80 dark:border-muted-foreground/20"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        {dateRangeActive && (
          <Badge 
            className="absolute right-12 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-primary/20 text-xs dark:bg-primary/20 dark:text-primary-foreground/80"
            variant="outline"
          >
            <CalendarRange className="h-3 w-3 mr-1" /> Date filter active
          </Badge>
        )}
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          type="submit" 
          size="icon" 
          variant="default"
          className={`rounded-full shadow-sm hover:shadow-md transition-shadow ${
            currentPersonality && LUNA_PERSONALITIES[currentPersonality]
            ? LUNA_PERSONALITIES[currentPersonality].color.replace('from-', 'from-opacity-80 from-').replace('to-', 'to-opacity-80 to-')
            : ''
          }`}
          disabled={loading || !inputValue.trim()}
        >
          {loading ? (
            <motion.span 
              className="h-4 w-4 border-t-2 border-primary-foreground rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}

/**
 * Sample Questions component for suggesting questions
 */
export function SampleQuestions({ questions, onSelect }) {
  return (
    <div className="px-4 py-2 border-t border-b bg-muted/50 dark:bg-muted/30">
      <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs dark:bg-muted/50"
            onClick={() => onSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
