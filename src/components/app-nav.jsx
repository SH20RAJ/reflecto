"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Book,
  Calendar,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const { setTheme, theme } = useTheme();

  // Toggle command palette with Ctrl+K
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const routes = [
    {
      href: "/notebooks",
      label: "Notebooks",
      icon: Book,
      active: pathname === "/notebooks" || pathname.startsWith("/notebooks/"),
    },
    {
      href: "/calendar",
      label: "Calendar",
      icon: Calendar,
      active: pathname === "/calendar",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
  ];

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container flex h-14 justify-center items-center text-center">
          <div className="mr-4 flex items-center justify-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <motion.span 
                className="font-bold text-xl bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Reflecto
              </motion.span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium justify-center">
              {routes.map((route, index) => (
                <motion.div
                  key={route.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                      route.active ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="inline-flex items-center whitespace-nowrap rounded-md font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                  onClick={() => setOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span className="hidden lg:inline-flex">Search notebooks...</span>
                  <span className="inline-flex lg:hidden">Search...</span>
                  <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </motion.div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-0 overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all"
                  >
                    {session?.user?.image ? (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/notebooks">
                    <Book className="mr-2 h-4 w-4" />
                    <span>Notebooks</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <motion.div 
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Sun className="mr-2 h-4 w-4" />
                      </motion.div>
                      <span>Light mode</span>
                    </>
                  ) : (
                    <>
                      <motion.div 
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Moon className="mr-2 h-4 w-4" />
                      </motion.div>
                      <span>Dark mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-7">
                  <Link
                    href="/"
                    className="flex items-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <motion.span 
                      className="font-bold text-xl bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Reflecto
                    </motion.span>
                  </Link>
                </div>
                <div className="flex flex-col space-y-3 mt-8">
                  {routes.map((route, index) => (
                    <motion.div
                      key={route.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                    >
                      <Link
                        href={route.href}
                        onClick={() => setShowMobileMenu(false)}
                        className={cn(
                          "flex items-center px-7 py-2 text-base font-medium transition-colors hover:text-foreground/80",
                          route.active ? "bg-accent text-foreground" : "text-foreground/60"
                        )}
                      >
                        <route.icon className="mr-3 h-5 w-5" />
                        {route.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <motion.div 
                  className="absolute bottom-4 px-7 w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark mode</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search notebooks..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Book className="mr-2 h-4 w-4" />
              <span>My Notebooks</span>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar View</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent">
            <CommandItem>
              <Book className="mr-2 h-4 w-4" />
              <span>Journal - May 23, 2025</span>
            </CommandItem>
            <CommandItem>
              <Book className="mr-2 h-4 w-4" />
              <span>Project Ideas</span>
            </CommandItem>
            <CommandItem>
              <Book className="mr-2 h-4 w-4" />
              <span>Reading Notes</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
