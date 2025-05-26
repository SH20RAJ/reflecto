"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AISidebarHeader() {
  return (
    <div className="p-4 md:border-b border-b-0 border-border/10 bg-gradient-to-r from-background via-background to-muted/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <motion.div 
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              Luna
            </h3>
            <p className="text-xs text-muted-foreground">
              Your AI Writing Assistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
