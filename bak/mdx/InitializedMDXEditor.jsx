'use client';

import React from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  toolbarPlugin,
  UndoButton,
  RedoButton,
  BoldButton,
  ItalicButton,
  LinkButton,
  HeadingButton,
  BlockquoteButton,
  ListsButton,
  MarkdownButton
} from '@mdxeditor/editor';

// This component is only imported dynamically to ensure it's never server-rendered
export default function InitializedMDXEditor({
  markdown, 
  onChange, 
  readOnly, 
  placeholder
}) {
  return (
    <MDXEditor
      markdown={markdown}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      contentEditableClassName={`prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 ${
        readOnly ? 'cursor-default pointer-events-none' : ''
      }`}
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <>
              {!readOnly && (
                <>
                  <UndoButton />
                  <RedoButton />
                  <BoldButton />
                  <ItalicButton />
                  <LinkButton />
                  <HeadingButton />
                  <BlockquoteButton />
                  <ListsButton />
                  <MarkdownButton />
                </>
              )}
            </>
          ),
        }),
        listsPlugin(),
        quotePlugin(),
        headingsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
      ]}
    />
  );
}
