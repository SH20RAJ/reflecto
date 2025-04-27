"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Book, Calendar, User, PenLine, Settings, Plus, Tag, ChevronRight, ChevronDown, Grid, Menu, LogOut, MessageSquare } from 'lucide-react';
import { useTags } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const SidebarContent = ({ onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showTags, setShowTags] = useState(true);

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
    <div className="h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">Reflecto</h2>
      </div>

      <div className="px-3 mb-4">
        <Link href="/notebooks?new=true" onClick={onClose}>
          <Button
            className="w-full justify-start gap-2 rounded-full h-12"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            New Notebook
          </Button>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref onClick={onClose}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start rounded-lg h-10",
                isActive(item)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        ))}

        {/* Tags Section */}
        <div className="mt-6">
          <div
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground cursor-pointer"
            onClick={() => setShowTags(!showTags)}
          >
            <div className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              <span>Tags</span>
            </div>
            {showTags ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>

          {showTags && (
            <div className="mt-1 space-y-1 pl-2">
              {isLoading ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">Loading tags...</div>
              ) : tags.length > 0 ? (
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
                        <span className="ml-1">{tag.name}</span>
                      </div>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{tag.count}</span>
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
        <div className="border-t border-border/40 pt-4 pb-2">
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-muted cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image} alt={session.user.name} />
                  <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>

              <Button
                variant="outline"
                className="w-full justify-start text-sm gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardSidebar = () => {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-col">
        <SidebarContent onClose={() => {}} />
      </div>

      {/* Mobile sidebar with Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      {/* Add padding to the top on mobile to account for the fixed header */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default DashboardSidebar;
