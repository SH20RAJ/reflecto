"use client";

import React, { useEffect, useState } from 'react';
import { EditorContent, EditorRoot, StarterKit, Placeholder, Command, handleCommandNavigation } from 'novel';
import { useDebouncedCallback } from 'use-debounce';

const NovelEditor = ({ initialValue = '', onChange, readOnly = false }) => {
  const [content, setContent] = useState(initialValue || '');

  // Update the editor when initialValue changes
  useEffect(() => {
    setContent(initialValue || '');
  }, [initialValue]);

  // Debounce the updates to prevent too many state changes
  const debouncedUpdates = useDebouncedCallback(({ editor }) => {
    const json = editor.getJSON();
    // For simplicity, we'll just use the text content for now
    const markdownContent = json?.content?.[0]?.content?.[0]?.text || '';

    if (onChange) {
      onChange(markdownContent);
    }
  }, 500);

  return (
    <div className="novel-editor-wrapper">
      <EditorRoot>
        <EditorContent
          initialContent={content ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] } : undefined}
          onUpdate={debouncedUpdates}
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
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full p-4"
            }
          }}
        />
      </EditorRoot>
    </div>
  );
};

export default NovelEditor;
