"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Bold, Italic, Code, Heading1, Heading2, List, ListOrdered,
  Quote, Divide, Link as LinkIcon, Undo, Redo, Mic, MicOff,
  Moon, X, Type, Minimize2, Maximize2, Loader2, Image as ImageIcon, Video
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
  // Image and YouTube dialog states
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  
  // Image and YouTube preview states
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [youtubePreview, setYoutubePreview] = useState('');
  const [youtubeError, setYoutubeError] = useState('');
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [transcriptProcessing, setTranscriptProcessing] = useState(false);

  // Define all callback functions before using the editor
  const updateWordCount = useCallback((text) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  // Add image from URL with preview and validation
  const validateAndPreviewImage = useCallback((url) => {
    if (!url) {
      setImagePreview('');
      setImageError('');
      return;
    }

    setImageLoading(true);
    setImageError('');

    // Create a test image to see if the URL is valid
    const img = new Image();
    img.onload = () => {
      setImagePreview(url);
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageError('Could not load image from this URL');
      setImagePreview('');
      setImageLoading(false);
    };
    img.src = url;
  }, []);

  // Add YouTube video with validation
  const validateYoutubeUrl = useCallback((url) => {
    if (!url) {
      setYoutubePreview('');
      setYoutubeError('');
      return;
    }

    // Regular expressions for YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      // Valid YouTube URL
      setYoutubePreview(`https://www.youtube.com/embed/${match[2]}`);
      setYoutubeError('');
    } else {
      // Not a valid YouTube URL
      setYoutubeError('Please enter a valid YouTube URL');
      setYoutubePreview('');
    }
  }, []);
  
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
        inline: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-md overflow-hidden my-4',
        },
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
  
  // Toggle speech recognition - now defined after editor initialization
  const toggleSpeechRecognition = useCallback(() => {
    if (!isSpeechSupported) {
      // Could show a toast here to inform user
      console.warn('Speech recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      try {
        speechRecognition?.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      // Focus the editor before starting speech recognition
      editor?.commands.focus();
      
      try {
        speechRecognition?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        // If there's an error, likely because it's already running
        try {
          speechRecognition?.stop();
          setTimeout(() => {
            speechRecognition?.start();
            setIsListening(true);
          }, 300);
        } catch (innerError) {
          console.error('Failed to restart speech recognition:', innerError);
          setIsListening(false);
        }
      }
    }
  }, [isListening, speechRecognition, isSpeechSupported, editor]);

  useEffect(() => {
    setIsMounted(true);
    
    // Initialize speech recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
          // Vibrate if supported (mobile feedback)
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
          // Short vibration to indicate stopped recording
          if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
          }
        };
        
        let lastProcessedIndex = 0;
        
        recognition.onresult = (event) => {
          setTranscriptProcessing(true);
          
          // Get only the new results since last processing
          const results = Array.from(event.results);
          const newResults = results.slice(lastProcessedIndex);
          
          const isFinal = newResults.some(result => result.isFinal);
          
          // Process all transcripts
          const transcript = newResults
            .map(result => result[0].transcript)
            .join(' ');
          
          // Insert the transcript at the current cursor position
          if (editor && transcript) {
            // If we have final results, insert them with proper spacing
            if (isFinal) {
              // Check if we need to add punctuation or spacing
              let processedTranscript = transcript;
              
              // Add a space at the beginning if we're not at the start of a paragraph
              const currentPosition = editor.view.state.selection.$from;
              const isAtStart = currentPosition.parent.isTextblock && 
                               currentPosition.parent.nodeSize === 2;
              
              if (!isAtStart) {
                processedTranscript = ' ' + processedTranscript;
              }
              
              // Insert the content and focus back on the editor
              editor.commands.insertContent(processedTranscript);
              editor.commands.focus();
              
              // Update the last processed index
              lastProcessedIndex = results.length;
            }
          }
          
          // Finish processing after a slight delay
          setTimeout(() => setTranscriptProcessing(false), 300);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          // Show error toast or feedback here
          
          // Vibrate to indicate error
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100]);
          }
        };
        
        // Auto restart recognition if it stops unexpectedly
        recognition.onnomatch = () => {
          console.warn('No speech detected');
          if (isListening) {
            try {
              recognition.stop();
              setTimeout(() => {
                recognition.start();
              }, 300);
            } catch (e) {
              console.error('Failed to restart speech recognition', e);
            }
          }
        };
        
        setSpeechRecognition(recognition);
      } else {
        console.warn('Speech recognition not supported in this browser');
        setIsSpeechSupported(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor?.commands.setContent(initialContent);
      updateWordCount(editor.getText());
    }
  }, [initialContent, editor, updateWordCount]);

  useEffect(() => {
    validateAndPreviewImage(imageUrl);
  }, [imageUrl, validateAndPreviewImage]);

  useEffect(() => {
    validateYoutubeUrl(youtubeUrl);
  }, [youtubeUrl, validateYoutubeUrl]);

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

  // Add image from URL
  const addImageFromUrl = () => {
    if (imageUrl && editor && !imageError && !imageLoading) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      // Reset fields
      setImageUrl('');
      setImageAlt('');
      setImagePreview('');
      setShowImageDialog(false);
    }
  };
  
  // Add YouTube video
  const addYoutubeVideo = () => {
    if (youtubeUrl && editor && !youtubeError) {
      // Extract YouTube ID for tiptap YouTube extension
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = youtubeUrl.match(regExp);
      
      if (match && match[2].length === 11) {
        editor.chain().focus().setYoutubeVideo({ src: match[2] }).run();
        // Reset fields
        setYoutubeUrl('');
        setYoutubePreview('');
        setShowYoutubeDialog(false);
      }
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
      icon: <ImageIcon size={16} />,
      action: () => setShowImageDialog(true),
      tooltip: 'Insert Image'
    },
    {
      icon: <Video size={16} />,
      action: () => setShowYoutubeDialog(true),
      tooltip: 'Insert YouTube Video'
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
      icon: isListening ? <MicOff size={16} /> : <Mic size={16} />,
      action: toggleSpeechRecognition,
      isActive: isListening,
      disabled: !isSpeechSupported || transcriptProcessing,
      tooltip: isListening ? 'Stop Dictation' : 'Start Dictation'
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
        
        {/* Speech recognition active indicator */}
        {isListening && (
          <motion.div 
            className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-lg flex items-center gap-2 z-50"
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <motion.div 
              className="w-3 h-3 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium">Recording...</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSpeechRecognition} 
              className="h-6 w-6 p-0 hover:bg-primary-foreground/20 rounded-full ml-1"
            >
              <X size={14} />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Image URL Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="imageUrl" className="text-right text-sm font-medium col-span-1">
                Image URL
              </label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="imageAlt" className="text-right text-sm font-medium col-span-1">
                Alt Text
              </label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
                className="col-span-3"
              />
            </div>
            
            {/* Image preview area */}
            {imageUrl && (
              <div className="mt-2">
                {imageLoading && (
                  <div className="flex justify-center items-center p-4 border border-dashed rounded-md">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading preview...</span>
                  </div>
                )}
                
                {imageError && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">{imageError}</p>
                  </div>
                )}
                
                {imagePreview && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <div className="border p-2 rounded-md max-h-48 overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-40 object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addImageFromUrl} 
              disabled={!imageUrl || imageLoading || !!imageError}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* YouTube URL Dialog */}
      <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Insert YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="youtubeUrl" className="text-right text-sm font-medium col-span-1">
                YouTube URL
              </label>
              <Input
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
                className="col-span-3"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Paste any YouTube video URL (watch, share, or embed format)
            </p>
            
            {/* YouTube preview area */}
            {youtubeUrl && (
              <div className="mt-2">
                {youtubeError && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">{youtubeError}</p>
                  </div>
                )}
                
                {youtubePreview && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <div className="border rounded-md overflow-hidden">
                      <iframe
                        width="100%"
                        height="250"
                        src={youtubePreview}
                        title="YouTube Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYoutubeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addYoutubeVideo} 
              disabled={!youtubeUrl || !!youtubeError}
            >
              Insert Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fade overlay for focus mode */}
      {focusMode && (
        <>
          <div className="absolute inset-x-0 top-0 h-16 pointer-events-none bg-gradient-to-b from-background/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none bg-gradient-to-t from-background/80 to-transparent" />
        </>
      )}
      
      {/* Mobile floating microphone button */}
      {!readOnly && isSpeechSupported && (
        <motion.div 
          className="md:hidden fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="icon"
            variant={isListening ? "destructive" : "default"}
            onClick={toggleSpeechRecognition}
            className="h-12 w-12 rounded-full shadow-lg"
            disabled={transcriptProcessing}
          >
            {transcriptProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          {isListening && (
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
