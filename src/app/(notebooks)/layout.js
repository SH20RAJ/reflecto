import NotebookSidebar from "@/components/NotebookSidebar";
import { ModeToggle } from "@/components/mode-toggle.jsx";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NotebookLayout({ children }) {
  return (
    <div className="relative min-h-screen flex">
      <NotebookSidebar />
      <main className="flex-1 w-full overflow-auto bg-muted/10">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 px-4 py-3 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 w-full bg-muted/50 border-none"
            />
          </div>
          <ModeToggle />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
