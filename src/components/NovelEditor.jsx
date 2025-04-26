"use client";

import React from "react";
import TextEditor from "./TextEditor";

export default function NovelEditor({
  onChange,
  initialValue = "",
  readOnly = false,
}) {
  // This is now just a wrapper around our TextEditor component
  // for backward compatibility
  return (
    <TextEditor
      initialValue={initialValue}
      onChange={onChange}
      readOnly={readOnly}
      placeholder="Write your thoughts here..."
      className="w-full"
      disableLocalStorage={true}
      storageKey={`reflecto-notebook-${Date.now()}`}
    />
  );
}