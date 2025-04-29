import NotebookSidebar from "@/components/NotebookSidebar";
import { ModeToggle } from "@/components/mode-toggle.jsx";

export default function NotebookLayout({ children }) {
  return (
    <div className="relative min-h-screen flex">
      <NotebookSidebar />
      <main className="flex-1 w-full bg-muted/10">
        <div className="px-4 sm:px-6 lg:px-2 py-6 md:py-0   mx-auto h-screen overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
