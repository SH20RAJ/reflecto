import { AppNav } from "@/components/app-nav";
import { AppFooter } from "@/components/app-footer";

export default function NotebookLayout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1 w-full">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
