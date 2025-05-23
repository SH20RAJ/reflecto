'use client';

import React, { useState, useEffect } from 'react';

/**
 * Simple Text Editor Component with Markdown Support
 * A lightweight textarea-based editor that avoids the issues with MDX editor
 */
export default function EnhancedTextEditor({
  initialValue = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing...',
  className = '',
}) {
  const [content, setContent] = useState(initialValue);
  
  // Update content when initialValue changes
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };

  return (
    <div className={`editor-container ${className || ''}`}>
      <textarea
        value={content}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[300px] ${
          readOnly ? 'cursor-default bg-gray-50' : ''
        }`}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}
