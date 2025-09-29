import React, { useState } from 'react';
import { SimpleEditor as TiptapSimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import ShareModal from './ShareModal';
import './SimpleEditor.css';

const SimpleEditor = ({ content, onChange, className = '', meetingData, onShareClick }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  // 添加一些调试信息
  React.useEffect(() => {
    console.log('SimpleEditor mounted');
  }, []);

  const handleShareClick = () => {
    console.log('Share button clicked in SimpleEditor');
    setShowShareModal(true);
  };

  return (
    <div className={`simple-editor-container ${className}`}>
      <TiptapSimpleEditor 
        content={content}
        onChange={onChange}
        meetingData={meetingData} 
        onShareClick={handleShareClick}
      />
      
      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSend={() => setShowShareModal(false)}
        meetingData={meetingData}
      />
    </div>
  );
};

export default SimpleEditor;