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

  const handleImageUpload = async (file) => {
    try {
      // Show a loading toast
      const loadingToast = toast.loading('Uploading image...');

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);

      // In a real implementation, you would upload the file to your server or a storage service
      // For now, we'll simulate a delay and return a data URL
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create a data URL for the image (this is just for demo purposes)
      // In a real app, you would return the URL from your server
      const reader = new FileReader();

      const url = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      // Dismiss the loading toast and show a success toast
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully');

      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
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
        handleImageUpload={handleImageUpload}
        // Additional extensions can be added here if needed
        extensions={[]}
      />
    </div>
  );
}