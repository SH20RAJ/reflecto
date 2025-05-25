"use client";

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Code, 
  Heading1, Heading2, Heading3, 
  Undo, Redo, Link as LinkIcon, 
  Image as ImageIcon, Divide, AlignLeft, 
  AlignCenter, AlignRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TipTapEditor({
  initialContent = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing your thoughts here...',
  className = '',
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Initialize the editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary decoration-1 underline-offset-2 hover:text-primary/80',
        }
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !readOnly,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!isMounted) {
    return null; // Return null during SSR to avoid hydration issues
  }

  // If no editor is available, show a loading indicator
  if (!editor) {
    return <div className="p-4">Loading editor...</div>;
  }

  const setLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  return (
    <div className={cn("tiptap-editor-container rounded-md", className)}>
      {!readOnly && (
        <div className="tiptap-toolbar bg-muted/20 border-b rounded-t-md p-1.5 flex flex-wrap gap-1 overflow-x-auto">
          <div className="flex items-center space-x-1">
            <Button 
              onClick={() => editor.chain().focus().toggleBold().run()}
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('bold') ? 'bg-muted' : '')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('italic') ? 'bg-muted' : '')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => editor.chain().focus().toggleStrike().run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('strike') ? 'bg-muted' : '')}
              title="Strike through"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => editor.chain().focus().toggleCode().run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('code') ? 'bg-muted' : '')}
              title="Inline code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-1 ml-1 border-l pl-1">
            <Button 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('heading', { level: 1 }) ? 'bg-muted' : '')}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) ? 'bg-muted' : '')}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) ? 'bg-muted' : '')}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-1 ml-1 border-l pl-1">
            <Button 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('bulletList') ? 'bg-muted' : '')}
              title="Bullet list"
            >
              <List className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('orderedList') ? 'bg-muted' : '')}
              title="Ordered list"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", editor.isActive('blockquote') ? 'bg-muted' : '')}
              title="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => editor.chain().focus().setHorizontalRule().run()} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              title="Horizontal rule"
            >
              <Divide className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-1 ml-1 border-l pl-1">
            <div className="relative">
              <Button 
                onClick={() => setShowLinkInput(!showLinkInput)} 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor.isActive('link') ? 'bg-muted' : '')}
                title="Add link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>

              {showLinkInput && (
                <div className="absolute top-full left-0 mt-1 bg-background border rounded-md p-2 z-10 flex gap-2 shadow-md min-w-[220px]">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-primary flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && setLink()}
                  />
                  <Button size="sm" onClick={setLink} className="text-xs h-7">Add</Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-auto">
            <Button 
              onClick={() => editor.chain().focus().undo().run()} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              title="Undo"
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => editor.chain().focus().redo().run()} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              title="Redo"
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <EditorContent 
        editor={editor} 
        className={cn(
          "prose prose-slate dark:prose-invert max-w-none w-full px-4 py-3 min-h-[300px] focus:outline-none",
          "prose-headings:font-semibold prose-p:my-2 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-hr:my-4 prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic",
          readOnly ? "cursor-default" : ""
        )} 
      />
    </div>
  );
}
