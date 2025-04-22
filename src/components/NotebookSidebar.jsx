"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Calendar, User, PenLine, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const NotebookSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      name: 'Notebooks',
      href: '/notebooks',
      icon: Book,
      exact: true
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      exact: false
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      exact: false
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="h-screen w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">Reflecto</h2>
      </div>

      <div className="px-3 mb-4">
        <Link href="/notebooks?new=true">
          <Button
            className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full h-12"
            variant="ghost"
          >
            <Plus className="h-4 w-4" />
            New Notebook
          </Button>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
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
      </nav>

      <div className="p-3 mt-auto">
        <div className="border-t border-border/40 pt-4 pb-2">
          {session?.user ? (
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

export default NotebookSidebar;
