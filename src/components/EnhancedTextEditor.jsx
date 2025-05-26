'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Link,
  Image,
  Undo,
  Redo,
} from 'lucide-react';

/**
 * Enhanced Text Editor Component
 * A beautiful and minimalistic editor with focus mode and full-screen capabilities
 */
export default function EnhancedTextEditor({
  initialValue = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing your thoughts here...',
  className = '',
}) {
  const [content, setContent] = useState(initialValue);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [editHistory, setEditHistory] = useState({ past: [], future: [] });
  const textareaRef = useRef(null);
  
  // Update content when initialValue changes
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);
  
  // Handle fullscreen mode changes
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && (isFullscreen || isFocusMode)) {
        setIsFullscreen(false);
        setIsFocusMode(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen, isFocusMode]);

  // Set up autofocus when entering fullscreen or focus mode
  useEffect(() => {
    if ((isFullscreen || isFocusMode) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFullscreen, isFocusMode]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    // Save to history for undo/redo
    if (content !== newValue) {
      setEditHistory(prev => ({
        past: [...prev.past, content],
        future: []
      }));
    }
    setContent(newValue);
    onChange(newValue);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (isFocusMode && !isFullscreen) {
      setIsFocusMode(false);
    }
  };
  
  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFullscreen && !isFocusMode) {
      setIsFullscreen(true);
    }
  };
  
  const insertFormatting = (format) => {
    if (!textareaRef.current || readOnly) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        cursorOffset = 1;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        cursorOffset = 3;
        break;
      case 'h1':
        formattedText = `\n# ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'ul':
        formattedText = `\n- ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'ol':
        formattedText = `\n1. ${selectedText}`;
        cursorOffset = 4;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        cursorOffset = 3;
        break;
      case 'image':
        formattedText = `![${selectedText}](image-url)`;
        cursorOffset = 2;
        break;
      default:
        return;
    }
    
    // Save current state for undo
    setEditHistory(prev => ({
      past: [...prev.past, content],
      future: []
    }));
    
    // Update the content with the formatted text
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    onChange(newContent);
    
    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.selectionStart = start + formattedText.length - cursorOffset;
        textarea.selectionEnd = start + formattedText.length - cursorOffset;
      } else {
        textarea.selectionStart = start + cursorOffset;
        textarea.selectionEnd = start + cursorOffset;
      }
    }, 0);
  };
  
  const handleUndo = () => {
    if (editHistory.past.length === 0) return;
    
    const previous = editHistory.past[editHistory.past.length - 1];
    setEditHistory({
      past: editHistory.past.slice(0, -1),
      future: [content, ...editHistory.future]
    });
    
    setContent(previous);
    onChange(previous);
  };
  
  const handleRedo = () => {
    if (editHistory.future.length === 0) return;
    
    const next = editHistory.future[0];
    setEditHistory({
      past: [...editHistory.past, content],
      future: editHistory.future.slice(1)
    });
    
    setContent(next);
    onChange(next);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (readOnly) return;
      
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      
      // Bold: Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertFormatting('bold');
      }
      
      // Italic: Ctrl/Cmd + I
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertFormatting('italic');
      }
      
      // Fullscreen: F11 or Ctrl/Cmd + Shift + F
      if (e.key === 'F11' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f')) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, editHistory, readOnly]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFullscreen ? 'fullscreen' : 'normal'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`editor-container ${className || ''} ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : 'relative'} 
                  ${isFocusMode ? 'focus-mode' : ''}`}
      >
        {!readOnly && (
          <div className={`editor-toolbar ${isFocusMode ? 'opacity-0 hover:opacity-80' : 'opacity-100'} 
                          transition-opacity duration-200 bg-background/95 backdrop-blur-sm 
                          border border-border/30 rounded-md p-1.5 mb-3 flex flex-wrap items-center gap-1 overflow-x-auto
                          sticky top-0 z-10`}>
            <div className="flex items-center gap-1 border-r border-border/20 pr-2 mr-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('bold')}
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Bold (Ctrl+B)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('italic')}
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Italic (Ctrl+I)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('underline')}
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Underline</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-1 border-r border-border/20 pr-2 mr-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('h1')}
                    >
                      <Heading1 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Heading 1</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('h2')}
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Heading 2</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-1 border-r border-border/20 pr-2 mr-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('ul')}
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Bullet List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('ol')}
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Numbered List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('quote')}
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Blockquote</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('code')}
                    >
                      <Code className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Inline Code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-1 border-r border-border/20 pr-2 mr-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('link')}
                    >
                      <Link className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Insert Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting('image')}
                    >
                      <Image className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Insert Image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-1 mr-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleUndo}
                      disabled={editHistory.past.length === 0}
                    >
                      <Undo className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleRedo}
                      disabled={editHistory.future.length === 0}
                    >
                      <Redo className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Redo (Ctrl+Shift+Z)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-1 ml-auto">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={toggleFocusMode}
                    >
                      {isFocusMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
        
        <div className={`editor-content-container ${isFullscreen ? 'h-[calc(100%-3rem)]' : ''}`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`
              w-full h-full min-h-[calc(60vh)] text-base leading-relaxed 
              ${isFullscreen ? 'min-h-full' : 'min-h-[350px]'}
              ${isFocusMode ? 'focus-mode-content' : ''}
              p-4 border rounded-md resize-none
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/20
              ${readOnly ? 'cursor-default bg-muted/10' : ''}
              font-serif
            `}
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              fontSize: '1.125rem',
              lineHeight: '1.75',
            }}
          />
        </div>
        
        {isFullscreen && (
          <div className="absolute bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity"></div>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="text-xs"
            ></Button>
              <Minimize2 className="h-3 w-3 mr-1" /> Exit Full Screen
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
