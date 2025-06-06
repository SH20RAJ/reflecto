"use client";

import React from 'react';
import Editor from '@/components/Editor/Editor';
import '@/styles/editor.css';

export default function Notebook() {
  return (
    <div className="notebook-container w-full h-full min-h-[500px]">
      <Editor />
    </div>
  );
}
