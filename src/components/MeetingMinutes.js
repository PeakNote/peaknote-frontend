import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './MeetingMinutes.css';

import MinutesToolbar from './MinutesToolbar';

const MeetingMinutes = ({ meetingData, onDownload, onShare }) => {
  const minutesRef = useRef(null);
  const [textAlign, setTextAlign] = useState('left'); // Defualt Left Align

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

  // const handleDownload = () => {
  //   onDownload();
  //   alert('Downloading meeting minutes as PDF...');
  // };

  // const handleShare = () => {
  //   onShare();
  // };

  // const getNameFromUrl = (url) => {
  //   try {
  //     const urlObj = new URL(url);
  //     if (urlObj.pathname.includes('/')) {
  //       const parts = urlObj.pathname.split('/').filter(p => p);
  //       return parts[parts.length - 1].replace(/-/g, ' ');
  //     }
  //     return 'Teams Meeting';
  //   } catch(e) {
  //     return 'Teams Meeting';
  //   }
  // };

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

  // Left Align & Center Align
  const handleLeftIconClick = (idx) => {
    if (idx === 11) { //  Icon 9  Left Align
      setTextAlign('left');
    } else if (idx === 12) { // Icon 10 Center Align
      setTextAlign('center');
    }
  };

  return (
    <div className="minutes-section" ref={minutesRef}>
      <MinutesToolbar
      onLeftIconClick={handleLeftIconClick}
      onRightIconClick={idx => { /* 这里可以写右侧图标点击逻辑 */ }}
      />
      <div className="chat-bubble" style={{ animationDelay: '0.1s' }}>
        <div className={`a4-paper text-align-${textAlign}`}> 
          <div className="minutes-content">
            {generateContent()}
          </div>
        </div>
      </div>
      
      {/*
      <div className="action-buttons chat-bubble" style={{ animationDelay: '0.3s' }}>
        <div className="tab-buttons">
          <button className="tab-button" onClick={handleDownload}>
            <span><i className="fas fa-download"></i> Download</span>
          </button>
          <button className="tab-button" onClick={handleShare}>
            <span><i className="fas fa-share-alt"></i> Share</span>
          </button>
        </div>
      </div>
      */}
    </div>
  );
};

export default MeetingMinutes;