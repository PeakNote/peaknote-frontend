import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './MeetingMinutes.css';

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

  const generateContent = () => {
    const notes = meetingData.notes;
    if (!notes) return <p>No meeting notes available.</p>;
    
    // Handle transcript string from API
    if (typeof notes === 'object' && notes.transcript) {
      return (
        <div>
          <div className="markdown-content">
            <ReactMarkdown>{notes.transcript}</ReactMarkdown>
          </div>
        </div>
      );
    }
    
    // Handle structured notes format (legacy)
    if (typeof notes === 'object' && (notes.agenda || notes.participants || notes.actionItems || notes.decisions)) {
      return (
        <>
          <h3>Agenda</h3>
          <ul>
            {notes.agenda?.map((item, index) => (
              <li key={index}>{item}</li>
            )) || <li>No agenda items</li>}
          </ul>
          
          <h3>Participants</h3>
          <ul>
            {notes.participants?.map((participant, index) => (
              <li key={index}>{participant}</li>
            )) || <li>No participants listed</li>}
          </ul>
          
          <h3>Action Items</h3>
          <ul>
            {notes.actionItems?.map((item, index) => (
              <li key={index}>{item}</li>
            )) || <li>No action items</li>}
          </ul>
          
          <h3>Decisions</h3>
          <ul>
            {notes.decisions?.map((decision, index) => (
              <li key={index}>{decision}</li>
            )) || <li>No decisions recorded</li>}
          </ul>
        </>
      );
    }

    return <p>No meeting content available.</p>;
  };

  return (
    <div className="minutes-section" ref={minutesRef}>
      <MinutesToolbar
      onLeftIconClick={idx => { /* 这里可以写左侧图标点击逻辑 */ }}
      onRightIconClick={idx => { 
        console.log('Right icon clicked, index:', idx); // 添加调试信息
        if (idx === 0) { // 分享图标（第一个右侧图标）
          console.log('Share icon clicked, calling handleShare'); // 添加调试信息
          handleShare();
          // onShare();
       }
       // 可以添加其他右侧图标的处理
      }}
      />
      <div className="chat-bubble" style={{ animationDelay: '0.1s' }}>
        <div className="a4-paper"> 
          <div className="minutes-content">
            {generateContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingMinutes;