"use client";

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/enhanced-tiptap.css';

import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, 
  Quote, Code, Heading1, Heading2, Heading3, Undo, Redo, 
  Link as LinkIcon, Image as ImageIcon, Divide, AlignLeft, 
  AlignCenter, AlignRight, Maximize2, Minimize2, X, Fullscreen,
  CheckCircle2, Sparkles, Moon, Palette, TextQuote, FileText,
  ListTodo, MoveVertical, Type, Check, ChevronDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export default function EnhancedTipTapEditor({
  initialContent = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing your thoughts here...',
  className = '',
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState('default'); // default, sepia, night
  const [fontSize, setFontSize] = useState('medium');
  const [fullscreen, setFullscreen] = useState(false);
  const [hideToolbar, setHideToolbar] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Initialize the editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph',
          }
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'horizontal-rule',
          }
        }
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
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
      updateWordCount(editor.getText());
    },
    editable: !readOnly,
    autofocus: 'end',
    parseOptions: {
      preserveWhitespace: 'full',
    },
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
      editor.commands.setContent(initialContent);
      // Set word count on initial load
      updateWordCount(editor.getText());
    }
  }, [initialContent, editor, updateWordCount]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setFocusMode(false);
        setFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    // Apply fullscreen
    if (fullscreen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  if (!isMounted) {
    return null; // Return null during SSR to avoid hydration issues
  }

  // If no editor is available, show a loading indicator
  if (!editor) {
    return <div className="p-4">Loading editor...</div>;
  }

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      setHideToolbar(true);
    } else {
      setHideToolbar(false);
    }
  };
  
  const setLink = () => {
    if (linkUrl) {
      // Add https:// if it doesn't have a protocol
      let finalUrl = linkUrl;
      if (!/^https?:\/\//.test(linkUrl) && !linkUrl.startsWith('mailto:')) {
        finalUrl = `https://${linkUrl}`;
      }
      
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
      
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleToggleToolbar = () => {
    setHideToolbar(!hideToolbar);
  };

  const themeStyles = {
    default: 'bg-background text-foreground',
    sepia: 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100',
    night: 'bg-zinc-900 text-zinc-100 dark:bg-black dark:text-gray-200'
  };
  
  const fontSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <motion.div 
      className={cn(
        "tiptap-editor-container rounded-md overflow-hidden flex flex-col",
        fullscreen && "fixed inset-0 z-50",
        focusMode && "prose-lg",
        themeStyles[theme],
        theme === 'default' ? 'border border-input' : '',
        className
      )}
      initial={fullscreen ? { opacity: 0, scale: 0.95 } : false}
      animate={fullscreen ? { opacity: 1, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ 
        cursor: 'text' // Make the entire container show text cursor
      }}
      onClick={() => editor && editor.commands.focus()}
    >
      {/* Editor Controls */}
      <AnimatePresence>
        {(!hideToolbar && !readOnly) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="tiptap-toolbar relative bg-background backdrop-blur-sm border-b px-2 py-1 flex items-center gap-1 overflow-x-auto"
          >
            {/* Format Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                  <Type className="h-4 w-4" />
                  <span className="hidden sm:inline">Format</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Text Style</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('bold') && "bg-accent")}
                >
                  <Bold className="h-4 w-4" /> Bold
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('italic') && "bg-accent")}
                >
                  <Italic className="h-4 w-4" /> Italic
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('strike') && "bg-accent")}
                >
                  <Strikethrough className="h-4 w-4" /> Strikethrough
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('code') && "bg-accent")}
                >
                  <Code className="h-4 w-4" /> Code
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Headings</DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('heading', { level: 1 }) && "bg-accent")}
                >
                  <Heading1 className="h-4 w-4" /> Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('heading', { level: 2 }) && "bg-accent")}
                >
                  <Heading2 className="h-4 w-4" /> Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('heading', { level: 3 }) && "bg-accent")}
                >
                  <Heading3 className="h-4 w-4" /> Heading 3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Lists Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                  <List className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('bulletList') && "bg-accent")}
                >
                  <List className="h-4 w-4" /> Bullet List
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('orderedList') && "bg-accent")}
                >
                  <ListOrdered className="h-4 w-4" /> Numbered List
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn("cursor-pointer gap-2", editor.isActive('blockquote') && "bg-accent")}
                >
                  <TextQuote className="h-4 w-4" /> Blockquote
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className="cursor-pointer gap-2"
                >
                  <Divide className="h-4 w-4" /> Divider
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-0.5" />

            {/* Basic formatting buttons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8", editor.isActive('bold') ? 'bg-accent' : '')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8", editor.isActive('italic') ? 'bg-accent' : '')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => editor.chain().focus().toggleStrike().run()} 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8", editor.isActive('strike') ? 'bg-accent' : '')}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Strikethrough</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Link */}
            <div className="relative">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowLinkInput(!showLinkInput)} 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8", editor.isActive('link') ? 'bg-accent' : '')}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showLinkInput && (
                <div className="absolute top-full left-0 mt-1 bg-background border rounded-md p-2 z-10 flex gap-2 shadow-md min-w-[220px]">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-primary flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && setLink()}
                    autoFocus
                  />
                  <Button size="sm" onClick={setLink} className="text-xs h-7">Add</Button>
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="h-6 mx-0.5" />

            {/* View options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Options</DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={() => setTheme('default')}
                  className="cursor-pointer gap-2"
                >
                  {theme === 'default' && <Check className="h-4 w-4" />}
                  <span className={theme === 'default' ? 'font-medium' : ''}>Default</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setTheme('sepia')}
                  className="cursor-pointer gap-2"
                >
                  {theme === 'sepia' && <Check className="h-4 w-4" />}
                  <span className={theme === 'sepia' ? 'font-medium' : ''}>Sepia</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setTheme('night')}
                  className="cursor-pointer gap-2"
                >
                  {theme === 'night' && <Check className="h-4 w-4" />}
                  <span className={theme === 'night' ? 'font-medium' : ''}>Night</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Font Size</DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={() => setFontSize('small')}
                  className="cursor-pointer gap-2"
                >
                  {fontSize === 'small' && <Check className="h-4 w-4" />}
                  <span className={fontSize === 'small' ? 'font-medium' : ''}>Small</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setFontSize('medium')}
                  className="cursor-pointer gap-2"
                >
                  {fontSize === 'medium' && <Check className="h-4 w-4" />}
                  <span className={fontSize === 'medium' ? 'font-medium' : ''}>Medium</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setFontSize('large')}
                  className="cursor-pointer gap-2"
                >
                  {fontSize === 'large' && <Check className="h-4 w-4" />}
                  <span className={fontSize === 'large' ? 'font-medium' : ''}>Large</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Special modes */}
            <div className="ml-auto flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleFocusMode}
                      variant={focusMode ? "secondary" : "ghost"} 
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Moon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Focus Mode</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleFullscreen}
                      variant={fullscreen ? "secondary" : "ghost"} 
                      size="icon"
                      className="h-8 w-8"
                    >
                      {fullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span className="text-xs text-muted-foreground px-2 border-l ml-1">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show/hide toolbar button - when in focus mode */}
      {focusMode && !readOnly && (
        <div className="absolute top-2 right-2 z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" 
                    size="icon"
                    onClick={handleToggleToolbar}
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm border-muted"
                  >
                    {hideToolbar ? (
                      <Type className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hideToolbar ? 'Show Toolbar' : 'Hide Toolbar'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>
      )}

      {/* Close fullscreen button */}
      {fullscreen && (
        <motion.div 
          className="absolute top-2 right-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Button
            variant="outline" 
            size="icon"
            onClick={() => setFullscreen(false)}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className={cn(
          "prose prose-slate dark:prose-invert max-w-none flex-grow overflow-auto",
          "prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-hr:my-4 prose-hr:border-muted-foreground/40 prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic",
          "px-4 py-3 md:px-6 md:py-4",
          fullscreen && "h-screen",
          focusMode && "prose-lg leading-relaxed",
          fontSizeStyles[fontSize],
          readOnly ? "cursor-default" : ""
        )} 
      />
      
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
