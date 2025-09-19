import React from 'react';
import { SimpleEditor as TiptapSimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import './SimpleEditor.css';

const SimpleEditor = ({ content, onChange, className = '' }) => {
  // 添加一些调试信息
  React.useEffect(() => {
    console.log('SimpleEditor mounted with content:', content);
  }, [content]);

  return (
    <div className={`simple-editor-container ${className}`}>
      <TiptapSimpleEditor 
        content={content}
        onChange={onChange}
      />
    </div>
  );
};

export default SimpleEditor;