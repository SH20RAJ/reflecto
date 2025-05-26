"use client";

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  ChevronRight, 
  FileText,
  MessageSquare 
} from "lucide-react";

export default function AISidebarInsights({ 
  isOpen,
  insights,
  onInsightClick,
  selectedInsight
}) {
  if (!insights?.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex-1 overflow-hidden",
        !isOpen && "hidden"
      )}
    >
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="flex flex-col gap-2 p-4">
          {insights.map((insight, index) => (
            <Button
              key={insight.id || index}
              variant="ghost"
              className={cn(
                "justify-start gap-2 h-auto py-3 px-4 hover:bg-accent",
                selectedInsight?.id === insight.id && "bg-accent"
              )}
              onClick={() => onInsightClick(insight)}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex flex-col items-start gap-1 text-left">
                  <p className="text-sm font-medium line-clamp-2">
                    {insight.title}
                  </p>
                  {insight.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.summary}
                    </p>
                  )}
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

function getInsightIcon(type) {
  switch (type?.toLowerCase()) {
    case 'summary':
      return <FileText className="h-4 w-4" />;
    case 'analysis':
      return <BookOpen className="h-4 w-4" />;
    case 'discussion':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}
