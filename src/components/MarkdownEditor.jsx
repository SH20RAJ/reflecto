"use client";

import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

const MarkdownEditor = ({ initialValue = '', onChange, readOnly = false }) => {
  const [value, setValue] = useState(initialValue || '');

  // Update the editor when initialValue changes
  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleChange = (newValue) => {
    setValue(newValue || '');
    if (onChange) {
      onChange(newValue || '');
    }
  };

  return (
    <div className="markdown-editor" data-color-mode="light">
      {readOnly ? (
        <div className="markdown-preview border rounded-md p-4">
          <MDEditor.Markdown 
            source={value} 
            rehypePlugins={[[rehypeSanitize]]} 
          />
        </div>
      ) : (
        <MDEditor
          value={value}
          onChange={handleChange}
          preview="edit"
          height={300}
          visibleDragbar={false}
          hideToolbar={false}
          enableScroll={true}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
