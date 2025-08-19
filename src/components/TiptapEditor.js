import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './TiptapEditor.css';

const TiptapEditor = ({ 
  content = '', 
  editable = true, 
  onUpdate = null,
  placeholder = 'Start typing...',
  className = ''
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit extensions
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      if (onUpdate && typeof onUpdate === 'function') {
        const html = editor.getHTML();
        onUpdate(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        'data-placeholder': placeholder,
      },
    },
  });

  // Update content when prop changes - handles HTML content from backend
  React.useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      // Set HTML content directly in Tiptap editor
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Update editable state when prop changes
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return (
      <div className={`tiptap-editor-loading ${className}`}>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
};

// Default props are handled in the function parameters above

export default TiptapEditor;