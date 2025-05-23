"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Book, Calendar, User, Plus, Tag, ChevronRight, ChevronLeft, ChevronDown, Grid, Menu, LogOut, MessageSquare } from 'lucide-react';
import { useTags } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const SidebarContent = ({ onClose, isCollapsed, onToggleCollapse }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showTags, setShowTags] = useState(false);

  // Get the current tag from the URL
  const currentTagId = searchParams.get('tag');

  // Get tags data using SWR
  const { tags, isLoading } = useTags();

  const navItems = [
    {
      name: 'Notebooks',
      href: '/notebooks',
      icon: Book,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
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

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed ? (
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/10 text-transparent bg-clip-text">Reflecto</h2>
        ) : (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">R</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onToggleCollapse?.();
          }}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="px-3 mb-4">
        <Link href="/notebooks?new=true" onClick={onClose}>
          <Button
            className={`${isCollapsed ? 'justify-center' : 'justify-start'} w-full gap-2 h-10`}
            variant="default"
            style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && "New Notebook"}
          </Button>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref onClick={onClose}>
            <Button
              variant="ghost"
              className={cn(
                "w-full rounded-md h-9",
                isCollapsed ? "justify-center px-0" : "justify-start",
                isActive(item)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Button>
          </Link>
        ))}

        {/* Tags Section */}
        <div className="mt-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground cursor-pointer"
            onClick={() => setShowTags(!showTags)}
          >
            <div className="flex items-center">
              <Tag className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span>Tags</span>}
            </div>
            {!isCollapsed && (
              showTags ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </div>

          {showTags && !isCollapsed && (
            <div className="mt-1 space-y-1 pl-2">
              {isLoading ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">Loading tags...</div>
              ) : tags && tags.length > 0 ? (
                <>
                  {tags.map(tag => (
                    <Link
                      key={tag.id}
                      href={`/notebooks?tag=${tag.id}`}
                      className={cn(
                        "flex items-center justify-between px-3 py-1.5 text-xs rounded-md",
                        currentTagId === tag.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={onClose}
                    >
                      <div className="flex items-center">
                        <span className="truncate">{tag.name}</span>
                      </div>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">{tag.count}</span>
                    </Link>
                  ))}

                  <Link
                    href="/tags"
                    className="flex items-center px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground mt-2"
                    onClick={onClose}
                  >
                    <Grid className="mr-1 h-3 w-3" />
                    <span>View all tags</span>
                  </Link>
                </>
              ) : (
                <div className="px-3 py-2 text-xs text-muted-foreground">No tags found</div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 mt-auto">
        <div className="border-t border-border/40 pt-3 pb-1">
          {session?.user ? (
            <div className="space-y-2">
              {!isCollapsed ? (
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={session.user.image} alt={session.user.name} />
                    <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <ModeToggle />
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={session.user.image} alt={session.user.name} />
                    <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isCollapsed ? (
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-sm gap-2 h-9"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-full h-9"
                    onClick={handleLogout}
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
                {isCollapsed && <ModeToggle className="w-full" />}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isCollapsed ? (
                <Button variant="outline" className="flex-1">
                  Sign In
                </Button>
              ) : (
                <Button variant="outline" size="icon" className="w-full">
                  <User className="h-4 w-4" />
                </Button>
              )}
              <ModeToggle />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Client component that uses useSearchParams
const SidebarWithParams = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Desktop sidebar - now works with ResizablePanel */}
      <div className="h-full w-full border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
        <SidebarContent
          onClose={() => {}}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile sidebar with Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent onClose={() => document.body.click()} />
          </SheetContent>
        </Sheet>

        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">Reflecto</h2>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link href="/notebooks?new=true">
            <Button
              variant="default"
              size="icon"
              className="rounded-full"
              style={{ backgroundColor: 'rgb(251 191 36)', color: 'black' }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Add padding to the top on mobile to account for the fixed header */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

// Loading fallback for Suspense
const SidebarFallback = () => {
  return (
    <div className="h-full w-full border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded-md w-3/4"></div>
        <div className="h-6 bg-muted rounded-md w-1/2"></div>
        <div className="h-6 bg-muted rounded-md w-2/3"></div>
        <div className="h-6 bg-muted rounded-md w-1/2"></div>
        <div className="h-6 bg-muted rounded-md w-3/5"></div>
      </div>
    </div>
  );
};

// Main component that wraps the client component in Suspense
const NotebookSidebar = () => {
  return (
    <Suspense fallback={<SidebarFallback />}>
      <SidebarWithParams />
    </Suspense>
  );
};

export default NotebookSidebar;
