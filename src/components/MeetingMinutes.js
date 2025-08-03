import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './MeetingMinutes.css';

import MinutesToolbar from './MinutesToolbar';

const MeetingMinutes = ({ meetingData, onDownload, onShare }) => {
  const minutesRef = useRef(null);
  const [textAlign, setTextAlign] = useState('left');
  const [operationHistory, setOperationHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
        <div className="markdown-content" contentEditable={true} suppressContentEditableWarning={true}>
          <ReactMarkdown>{notes.transcript}</ReactMarkdown>
        </div>
      );
    }
    
    // Handle structured notes format (legacy)
    if (typeof notes === 'object' && (notes.agenda || notes.participants || notes.actionItems || notes.decisions)) {
      return (
        <div contentEditable={true} suppressContentEditableWarning={true}>
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
        </div>
      );
    }

    return <p>No meeting content available.</p>;
  };

  // save state before operation
  const saveToHistory = () => {
    const contentElement = document.querySelector('.minutes-content');
    if (contentElement) {
      const currentContent = contentElement.innerHTML;
      
      // only save new state (if different from the last state)
      setOperationHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== currentContent) {
          const updatedHistory = [...newHistory, currentContent];
          // limit history record number, avoid memory problem
          return updatedHistory.slice(-20);
        }
        return newHistory;
      });
      
      setHistoryIndex(prevIndex => {
        const newHistory = operationHistory.slice(0, prevIndex + 1);
        if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== currentContent) {
          return Math.min(prevIndex + 1, 19); // max 20 states
        }
        return prevIndex;
      });
    }
  };

  // save state before operation
  const saveStateBeforeOperation = () => {
    const contentElement = document.querySelector('.minutes-content');
    if (contentElement) {
      const currentContent = contentElement.innerHTML;
      
      setOperationHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        const updatedHistory = [...newHistory, currentContent];
        return updatedHistory.slice(-20);
      });
      
      setHistoryIndex(prevIndex => Math.min(prevIndex + 1, 19));
    }
  };

  // undo operation
  const undoOperation = () => {
    if (historyIndex >= 0) {
      const contentElement = document.querySelector('.minutes-content');
      if (contentElement && operationHistory[historyIndex]) {
        contentElement.innerHTML = operationHistory[historyIndex];
        setHistoryIndex(historyIndex - 1);
      }
    }
  };

  // listen to keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoOperation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyIndex, operationHistory]);

  // Left Align & Center Align & Header Levels
  const handleLeftIconClick = (idx) => {
    if (idx === 7) { // the 6th button - H1 title (index 7)
      saveStateBeforeOperation(); // save state before operation
      applyHeaderLevel('h1');
    } else if (idx === 8) { // the 7th button - H2 title (index 8)
      saveStateBeforeOperation(); // save state before operation
      applyHeaderLevel('h2');
    } else if (idx === 9) { // the 8th button - H3 title (index 9)
      saveStateBeforeOperation(); // save state before operation
      applyHeaderLevel('h3');
    } else if (idx === 11) { // Icon 9  Left Align (index 11)
      setTextAlign('left');
    } else if (idx === 12) { // Icon 10 Center Align (index 12)
      setTextAlign('center');
    }
  };

  // apply header level
  const applyHeaderLevel = (headerType) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      
      try {
        // check if the selected content is in an existing header element
        let existingHeader = null;
        let textContent = '';
        
        // check if the starting node of the selected content is in the header element
        let node = range.startContainer;
        while (node && node !== document) {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.classList && 
              node.classList.contains('custom-header')) {
            existingHeader = node;
            textContent = node.textContent.trim(); // get the text content of the whole header
            break;
          }
          node = node.parentNode;
        }
        
        // if no existing header found, use the selected text
        if (!existingHeader) {
          textContent = range.toString().trim();
        }
        
        if (textContent) {
          // new header element
          const headerElement = document.createElement(headerType);
          headerElement.textContent = textContent;
          headerElement.className = `custom-header ${headerType}`;
          
          if (existingHeader) {
            // if it is an existing header, replace the whole header element
            existingHeader.parentNode.replaceChild(headerElement, existingHeader);
          } else {
            // if it is a normal text, replace the selected content
            range.deleteContents();
            range.insertNode(headerElement);
          }
          
          // clear selection
          selection.removeAllRanges();
        } else {
          alert('Please select valid text content first');
        }
      } catch (e) {
        console.error('Error applying header:', e);
        alert('Cannot apply header format, please try again');
      }
    } else {
      alert('Please select the text to be set as the title first');
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
          <div className="minutes-content" style={{ outline: 'none' }}>
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