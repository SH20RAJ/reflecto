"use client";

import React from "react";
import EnhancedTextEditor from "./EnhancedTextEditor";

export default function NovelEditor({
  onChange,
  initialValue = "",
  readOnly = false,
}) {
  // This is a wrapper around our simplified text editor
  // for backward compatibility
  return (
    <EnhancedTextEditor
      initialValue={initialValue}
      onChange={onChange}
      readOnly={readOnly}
      placeholder="Write your thoughts here..."
      className="w-full"
    />
  );
}
