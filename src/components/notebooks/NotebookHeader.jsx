"use client";

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Save,
  Star,
  Info,
  Menu,
  ArrowLeft,
  Sparkles,
  Loader2,
  Eye,
  Share2,
  Download,
  Trash2,
  PencilRuler,
  MessageCircle,
  StarOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function NotebookHeader({
  title,
  setTitle,
  isStarred,
  toggleStarred,
  isSidebarOpen,
  setIsSidebarOpen,
  isSaving,
  handleSave,
  lastSaved,
  setActiveTab,
  notebook,
  autoSaveEnabled,
  setAutoSaveEnabled,
  setConfirmDeleteDialog,
  togglePublicStatus,
  onBack
}) {
  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-border/10 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container flex h-14 max-w-full items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 w-full truncate border-none bg-transparent px-0 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Untitled Notebook"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant={isSaving ? "outline" : "ghost"}
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <NotebookHeaderMenu 
                isStarred={isStarred}
                toggleStarred={toggleStarred}
                setActiveTab={setActiveTab}
                togglePublicStatus={togglePublicStatus}
                notebook={notebook}
                autoSaveEnabled={autoSaveEnabled}
                setAutoSaveEnabled={setAutoSaveEnabled}
                setConfirmDeleteDialog={setConfirmDeleteDialog}
              />
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Desktop Header */}
      <header className="sticky top-0 z-10 border-b border-border/10 bg-background/95 backdrop-blur hidden md:block">
        <div className="container max-w-full px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8" 
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium focus-visible:ring-transparent border-none bg-transparent px-0 h-9 w-full max-w-md"
              placeholder="Untitled Notebook"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground mr-2 hidden sm:inline-block">
                Saved {format(lastSaved, 'h:mm a')}
              </span>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleStarred}
                  >
                    {isStarred ? (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isStarred ? 'Remove from starred' : 'Add to starred'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant={isSidebarOpen ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Info className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline-block ml-1">Save</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <NotebookHeaderMenu 
                isStarred={isStarred}
                toggleStarred={toggleStarred}
                setActiveTab={setActiveTab}
                togglePublicStatus={togglePublicStatus}
                notebook={notebook}
                autoSaveEnabled={autoSaveEnabled}
                setAutoSaveEnabled={setAutoSaveEnabled}
                setConfirmDeleteDialog={setConfirmDeleteDialog}
              />
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}

function NotebookHeaderMenu({
  isStarred,
  toggleStarred,
  setActiveTab,
  togglePublicStatus,
  notebook,
  autoSaveEnabled,
  setAutoSaveEnabled,
  setConfirmDeleteDialog
}) {
  return (
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('editor')}>
        <PencilRuler className="h-4 w-4 mr-2" />
        <span>Editor</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('chat')}>
        <MessageCircle className="h-4 w-4 mr-2" />
        <span>Chat with Luna</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onClick={toggleStarred}>
        {isStarred ? (
          <>
            <StarOff className="h-4 w-4 mr-2" />
            <span>Remove from starred</span>
          </>
        ) : (
          <>
            <Star className="h-4 w-4 mr-2" />
            <span>Add to starred</span>
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
        <div className="flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          <span>Public</span>
        </div>
        <div className="flex items-center h-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 p-0" 
            onClick={togglePublicStatus}
          >
            {notebook?.isPublic ? (
              <span className="text-xs text-green-500">On</span>
            ) : (
              <span className="text-xs text-muted-foreground">Off</span>
            )}
          </Button>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
        <div className="flex items-center">
          <Save className="h-4 w-4 mr-2" />
          <span>Auto-save</span>
        </div>
        <div className="flex items-center h-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 p-0" 
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          >
            {autoSaveEnabled ? (
              <span className="text-xs text-green-500">On</span>
            ) : (
              <span className="text-xs text-muted-foreground">Off</span>
            )}
          </Button>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <Share2 className="h-4 w-4 mr-2" />
        <span>Share</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <Download className="h-4 w-4 mr-2" />
        <span>Export</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        className="cursor-pointer text-red-600 dark:text-red-400" 
        onClick={() => setConfirmDeleteDialog(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        <span>Delete</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
