import { AppNav } from "@/components/app-nav";
import { AppFooter } from "@/components/app-footer";

export default function NotebookLayout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center">
      <AppNav />
      <main className="flex-1">
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
