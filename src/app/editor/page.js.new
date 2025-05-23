'use client';

import React, { useState } from 'react';
import TextEditor from '@/components/TextEditor';

export default function Page() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Markdown Editor</h1>
      <EditorComponent />
    </div>
  )
}

function EditorComponent() {
  const [data, setData] = useState("");

  const handleChange = (value) => {
    setData(value);
    console.log('Content updated:', value.substring(0, 50) + '...');
  };

  return (
    <TextEditor
      initialValue={data}
      onChange={handleChange}
    />
  );
}
