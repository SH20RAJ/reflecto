"use client";

import { useEffect, useRef, useState } from 'react';
import '@/styles/editor.css';

export default function Notebook() {
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    // Dynamic import of Editor.js and tools
    const loadEditor = async () => {
      try {
        // Only import if we're in the browser
        if (typeof window !== 'undefined') {
          const EditorJS = (await import('@editorjs/editorjs')).default;
          const Header = (await import('@editorjs/header')).default;
          const List = (await import('@editorjs/list')).default;
          const Checklist = (await import('@editorjs/checklist')).default;
          const Quote = (await import('@editorjs/quote')).default;
          const Code = (await import('@editorjs/code')).default;
          const Marker = (await import('@editorjs/marker')).default;
          const Underline = (await import('@editorjs/underline')).default;
          const InlineCode = (await import('@editorjs/inline-code')).default;

          // Initialize Editor.js
          if (!editorRef.current) return;

          const editor = new EditorJS({
            holder: editorRef.current,
            placeholder: 'Start writing your thoughts...',
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
              },
              checklist: {
                class: Checklist,
                inlineToolbar: true,
              },
              quote: {
                class: Quote,
                inlineToolbar: true,
              },
              code: Code,
              marker: Marker,
              underline: Underline,
              inlineCode: InlineCode,
            },
            data: savedData || {
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
            },
            onChange: () => {
              // Save content on change
              editor.save().then((outputData) => {
                localStorage.setItem('reflecto-content', JSON.stringify(outputData));
              });
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

    // Load saved content from localStorage
    const loadSavedContent = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('reflecto-content');
        if (saved) {
          try {
            setSavedData(JSON.parse(saved));
          } catch (e) {
            console.error('Error parsing saved content:', e);
          }
        }
      }
    };

    loadSavedContent();
    loadEditor();

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, []);

  const handleSave = async () => {
    if (editorInstance) {
      try {
        const savedData = await editorInstance.save();
        console.log('Saved data:', savedData);
        // Here you would typically send the data to your backend
        alert('Your reflection has been saved!');
      } catch (error) {
        console.error('Saving failed:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <div className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="p-6">
          {!isLoaded && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          <div
            ref={editorRef}
            className="min-h-[400px] prose dark:prose-invert max-w-none"
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}
