'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from "novel-lightweight";
import { toast } from 'sonner';

export default function TextEditor({
  initialValue = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing...',
  className = '',
  disableLocalStorage = true,
  storageKey = 'reflecto-editor-content',
}) {
  const [content, setContent] = useState(initialValue);

  // Update content when initialValue changes (e.g., when loading a notebook)
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleUpdate = (editor) => {
    if (editor) {
      const markdown = editor.storage.markdown.getMarkdown();
      setContent(markdown);
      onChange(markdown);
    }
  };

  const handleDebouncedUpdate = (editor) => {
    if (editor && !readOnly) {
      // This function is called after the debounce period
      // Good place to implement auto-save functionality
      console.log('Content debounced update:', editor.storage.markdown.getMarkdown().substring(0, 50) + '...');
    }
  };

  

  return (
    <div className={`editor-container ${className}`}>
      <Editor
        defaultValue={content}
        onUpdate={handleUpdate}
        onDebouncedUpdate={handleDebouncedUpdate}
        debounceDuration={1000}
        disableLocalStorage={disableLocalStorage}
        storageKey={storageKey}
        readOnly={readOnly}
        className={`min-h-[300px] border-none focus:outline-none ${readOnly ? 'cursor-default' : ''}`}
        editorProps={{
          attributes: {
            class: `prose prose-lg max-w-none focus:outline-none ${readOnly ? 'pointer-events-none' : ''}`,
            spellcheck: 'false',
            'data-gramm': 'false',
            placeholder: placeholder,
          },
        }}
        handleImageUpload={async (file) => {
          try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Failed to upload image');
            }

            return data.url;
          } catch (error) {
            console.error('Image upload error:', error);
            return null;
          }
        }}        // Additional extensions can be added here if needed
        extensions={[]}
      />
    </div>
  );
}