import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardSidebar from "@/components/DashboardSidebar";
import NotebookChat from "@/components/NotebookChat";

export const metadata = {
  title: "Chat with Your Notebooks | Reflecto",
  description: "Ask questions about your notebooks and get instant answers. Search through your entries with natural language.",
};

export default async function ChatPage() {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Chat with Your Notebooks</h1>
            <p className="text-muted-foreground">
              Ask questions about your notebooks and get instant answers. Search through your entries with natural language.
            </p>
          </div>
          
          <NotebookChat />
        </div>
      </main>
    </div>
  );
}
