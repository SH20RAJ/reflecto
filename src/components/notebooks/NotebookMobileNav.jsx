"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PencilRuler, MessageCircle, Sparkles, Save, Loader2 } from "lucide-react";

export default function NotebookMobileNav({
  activeTab,
  setActiveTab,
  isSaving,
  onSave,
  onBack,
  onOpenAISidebar
}) {
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/10 p-2 md:hidden z-20">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button 
            variant={activeTab === 'editor' ? "ghost" : "ghost"}
            size="sm" 
            className={cn(
              "h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl",
              activeTab === 'editor' ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab('editor')}
          >
            <PencilRuler className={cn(
              "h-5 w-5",
              activeTab === 'editor' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-[10px]">Editor</span>
            {activeTab === 'editor' && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute bottom-1 w-6 h-1 rounded-full bg-primary"
              />
            )}
          </Button>
          
          <Button 
            variant="ghost"
            size="sm"
            className="h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground relative"
            onClick={onOpenAISidebar}
          >
            <div className="relative">
              <Sparkles className="h-5 w-5" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"
              />
            </div>
            <span className="text-[10px]">Luna</span>
          </Button>
          
          <Button 
            variant={activeTab === 'chat' ? "ghost" : "ghost"}
            size="sm" 
            className={cn(
              "h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl",
              activeTab === 'chat' ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle className={cn(
              "h-5 w-5",
              activeTab === 'chat' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-[10px]">Chat</span>
            {activeTab === 'chat' && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute bottom-1 w-6 h-1 rounded-full bg-primary"
              />
            )}
          </Button>
          
          <Button 
            variant="ghost"
            size="sm" 
            className="h-14 flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground"
            onClick={onBack}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.5]">
              <path d="M9 4H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
              <path d="M19 4h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
              <path d="M9 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" />
              <path d="M19 14h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" />
            </svg>
            <span className="text-[10px]">Notebooks</span>
          </Button>
        </div>
      </div>
      
      {/* Floating Action Button for quick save */}
      <Button 
        variant="primary"
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Save className="h-5 w-5" />
        )}
      </Button>

      {/* Add padding at the bottom on mobile to account for the navigation bar */}
      <div className="h-16 md:hidden"></div>
    </>
  );
}
