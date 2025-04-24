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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
        <div className="container flex h-14 justify-center items-center text-center">
          <div className="mr-4 flex items-center justify-center ">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">Reflecto</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium  justify-center">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                    route.active ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="w-full flex-1 md:w-auto md:flex-none">
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
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-0 overflow-hidden"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle user menu</span>
                </Button>
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
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-7">
                  <Link
                    href="/"
                    className="flex items-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="font-bold text-xl">Reflecto</span>
                  </Link>
                </div>
                <div className="flex flex-col space-y-3 mt-8">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
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
                  ))}
                </div>
                <div className="absolute bottom-4 px-7 w-full">
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
                  <Button
                    variant="outline"
                    className="w-full justify-start mt-2 text-red-600 dark:text-red-400"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search notebooks, tags..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Notebooks">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                window.location.href = "/notebooks";
              }}
            >
              <Book className="mr-2 h-4 w-4" />
              <span>All Notebooks</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                window.location.href = "/notebooks/new";
              }}
            >
              <span className="mr-2">+</span>
              <span>Create New Notebook</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pages">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                window.location.href = "/calendar";
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                window.location.href = "/profile";
              }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                window.location.href = "/settings";
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
