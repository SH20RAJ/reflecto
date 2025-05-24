// "use client";

// import React, { useCallback, useMemo, useState } from 'react';
// import { createEditor } from 'slate';
// import { Slate, Editable, withReact } from 'slate-react';

// // Yoopta core
// import YooptaEditorCore, { createYooptaEditor } from '@yoopta/editor';

// // Plugins
// import Paragraph from '@yoopta/paragraph';
// import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
// import Blockquote from '@yoopta/blockquote';
// import { BulletedList, NumberedList } from '@yoopta/lists';
// import Code from '@yoopta/code';
// import { Bold, Italic, Underline, Strike } from '@yoopta/marks';
// import LinkTool from '@yoopta/link-tool';

// // UI components
// import { DefaultActionMenuRender } from '@yoopta/action-menu-list';
// import Toolbar from '@yoopta/toolbar';

// const YooptaEditor = ({ initialValue, onChange, readOnly = false }) => {
//   // Create and memoize the editor instance
//   const editor = useMemo(() => {
//     const baseEditor = withReact(createEditor());
//     return createYooptaEditor(baseEditor);
//   }, []);
  
//   // Define the plugins
//   const plugins = useMemo(
//     () => [
//       Paragraph,
//       HeadingOne,
//       HeadingTwo,
//       HeadingThree,
//       Blockquote,
//       BulletedList,
//       NumberedList,
//       Code,
//       Bold,
//       Italic,
//       Underline,
//       Strike,
//       LinkTool,
//     ],
//     []
//   );
  
//   // Convert initialValue to Yoopta format if needed
//   const initialContent = useMemo(() => {
//     if (!initialValue || initialValue.length === 0) {
//       return [
//         {
//           type: 'paragraph',
//           children: [{ text: '' }],
//         },
//       ];
//     }
    
//     // If initialValue is a string, try to parse it as JSON
//     if (typeof initialValue === 'string') {
//       try {
//         const parsed = JSON.parse(initialValue);
        
//         // Check if it's already in Slate/Yoopta format
//         if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
//           return parsed;
//         }
        
//         // If it's Editor.js format, convert it
//         if (parsed.blocks && Array.isArray(parsed.blocks)) {
//           return parsed.blocks.map(block => {
//             switch (block.type) {
//               case 'paragraph':
//                 return {
//                   type: 'paragraph',
//                   children: [{ text: block.data.text || '' }],
//                 };
//               case 'header':
//                 return {
//                   type: 'heading',
//                   level: block.data.level || 2,
//                   children: [{ text: block.data.text || '' }],
//                 };
//               case 'list':
//                 return {
//                   type: block.data.style === 'ordered' ? 'numbered-list' : 'bulleted-list',
//                   children: block.data.items.map(item => ({
//                     type: 'list-item',
//                     children: [{ text: item || '' }],
//                   })),
//                 };
//               case 'quote':
//                 return {
//                   type: 'blockquote',
//                   children: [{ text: block.data.text || '' }],
//                 };
//               case 'code':
//                 return {
//                   type: 'code',
//                   language: block.data.language || 'javascript',
//                   children: [{ text: block.data.code || '' }],
//                 };
//               default:
//                 return {
//                   type: 'paragraph',
//                   children: [{ text: JSON.stringify(block.data) || '' }],
//                 };
//             }
//           });
//         }
//       } catch (e) {
//         // If parsing fails, create a paragraph with the content
//         return [
//           {
//             type: 'paragraph',
//             children: [{ text: initialValue }],
//           },
//         ];
//       }
//     }
    
//     // If it's already an array, assume it's in the correct format
//     if (Array.isArray(initialValue)) {
//       return initialValue;
//     }
    
//     // Default empty paragraph
//     return [
//       {
//         type: 'paragraph',
//         children: [{ text: '' }],
//       },
//     ];
//   }, [initialValue]);
  
//   // Handle content change
//   const handleChange = useCallback(
//     (value, options) => {
//       // Save the value to the parent component
//       if (onChange) {
//         onChange(value);
//       }
//     },
//     [onChange]
//   );
  
//   return (
//     <div className="yoopta-editor rounded-md min-h-[200px]">
//       <YooptaEditorCore 
//         editor={editor} 
//         plugins={plugins} 
//         value={initialContent}
//         onChange={handleChange}
//         readOnly={readOnly}
//         placeholder="Start typing..."
//         className="outline-none p-4 border rounded-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
//       >
//         {!readOnly && (
//           <>
//             <Toolbar plugins={plugins} />
//             <DefaultActionMenuRender plugins={plugins} />
//           </>
//         )}
//       </YooptaEditorCore>
//     </div>
//   );
// };

// export default YooptaEditor;
