"use client";

import React from 'react';
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LUNA_PERSONALITIES } from "@/lib/luna-personalities";

/**
 * MoodSelector component for selecting Luna's personality
 */
export function MoodSelector({ 
  isOpen, 
  onOpenChange, 
  currentPersonality, 
  onPersonalityChange 
}) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
          <Heart className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs">Luna's Mood</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Choose Luna's Personality</h4>
          <p className="text-xs text-muted-foreground">
            Select how you'd like Luna to interact with you today.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {Object.entries(LUNA_PERSONALITIES).map(([key, personality]) => (
              <Button
                key={key}
                variant={currentPersonality === key ? "default" : "outline"} 
                size="sm"
                className={`justify-start h-full ${currentPersonality === key ? 'border-2' : ''} dark:border-muted-foreground/20 dark:bg-muted/50 dark:hover:bg-muted/80`}
                onClick={() => {
                  onPersonalityChange(key, personality);
                  onOpenChange(false);
                }}
              >
                <div className={`mr-2 p-1 rounded-full ${personality.color}`}>
                  {personality.icon}
                </div>
                <span className="text-xs">{personality.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
