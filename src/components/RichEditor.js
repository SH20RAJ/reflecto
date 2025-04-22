"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import '@/styles/editor.css';

export default function RichEditor({
  initialData = null,
  onSave = () => {},
  placeholder = "Start writing your thoughts...",
  readOnly = false,
  autofocus = true
}) {
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Dynamic import of Editor.js and tools
    const loadEditor = async () => {
      try {
        // Only import if we're in the browser
        if (typeof window !== 'undefined') {
          // Core Editor
          const EditorJS = (await import('@editorjs/editorjs')).default;

          // Block Tools
          const Header = (await import('@editorjs/header')).default;
          const List = (await import('@editorjs/list')).default;
          const Checklist = (await import('@editorjs/checklist')).default;
          const Quote = (await import('@editorjs/quote')).default;
          const Code = (await import('@editorjs/code')).default;

          // Inline Tools
          const Marker = (await import('@editorjs/marker')).default;
          const Underline = (await import('@editorjs/underline')).default;
          const InlineCode = (await import('@editorjs/inline-code')).default;

          // Initialize Editor.js
          if (!editorRef.current) return;

          const defaultData = {
            time: new Date().getTime(),
            blocks: [
              {
                type: "header",
                data: {
                  text: "Today's Reflection",
                  level: 2
                }
              },
              {
                type: "paragraph",
                data: {
                  text: "What's on your mind today?"
                }
              }
            ]
          };

          const editor = new EditorJS({
            holder: editorRef.current,
            placeholder: placeholder,
            readOnly: readOnly,
            autofocus: autofocus,
            tools: {
              header: {
                class: Header,
                inlineToolbar: true,
                config: {
                  levels: [1, 2, 3, 4],
                  defaultLevel: 2
                }
              },
              list: {
                class: List,
                inlineToolbar: true,
                config: {
                  defaultStyle: 'unordered'
                }
              },
              checklist: {
                class: Checklist,
                inlineToolbar: true,
              },
              quote: {
                class: Quote,
                inlineToolbar: true,
                config: {
                  quotePlaceholder: 'Enter a quote',
                  captionPlaceholder: 'Quote\'s author'
                }
              },
              code: {
                class: Code,
                config: {
                  placeholder: 'Enter code here...'
                }
              },
              marker: {
                class: Marker,
                shortcut: 'CMD+SHIFT+M'
              },
              underline: {
                class: Underline,
                shortcut: 'CMD+U'
              },
              inlineCode: {
                class: InlineCode,
                shortcut: 'CMD+SHIFT+C'
              }
            },
            data: initialData || defaultData,
            onChange: () => {
              // Auto-save functionality could be added here
              // For now, we'll just use the explicit save button
            }
          });

          setEditorInstance(editor);
          setIsLoaded(true);

          return () => {
            if (editor) {
              editor.destroy();
            }
          };
        }
      } catch (error) {
        console.error('Error loading Editor.js:', error);
      }
    };

    loadEditor();

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, [initialData, placeholder, readOnly, autofocus]);

  const handleSave = async () => {
    if (editorInstance) {
      try {
        setIsSaving(true);
        const savedData = await editorInstance.save();
        await onSave(savedData);
        setIsSaving(false);
      } catch (error) {
        console.error('Saving failed:', error);
        setIsSaving(false);
      }
    }
  };

  // Method to get the editor content as Markdown
  const getMarkdown = async () => {
    if (!editorInstance) return '';
    try {
      const savedData = await editorInstance.save();
      // Import the conversion function dynamically to avoid SSR issues
      const { editorJsToMarkdown } = await import('@/lib/editorjs-to-markdown');
      return editorJsToMarkdown(savedData);
    } catch (error) {
      console.error('Error converting to Markdown:', error);
      return '';
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <div className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {!readOnly && (
          <Button
            onClick={handleSave}
            disabled={isSaving || !isLoaded}
            size="sm"
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>

      <div className="p-6">
        {!isLoaded ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div
            ref={editorRef}
            className="min-h-[400px] prose dark:prose-invert max-w-none"
          />
        )}
      </div>
    </Card>
  );
}
