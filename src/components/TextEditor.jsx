import React, { useState } from 'react'
import { Editor } from "novel-lightweight";

export  function TextEditor() {
    const [data, setData] = useState("");
  
    return (
      <Editor
        defaultValue={data}
        disableLocalStorage={true}
        onUpdate={(editor) => {
          setData(editor?.storage.markdown.getMarkdown());
        }}
        handleImageUpload={async (file) => {
          // This is a placeholder for image upload functionality
          // In a real app, you would implement file upload to a storage service
          console.log("Image upload requested:", file.name);
  
          // Return a placeholder URL
          return URL.createObjectURL(file);
        }}
      />
    );
  }
  