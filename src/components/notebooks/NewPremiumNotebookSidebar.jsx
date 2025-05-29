"use client";

import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Menu } from 'lucide-react';
import { useTags } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import PremiumSidebarHeader from './notebooks/PremiumSidebarHeader';
import PremiumSidebarNav from './notebooks/PremiumSidebarNav';
import PremiumSidebarTags from './notebooks/PremiumSidebarTags';
import PremiumSidebarProfile from './notebooks/PremiumSidebarProfile';

const navItems = [
  {
    name: 'All Notebooks',
    href: '/notebooks',
    icon: Book,
    description: 'Browse all your notebooks'
  },
  {
    name: 'Daily Journal',
    href: '/notebooks/daily',
    icon: Calendar,
    badge: 'AI',
    description: 'Your daily journaling space'
  },
  {
    name: 'Shared with me',
    href: '/notebooks/shared',
    icon: User,
    description: 'Notebooks shared with you'
  },
  {
    name: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
    badge: 'Premium',
    description: 'Chat with your AI assistant'
  },
  {
    name: 'Bookmarks',
    href: '/notebooks/bookmarks',
    icon: Bookmark,
    description: 'Your saved notebooks'
  },
  {
    name: 'AI Insights',
    href: '/insights',
    icon: Sparkles,
    badge: 'Premium',
    description: 'AI-powered insights'
  }
];

const SidebarContent = ({ onClose, isCollapsed, onToggleCollapse }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTagId = searchParams?.get('tag');
  const { tags, isLoading } = useTags();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTags, setShowTags] = useState(true);

  const isActive = (item) => {
    if (item.href === '/notebooks' && pathname === '/notebooks') return true;
    if (item.href === '/notebooks/daily' && pathname.startsWith('/notebooks/daily')) return true;
    return pathname.startsWith(item.href);
  };

  const handleNavigation = (href, e) => {
    e?.preventDefault();
    router.push(href);
    onClose?.();
  };

  const handleLogout = async () => {
    // Implement logout logic
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
      <PremiumSidebarHeader
        isCollapsed={isCollapsed}
        onClose={onClose}
        onToggleCollapse={onToggleCollapse}
      />

      <div className="px-3 pt-4 pb-2">
        <div className="flex gap-2">
          <Button
            className={cn(
              "w-full gap-2 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-600/90 hover:to-indigo-600/90 text-white border-0",
              isCollapsed ? "justify-center px-0" : "justify-start px-4"
            )}
            onClick={(e) => handleNavigation("/notebooks/new", e)}
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

      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <TooltipProvider delayDuration={300}>
          <PremiumSidebarNav
            navItems={navItems}
            isCollapsed={isCollapsed}
            isActive={isActive}
            handleNavigation={handleNavigation}
          />

          <PremiumSidebarTags
            isCollapsed={isCollapsed}
            showTags={showTags}
            setShowTags={setShowTags}
            tags={tags}
            isLoading={isLoading}
            currentTagId={currentTagId}
            handleNavigation={handleNavigation}
          />
        </TooltipProvider>
      </nav>

      <div className="p-3 mt-auto border-t border-border/20">
        <PremiumSidebarProfile
          session={session}
          isCollapsed={isCollapsed}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
        />
      </div>
    </motion.div>
  );
};

export default function PremiumNotebookSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent
            onClose={() => setIsOpen(false)}
            isCollapsed={false}
            onToggleCollapse={() => { }}
          />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block relative">
        <SidebarContent
          onClose={() => setIsCollapsed(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(false)}
        />
      </div>
    </>
  );
}
