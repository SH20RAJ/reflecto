"use client";

import React, { useState, useEffect } from "react";

export default function NovelEditor({
  onChange,
  initialValue = "",
  readOnly = false,
}) {
  const [data, setData] = useState(initialValue);

  // Update data when initialValue changes
  useEffect(() => {
    setData(initialValue);
  }, [initialValue]);

  // Handle textarea changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    setData(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`novel-editor-wrapper ${readOnly ? 'view-mode' : 'edit-mode'}`}>
      {readOnly ? (
        <div className="prose prose-lg dark:prose-invert max-w-full p-4 whitespace-pre-wrap">
          {data.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < data.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <textarea
          value={data}
          onChange={handleChange}
          className={`w-full min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono`}
          disabled={readOnly}
          placeholder="Write something..."
        />
      )}
    </div>
  );
}