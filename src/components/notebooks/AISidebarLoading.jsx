"use client";

import { motion } from 'framer-motion';

export default function AISidebarLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent"
      />
      <p className="mt-4 text-sm text-muted-foreground">Analyzing your notebook...</p>
      <p className="mt-2 text-xs text-muted-foreground">Luna is reviewing your content for insights</p>
    </div>
  );
}
