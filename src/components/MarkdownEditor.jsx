"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

const MarkdownEditor = ({ initialValue = '', onChange, readOnly = false }) => {
  const [value, setValue] = useState(initialValue || '');

  // Update the editor when initialValue changes
  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="markdown-editor">
      {readOnly ? (
        <div className="markdown-preview prose prose-slate max-w-none dark:prose-invert">
          <MDEditor.Markdown
            source={value}
            rehypePlugins={[[rehypeSanitize]]}
          />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder="Start writing in markdown..."
          className="min-h-[300px] font-mono text-sm resize-y p-4 focus-visible:ring-1 focus-visible:ring-primary"
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
