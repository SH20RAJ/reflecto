import NotebookSidebar from "@/components/NotebookSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function NotebookLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen">

        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="hidden md:block">
          <NotebookSidebar />
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:flex" />

        <ResizablePanel defaultSize={80} className="bg-background">
          <div className="h-screen overflow-y-auto">
            <div className="w-full mx-auto h-screen">
              {children}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
