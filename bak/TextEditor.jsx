'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@/styles/mdxeditor.css';

// Use dynamic import to avoid SSR issues with the editor
const MDXEditorComponent = dynamic(
  () => import('@mdxeditor/editor').then((mod) => {
    const { MDXEditor } = mod;
    const {
      headingsPlugin,
      listsPlugin,
      quotePlugin,
      thematicBreakPlugin,
      markdownShortcutPlugin,
      linkPlugin,
      imagePlugin,
      tablePlugin,
      codeBlockPlugin,
      frontmatterPlugin,
      directivePlugin,
      AdmonitionDirectiveDescriptor
    } = mod;

    return (props) => (
      <MDXEditor
        {...props}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          imagePlugin(),
          tablePlugin(),
          codeBlockPlugin(),
          frontmatterPlugin(),
          directivePlugin(AdmonitionDirectiveDescriptor),
          markdownShortcutPlugin()
        ]}
        contentEditableClassName="mdxeditor"
      />
    );
  }),
  {
    ssr: false,
    loading: () => <div className="p-4 border rounded-md">Loading editor...</div>
  }
);

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

  const handleChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className={`mdxeditor-container ${className}`}>
      <MDXEditorComponent
        markdown={content}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );
}
