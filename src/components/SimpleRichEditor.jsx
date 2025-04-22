"use client";

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code 
} from 'lucide-react';

const SimpleRichEditor = ({ initialValue = '', onChange, readOnly = false }) => {
  const [content, setContent] = useState(initialValue);
  
  const handleChange = useCallback((e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [onChange]);
  
  const execCommand = useCallback((command, value = null) => {
    if (readOnly) return;
    document.execCommand(command, false, value);
  }, [readOnly]);
  
  return (
    <div className="w-full">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 mb-2 p-2 border rounded-md bg-muted/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('formatBlock', '<h2>')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('formatBlock', '<pre>')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Card className="overflow-hidden">
        <div
          className="p-4 min-h-[200px] focus:outline-none prose prose-sm max-w-none"
          contentEditable={!readOnly}
          onInput={handleChange}
          dangerouslySetInnerHTML={{ __html: content }}
          suppressContentEditableWarning={true}
        />
      </Card>
    </div>
  );
};

export default SimpleRichEditor;
