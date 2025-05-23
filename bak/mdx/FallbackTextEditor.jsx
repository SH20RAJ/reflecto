'use client';

import React, { useState, useEffect } from 'react';

// A simple fallback editor using a plain textarea when MDX editor fails
export default function FallbackTextEditor({
  value = '',
  onChange = () => {},
  readOnly = false,
  placeholder = 'Start writing...',
  className = '',
}) {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };

  return (
    <div className={`fallback-editor ${className || ''}`}>
      <div className="p-2 mb-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
        The rich editor couldn't be loaded. Using a simple text editor instead.
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full h-80 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}
