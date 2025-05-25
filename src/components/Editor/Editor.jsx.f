'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import YooptaEditor, {
  createYooptaEditor,
  Elements,
  Blocks,
  useYooptaEditor,
  YooptaContentValue,
  YooptaOnChangeOptions,
} from '@yoopta/editor';

import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import { Bold, Italic, Underline, Strike, CodeMark } from '@yoopta/marks';
import Code from '@yoopta/code';
import Link from '@yoopta/link';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  BulletedList,
  NumberedList,
  TodoList,
  Code,
  Link,
  Table,
  Divider
];

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

const MARKS = [Bold, Italic, Underline, Strike, CodeMark];

const defaultContent = [{
  type: 'paragraph',
  children: [{ text: '' }]
}];

function Editor({ initialContent = null, onChange: onChangeProp = () => {}, readOnly = false }) {
  const [value, setValue] = useState(defaultContent);
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef(null);

  // Update editor value when initialContent changes
  useEffect(() => {
    if (initialContent) {
      let parsedContent;
      if (typeof initialContent === 'string') {
        try {
          // Try parsing as JSON first
          parsedContent = JSON.parse(initialContent);
        } catch (e) {
          // If not JSON, create a paragraph with the content
          parsedContent = [{
            type: 'paragraph',
            children: [{ text: initialContent }]
          }];
        }
      } else if (Array.isArray(initialContent)) {
        parsedContent = initialContent;
      }
      
      if (parsedContent) {
        setValue(parsedContent);
      }
    }
  }, [initialContent]);

  const handleChange = (newValue, options) => {
    setValue(newValue);
    onChangeProp(newValue);
  };

  return (
    <div className="w-full h-full flex justify-center" ref={selectionRef}>
      <YooptaEditor
        style={{ width: '100%', height: '100%' }}
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        marks={MARKS}
        selectionBoxRoot={selectionRef}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        autoFocus={!readOnly}
      />
    </div>
  );
}

export default Editor;