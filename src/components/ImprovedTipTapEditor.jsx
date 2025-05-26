"use client";

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { motion } from 'framer-motion';
import '@/styles/improved-tiptap.css';

import { 
  Bold, Italic, ListOrdered, List, 
  Heading1, Heading2, Quote, Undo, Redo, 
  Link as LinkIcon, Divide, Maximize2, Minimize2, 
  X, Moon, Type, Code 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ImprovedTipTapEditor({
  initialContent = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing your thoughts here...',
  className = '',
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [hideToolbar, setHideToolbar] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Initialize the editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'editor-hr',
          }
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary decoration-1 underline-offset-2',
        }
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      updateWordCount(editor.getText());
    },
    editable: !readOnly,
    autofocus: 'end',
  });

  const updateWordCount = useCallback((text) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor?.commands.setContent(initialContent);
      updateWordCount(editor.getText());
    }
  }, [initialContent, editor, updateWordCount]);

  useEffect(() => {
    const handleKeydown = (e) => {
      // Escape to exit fullscreen or focus mode
      if (e.key === 'Escape') {
        setFullscreen(false);
        setFocusMode(false);
      }
      
      // Toggle fullscreen with F11
      if (e.key === 'F11') {
        e.preventDefault();
        setFullscreen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Toggle fullscreen and apply body styles
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  if (!isMounted) {
    return null;
  }

  if (!editor) {
    return <div className="p-4 text-center text-muted-foreground">Loading editor...</div>;
  }

  // Set link function
  const setLink = () => {
    if (linkUrl) {
      let finalUrl = linkUrl;
      if (!/^https?:\/\//.test(linkUrl) && !linkUrl.startsWith('mailto:')) {
        finalUrl = `https://${linkUrl}`;
      }
      
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const toggleFullscreen = () => setFullscreen(!fullscreen);
  const toggleFocusMode = () => setFocusMode(!focusMode);
  const toggleToolbar = () => setHideToolbar(!hideToolbar);

  // Toolbar buttons with minimal configuration
  const toolbarButtons = [
    {
      icon: <Bold size={16} />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      tooltip: 'Bold'
    },
    {
      icon: <Italic size={16} />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      tooltip: 'Italic'
    },
    {
      icon: <Code size={16} />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      tooltip: 'Code'
    },
    {
      type: 'separator'
    },
    {
      icon: <Heading1 size={16} />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      tooltip: 'Heading 1'
    },
    {
      icon: <Heading2 size={16} />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      tooltip: 'Heading 2'
    },
    {
      type: 'separator'
    },
    {
      icon: <List size={16} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      tooltip: 'Bullet List'
    },
    {
      icon: <ListOrdered size={16} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      tooltip: 'Ordered List'
    },
    {
      icon: <Quote size={16} />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      tooltip: 'Quote'
    },
    {
      icon: <Divide size={16} />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      tooltip: 'Horizontal Line'
    },
    {
      type: 'separator'
    },
    {
      icon: <LinkIcon size={16} />,
      action: () => setShowLinkInput(!showLinkInput),
      isActive: editor.isActive('link'),
      tooltip: 'Add Link'
    },
    {
      type: 'separator'
    },
    {
      icon: <Undo size={16} />,
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      tooltip: 'Undo'
    },
    {
      icon: <Redo size={16} />,
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      tooltip: 'Redo'
    },
    {
      type: 'separator'
    },
    {
      icon: <Moon size={16} />,
      action: toggleFocusMode,
      isActive: focusMode,
      tooltip: focusMode ? 'Exit Focus Mode' : 'Focus Mode'
    },
    {
      icon: fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />,
      action: toggleFullscreen,
      tooltip: fullscreen ? 'Exit Fullscreen' : 'Fullscreen'
    }
  ];

  return (
    <motion.div 
      className={cn(
        "tiptap-editor-container rounded-md overflow-hidden",
        fullscreen && "fixed inset-0 z-50 bg-background",
        focusMode && "focus-mode",
        className
      )}
      initial={fullscreen ? { opacity: 0 } : false}
      animate={fullscreen ? { opacity: 1 } : {}}
      exit={{ opacity: 0 }}
      onClick={() => editor && editor.commands.focus()}
    >
      {/* Simple toolbar */}
      {!readOnly && !hideToolbar && (
        <div className="tiptap-toolbar px-2 py-1 flex flex-wrap items-center gap-1 overflow-x-auto">
          {toolbarButtons.map((button, index) => 
            button.type === 'separator' ? (
              <div key={index} className="h-5 border-r mx-1" />
            ) : (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={button.isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={button.action}
                      disabled={button.disabled}
                    >
                      {button.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{button.tooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          )}
          
          <div className="ml-auto text-xs text-muted-foreground">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        </div>
      )}

      {/* Link input */}
      {showLinkInput && (
        <div className="px-2 py-1 flex gap-2 border-t border-border">
          <input
            type="text"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-grow px-2 py-1 text-sm rounded border border-input focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && setLink()}
            autoFocus
          />
          <Button size="sm" onClick={setLink} className="h-8">
            Add
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowLinkInput(false)} 
            className="h-8"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Toggle buttons when in focused/fullscreen mode */}
      {(focusMode || fullscreen) && !readOnly && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {hideToolbar && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleToolbar}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
            >
              <Type size={16} />
            </Button>
          )}
          {!hideToolbar && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleToolbar}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
            >
              <X size={16} />
            </Button>
          )}
          {fullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullscreen(false)}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
            >
              <Minimize2 size={16} />
            </Button>
          )}
        </div>
      )}

      {/* Editor content - make entire area clickable */}
      <div className="tiptap-editor-click-area" onClick={() => editor.commands.focus()}>
        <EditorContent
          editor={editor}
          className={cn(
            "prose max-w-none w-full outline-none",
            "prose-headings:font-medium prose-hr:bg-border prose-hr:h-px",
            fullscreen && "h-screen",
            focusMode && "max-w-2xl mx-auto"
          )}
        />
      </div>

      {/* Fade overlay for focus mode */}
      {focusMode && (
        <>
          <div className="absolute inset-x-0 top-0 h-16 pointer-events-none bg-gradient-to-b from-background/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none bg-gradient-to-t from-background/80 to-transparent" />
        </>
      )}
    </motion.div>
  );
}
