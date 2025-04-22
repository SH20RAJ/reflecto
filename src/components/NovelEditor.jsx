"use client";

import React, { useEffect, useState } from 'react';
import { EditorContent, EditorRoot, useEditor, StarterKit, Placeholder, Command } from 'novel';

const NovelEditor = ({ initialValue = '', onChange, readOnly = false }) => {
  const [content, setContent] = useState(initialValue || '');

  // Update the editor when initialValue changes
  useEffect(() => {
    setContent(initialValue || '');
  }, [initialValue]);

  const handleChange = (value) => {
    // Novel editor returns JSON, but we want to store markdown
    // For simplicity, we'll just use the text content for now
    const markdownContent = value?.content || '';

    if (onChange) {
      onChange(markdownContent);
    }
  };

  return (
    <div className="novel-editor-wrapper">
      <EditorRoot>
        <EditorContent
          initialContent={content ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] } : undefined}
          onUpdate={({ editor }) => {
            const json = editor.getJSON();
            handleChange(json);
          }}
          className="min-h-[300px] border rounded-md"
          editable={!readOnly}
          extensions={[
            StarterKit,
            Placeholder.configure({
              placeholder: 'Write something...',
            }),
            Command.configure({
              suggestion: {
                char: '/',
              },
            }),
          ]}
          editorProps={{
            attributes: {
              class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none p-4"
            }
          }}
        />
      </EditorRoot>
    </div>
  );
};

export default NovelEditor;
