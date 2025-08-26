import { SimpleEditor as TiptapSimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

const SimpleEditor = ({ content, onChange, className = '' }) => {
  return (
    <div className={`simple-editor-container ${className}`}>
      <TiptapSimpleEditor />
    </div>
  );
};

export default SimpleEditor;