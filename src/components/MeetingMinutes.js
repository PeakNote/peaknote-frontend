import React, { useEffect, useRef } from 'react';
import './MeetingMinutes.css';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

import MinutesToolbar from './MinutesToolbar';

const MeetingMinutes = ({ meetingData, onShare }) => {
  const minutesRef = useRef(null);

  useEffect(() => {
    if (minutesRef.current) {
      minutesRef.current.classList.add('show');
      minutesRef.current.scrollIntoView({ behavior: 'smooth' });

      // Add paper reveal animation
      const paper = minutesRef.current.querySelector('.a4-paper');
      if (paper) {
        paper.classList.add('paper-reveal');
      }

      // Animate content elements
      setTimeout(() => {
        const paragraphs = minutesRef.current.querySelectorAll('.minutes-content p, .minutes-content h3, .minutes-content ul');
        paragraphs.forEach((p, index) => {
          p.classList.add('chat-bubble');
          p.style.animationDelay = (0.8 + index * 0.1) + 's';
        });
      }, 700);
    }
  }, [meetingData]);

  const handleShare = () => {
    console.log('handleShare called'); // 添加调试信息
    console.log('onShare:', onShare); // 检查 onShare 的值
  
    if (onShare && typeof onShare === 'function') {
      console.log('Calling onShare function'); // 添加调试信息
      onShare();
    } else {
      console.error('onShare is not available:', onShare);
      alert('Share function not available. onShare:', onShare);
    }
  };


  return (
    <div className="minutes-section" ref={minutesRef}>
      <MinutesToolbar
      onLeftIconClick={idx => { /* 这里可以写左侧图标点击逻辑 */ }}
      onRightIconClick={idx => { 
        console.log('Right icon clicked, index:', idx);
        if (idx === 0) {
          console.log('Share icon clicked, calling handleShare');
          handleShare();
       }
      }}
      />
      <div className="chat-bubble editor-container" style={{ animationDelay: '0.1s' }}>
        <div className="tiptap-editor-wrapper">
          <SimpleEditor key={meetingData?.notes ? 'with-data' : 'no-data'} />
        </div>
      </div>
    </div>
  );
};

export default MeetingMinutes;