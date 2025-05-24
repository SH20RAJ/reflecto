"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Book,
  PlusCircle,
  Sparkles,
  Search,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import PremiumNotebookSidebar from './PremiumNotebookSidebar';

export default function MobileBottomNav({ onCreateNew }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Define mobile nav items
  const navItems = [
    {
      name: 'Notebooks',
      icon: Book,
      action: () => router.push('/notebooks'),
      active: pathname === '/notebooks'
    },
    {
      name: 'Search',
      icon: Search,
      action: () => router.push('/notebooks?search=true'),
      active: pathname.includes('search')
    },
    {
      name: 'Create',
      icon: PlusCircle,
      action: onCreateNew,
      primary: true
    },
    {
      name: 'Luna',
      icon: Sparkles,
      action: () => router.push('/chat'),
      active: pathname.includes('chat')
    },
    {
      name: 'Menu',
      icon: Menu,
      isMenu: true,
      active: false
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/40 backdrop-blur-sm">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item, i) => 
          item.isMenu ? (
            <Sheet key={item.name}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center justify-center h-14 w-16 rounded-lg gap-1",
                    item.active && "text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.name}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72">
                {/* Render sidebar content directly */}
                <div className="h-full">
                  <PremiumNotebookSidebar />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              key={item.name}
              variant={item.primary ? "default" : "ghost"}
              size="sm"
              onClick={item.action}
              className={cn(
                "flex flex-col items-center justify-center h-14 w-16 rounded-lg gap-1",
                item.primary ? "bg-primary text-primary-foreground" : "",
                item.active && !item.primary && "text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", item.primary && "h-6 w-6")} />
              <span className="text-[10px]">{item.name}</span>
            </Button>
          )
        )}
      </div>
    </div>
  );
}
