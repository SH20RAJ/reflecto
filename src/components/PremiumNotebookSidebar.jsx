// filepath: /Users/shaswatraj/Desktop/startups/reflecto/src/components/PremiumNotebookSidebar.jsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Calendar, User, Plus, Tag, ChevronRight, ChevronLeft, 
  ChevronDown, Menu, LogOut, MessageSquare, Settings, 
  Bookmark, Sparkles, Search 
} from 'lucide-react';
import { useTags } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SidebarContent = ({ onClose, isCollapsed, onToggleCollapse }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [showTags, setShowTags] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Get the current tag from the URL
  const currentTagId = searchParams?.get('tag');

  // Get tags data
  const { tags, isLoading } = useTags();

  const navItems = [
    {
      name: 'My Notebooks',
      href: '/notebooks',
      icon: Book,
      description: 'Browse all your notebooks',
      highlight: true,
    },
    {
      name: 'Calendar View',
      href: '/calendar',
      icon: Calendar,
      description: 'View notebooks by date',
    },
    {
      name: 'Chat with Luna',
      href: '/chat',
      icon: MessageSquare,
      description: 'Ask Luna about your journals',
      badge: 'AI',
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: Sparkles,
      description: 'Discover patterns in your writing',
      badge: 'New',
    },
    {
      name: 'Saved Items',
      href: '/bookmarks',
      icon: Bookmark,
      description: 'View your saved notebooks',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'Manage your account',
    },
  ];

  // Check if a nav item is active
  const isActive = (item) => {
    if (item.href === '/notebooks' && pathname === '/notebooks') {
      return true;
    }

    if (item.href !== '/notebooks' && pathname.startsWith(item.href)) {
      return true;
    }

    return false;
  };

  // Handle navigation
  const handleNavigation = (href, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(href);
    if (onClose) onClose();
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <motion.div 
      className="h-full flex flex-col overflow-hidden bg-background border-r border-border/40"
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ 
        width: isCollapsed ? 80 : 280,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      {/* Header with Logo and Toggle Button */}
      <div className="p-4 flex items-center justify-between border-b border-border/20">
        {!isCollapsed ? (
          // Expanded header with logo and text
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text">Reflecto</span>
          </div>
        ) : (
          // Collapsed header with toggle button
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="w-full h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
        
        {/* Only show collapse button when expanded */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="h-8 w-8 rounded-lg hover:bg-muted transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Notebook Button */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex gap-2">
          <Button
            className={cn(
              "w-full gap-2 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-600/90 hover:to-indigo-600/90 text-white border-0",
              isCollapsed ? "justify-center px-0" : "justify-start px-4"
            )}
            onClick={(e) => handleNavigation("/notebooks?new=true", e)}
          >
            <Plus className={isCollapsed ? "h-5 w-5" : "h-4 w-4"} />
            {!isCollapsed && <span>New Notebook</span>}
          </Button>

          {!isCollapsed && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="h-10 w-10 rounded-lg flex-shrink-0"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Input (visible only when expanded and search is toggled) */}
      <AnimatePresence>
        {showSearch && !isCollapsed && (
          <motion.div 
            className="px-3 pb-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notebooks..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <TooltipProvider delayDuration={300}>
          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <React.Fragment key={item.href}>
                {isCollapsed ? (
                  // Collapsed view with tooltip
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive(item) ? "secondary" : "ghost"}
                        className={cn(
                          "w-full h-10 rounded-lg justify-center px-0",
                          isActive(item) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}
                        onClick={(e) => handleNavigation(item.href, e)}
                      >
                        <item.icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start" className="ml-1">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  // Expanded view with full content
                  <Button
                    key={item.href}
                    variant={isActive(item) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-10 rounded-lg justify-start px-3",
                      isActive(item) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                    onClick={(e) => handleNavigation(item.href, e)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <Badge variant={item.badge === 'AI' ? "default" : "outline"} className="ml-auto px-1.5 py-0 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Tags Section */}
          <div className="mt-6 pt-3 border-t border-border/20">
            {isCollapsed ? (
              // Collapsed tags section with tooltip and button to expand
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-10 rounded-lg justify-center px-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleCollapse?.();
                    }}
                  >
                    <Tag className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="ml-1">
                  <div className="flex flex-col">
                    <span>Tags</span>
                    <span className="text-xs text-muted-foreground">Click to expand and see tags</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              // Expanded tags section with dropdown
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg",
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  showTags ? "bg-muted/50" : ""
                )}
                onClick={() => setShowTags(!showTags)}
              >
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <ChevronDown 
                  className="h-4 w-4 transition-transform" 
                  style={{ transform: showTags ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>
            )}

            {/* Tags List (only visible when expanded and tags are open) */}
            <AnimatePresence>
              {showTags && !isCollapsed && (
                <motion.div 
                  className="mt-2 space-y-1 ml-2 mr-1 bg-muted/20 rounded-lg py-1.5 px-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading tags...</span>
                    </div>
                  ) : tags && tags.length > 0 ? (
                    <>
                      {tags.map(tag => (
                        <Button
                          key={tag.id}
                          variant="ghost"
                          className={cn(
                            "w-full h-8 rounded-md justify-start px-3 text-xs",
                            currentTagId === tag.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                          )}
                          onClick={(e) => handleNavigation(`/notebooks?tag=${tag.id}`, e)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full mr-2",
                                currentTagId === tag.id ? "bg-primary" : "bg-muted-foreground/50"
                              )}></span>
                              <span className="truncate">{tag.name}</span>
                            </div>
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded-full",
                              currentTagId === tag.id ? "bg-primary/20 text-primary" : "bg-muted-foreground/10"
                            )}>{tag.count}</span>
                          </div>
                        </Button>
                      ))}

                      <Button
                        variant="ghost"
                        className="w-full h-8 rounded-md justify-start px-3 text-xs text-primary/80 hover:text-primary hover:bg-primary/5"
                        onClick={(e) => handleNavigation("/tags", e)}
                      >
                        <div className="flex items-center">
                          <div className="h-3.5 w-3.5 rounded-full bg-primary/10 mr-2 flex items-center justify-center">
                            <Plus className="h-2 w-2 text-primary" />
                          </div>
                          <span className="font-medium">Manage all tags</span>
                        </div>
                      </Button>
                    </>
                  ) : (
                    <div className="px-3 py-4 text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
                      <Tag className="h-5 w-5 text-muted-foreground/50" />
                      <span>No tags found</span>
                      <Button 
                        variant="link" 
                        className="text-primary p-0 h-auto font-medium"
                        onClick={(e) => handleNavigation("/tags", e)}
                      >
                        Create a tag
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TooltipProvider>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 mt-auto border-t border-border/20">
        {session?.user ? (
          <div className="space-y-3">
            {!isCollapsed ? (
              // Expanded user profile
              <>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-all">
                  <Avatar className="h-9 w-9 border-2 border-background">
                    <AvatarImage src={session.user.image} alt={session.user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white">
                      {session.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => handleNavigation("/settings", e)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <ModeToggle />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm gap-2.5 h-9"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              // Collapsed user profile
              <div className="flex flex-col items-center gap-2">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={session.user.image} alt={session.user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white">
                          {session.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start">
                      <div className="flex flex-col">
                        <span>{session.user.name}</span>
                        <span className="text-xs text-muted-foreground">{session.user.email}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex w-full gap-1">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 flex-1"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start">Sign out</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <ModeToggle />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Not signed in
          <div className="flex flex-col space-y-2">
            {!isCollapsed ? (
              <>
                <div className="p-2 rounded-lg bg-muted/40 flex items-center justify-between">
                  <span className="text-sm">Not signed in</span>
                  <ModeToggle />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                  onClick={(e) => handleNavigation("/login", e)}
                >
                  Sign In
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleNavigation("/login", e)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start">Sign in</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <ModeToggle />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Client component that uses useSearchParams
const SidebarWithParams = () => {
  // Persist sidebar collapse state using localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      return savedState === 'true';
    }
    return false;
  });

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', newState.toString());
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-full" style={{ width: isCollapsed ? "80px" : "280px" }}>
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile sidebar with Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-lg">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent onClose={() => document.body.click()} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">Reflecto</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="default"
            size="icon"
            className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            onClick={() => router.push("/notebooks?new=true")}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Add padding to the top on mobile to account for the fixed header */}
      <div className="md:hidden h-14"></div>
    </>
  );
};

// Loading fallback for Suspense
const SidebarFallback = () => {
  return (
    <div className="h-full w-full border-r border-border/40 bg-background flex flex-col p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-muted animate-pulse"></div>
        <div className="h-6 w-24 bg-muted rounded-md animate-pulse"></div>
      </div>
      
      <div className="h-10 bg-muted rounded-lg w-full animate-pulse"></div>
      
      <div className="space-y-2">
        <div className="h-9 bg-muted rounded-md w-full animate-pulse"></div>
        <div className="h-9 bg-muted rounded-md w-full animate-pulse opacity-70"></div>
        <div className="h-9 bg-muted rounded-md w-full animate-pulse opacity-80"></div>
        <div className="h-9 bg-muted rounded-md w-full animate-pulse opacity-60"></div>
      </div>
      
      <div className="mt-auto">
        <div className="h-14 bg-muted rounded-lg w-full animate-pulse opacity-50"></div>
      </div>
    </div>
  );
};

// Main component that wraps the client component in Suspense
const PremiumNotebookSidebar = () => {
  return (
    <Suspense fallback={<SidebarFallback />}>
      <SidebarWithParams />
    </Suspense>
  );
};

export default PremiumNotebookSidebar;
