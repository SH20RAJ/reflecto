"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Book, Calendar, User, Plus, Tag, ChevronRight, ChevronLeft, MessageSquare, Menu } from 'lucide-react';
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
  const [selectedTagId, setSelectedTagId] = useState(null);

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

  const isActive = (href) => {
    if (href === '/notebooks' && pathname === '/notebooks') {
      return true;
    }
    return href !== '/notebooks' && pathname.startsWith(href);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="p-5 flex items-center justify-between border-b">
        {!isCollapsed ? (
          <Link href={"/"} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold">Reflecto</span>
          </Link>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onToggleCollapse?.();
          }}
          className="h-8 w-8 rounded-lg hover:bg-muted"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg mb-1 text-sm transition-colors",
                isActive(item.href) 
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {!isCollapsed && tags && tags.length > 0 && (
          <div className="p-2 mt-4">
            <div className="px-3 mb-2 text-sm font-medium text-muted-foreground">Tags</div>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/notebooks?tag=${tag.id}`}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg mb-1 text-sm transition-colors",
                  currentTagId === tag.id 
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <Tag className="h-3.5 w-3.5 mr-3" />
                <span className="truncate">{tag.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image} />
              <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <ModeToggle />
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image} />
              <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
};

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
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent onClose={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className={cn(
          "fixed top-0 left-0 z-40 h-screen border-r bg-background transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[280px]"
        )}>
          <SidebarContent 
            isCollapsed={isCollapsed} 
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
          />
        </div>
      </div>
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
