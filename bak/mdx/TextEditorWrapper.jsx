'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@mdxeditor/editor/style.css';
import FallbackTextEditor from './FallbackTextEditor';

// Initial load state
const initialState = {
  loading: true,
  error: false,
  errorMessage: ''
};

// Dynamically import the MDX editor component to prevent SSR issues
const InitializedMDXEditor = dynamic(
  () => import('./InitializedMDXEditor'),
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
}) {
  const [content, setContent] = useState(initialValue);
  const [editorState, setEditorState] = useState(initialState);

  // Update content when initialValue changes
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  // Handle errors with MDX editor
  useEffect(() => {
    // After a short delay, mark the editor as loaded
    const timer = setTimeout(() => {
      setEditorState(prev => ({ ...prev, loading: false }));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // If there's an error with the MDX editor, fallback to the simple textarea
  if (editorState.error) {
    return (
      <FallbackTextEditor
        value={content}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  // Use the MDX editor if available
  return (
    <div className={`editor-container ${className || ''}`}>
      <InitializedMDXEditor
        markdown={content}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );
}
