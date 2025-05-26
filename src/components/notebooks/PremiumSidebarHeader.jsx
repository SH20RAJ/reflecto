"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PremiumSidebarHeader({ isCollapsed, onClose, onToggleCollapse }) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-border/20">
      {!isCollapsed ? (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
            Reflecto
          </span>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="w-full h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
      
      {!isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-lg hover:bg-muted transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
