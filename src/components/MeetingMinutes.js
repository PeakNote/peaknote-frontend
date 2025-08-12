import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './MeetingMinutes.css';

import MinutesToolbar from './MinutesToolbar';

const MeetingMinutes = ({ meetingData, onDownload, onShare }) => {
  const minutesRef = useRef(null);
  const canvasRef = useRef(null);
  const [textAlign, setTextAlign] = useState('left');
  const [operationHistory, setOperationHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(0.8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [drawingHistoryIndex, setDrawingHistoryIndex] = useState(-1);

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

  // Initialize canvas when component mounts
  useEffect(() => {
    setTimeout(() => {
      initializeCanvas();
    }, 100);
  }, [meetingData]); // 只在 meetingData 变化时初始化

  // Additional effect to ensure canvas is properly sized
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        initializeCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      // Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) - 撤销
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (isDrawingMode) {
          undoDrawing();
        } else {
          undoOperation();
        }
      }
      // Ctrl+Y (Windows/Linux) or Cmd+Y (Mac) - 重做
      if ((event.ctrlKey || event.metaKey) && event.key === 'y' && !event.shiftKey) {
        event.preventDefault();
        if (isDrawingMode) {
          redoDrawing();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyIndex, operationHistory, isDrawingMode, drawingHistoryIndex, drawingHistory]);

  // Drawing mode toggle
  const toggleDrawingMode = () => {
    console.log('toggleDrawingMode called, current state:', isDrawingMode); // Debug log
    setIsDrawingMode(!isDrawingMode);
    if (!isDrawingMode) {
      // Entering drawing mode
      console.log('Entering drawing mode'); // Debug log
    } else {
      console.log('Exiting drawing mode'); // Debug log
    }
    
    // Debug: 检查画布状态
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        console.log('Canvas visibility:', canvas.style.display, canvas.style.visibility);
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Canvas class:', canvas.className);
      }
    }, 100);
  };

  // Left Align & Center Align & Header Levels & Bullet List & Code Block & Drawing Mode
  const handleLeftIconClick = (idx) => {
    console.log('Icon clicked:', idx); // Debug log
    
    if (idx === 5) { // the 5th button - Bullet List (index 5)
      saveStateBeforeOperation(); // save state before operation
      applyBulletList();
    } else if (idx === 7) { // the 6th button - H1 title (index 7)
      saveStateBeforeOperation(); // save state before operation
      applyHeaderLevel('h1');
    } else if (idx === 8) { // the 7th button - H2 title (index 8)
      saveStateBeforeOperation(); // save state before operation
      applyHeaderLevel('h2');
    } else if (idx === 9) { // the 8th button - H3 title (index 9)
      saveStateBeforeOperation(); // save state before operation
      applyHeaderLevel('h3');
    } else if (idx === 14) { // Icon 11 - Pencil/Drawing Mode (index 14)
      console.log('Pencil icon clicked!'); // Debug log
      toggleDrawingMode();
    } else if (idx === 11) { // Icon 11 Left Align (index 11)
      setTextAlign('left');
    } else if (idx === 12) { // Icon 12 Center Align (index 12)
      setTextAlign('center');
    } else if (idx === 15) { // Icon 15 Code Block (index 15)
      saveStateBeforeOperation(); // save state before operation
      applyCodeBlock();
    }
  };



  // apply code block
  const applyCodeBlock = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      
      try {
        // check if the selected content is already in a code block
        let existingCodeBlock = null;
        let textContent = '';
        
        // check if the starting node is in a code block element
        let node = range.startContainer;
        while (node && node !== document) {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.tagName === 'PRE' || node.classList?.contains('custom-code-block'))) {
            existingCodeBlock = node;
            break;
          }
          node = node.parentNode;
        }
        
        // get the selected text
        textContent = range.toString().trim();
        
        if (textContent) {
          // create new code block
          const preElement = document.createElement('pre');
          preElement.className = 'custom-code-block';
          
          const codeElement = document.createElement('code');
          codeElement.textContent = textContent;
          preElement.appendChild(codeElement);
          
          if (existingCodeBlock) {
            // if already in a code block, replace the code block
            existingCodeBlock.parentNode.replaceChild(preElement, existingCodeBlock);
          } else {
            // replace selected content with new code block
            range.deleteContents();
            range.insertNode(preElement);
          }
          
          // clear selection
          selection.removeAllRanges();
        } else {
          alert('Please select valid text content first');
        }
      } catch (e) {
        console.error('Error applying code block:', e);
        alert('Cannot apply code block format, please try again');
      }
    } else {
      alert('Please select the text to be converted to code block first');
    }
  };

  // apply bullet list
  const applyBulletList = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      
      try {
        // check if the selected content is already in a list
        let existingList = null;
        let textContent = '';
        
        // check if the starting node is in a list element
        let node = range.startContainer;
        while (node && node !== document) {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.tagName === 'UL' || node.tagName === 'OL')) {
            existingList = node;
            break;
          }
          node = node.parentNode;
        }
        
        // get the selected text
        textContent = range.toString().trim();
        
        if (textContent) {
          // split text by lines to create multiple list items
          const lines = textContent.split('\n').filter(line => line.trim());
          
          if (lines.length > 0) {
            // create new unordered list
            const ulElement = document.createElement('ul');
            ulElement.className = 'custom-bullet-list';
            
            // create list items for each line
            lines.forEach(line => {
              if (line.trim()) {
                const liElement = document.createElement('li');
                liElement.textContent = line.trim();
                ulElement.appendChild(liElement);
              }
            });
            
            if (existingList) {
              // if already in a list, replace the list
              existingList.parentNode.replaceChild(ulElement, existingList);
            } else {
              // replace selected content with new list
              range.deleteContents();
              range.insertNode(ulElement);
            }
            
            // clear selection
            selection.removeAllRanges();
          } else {
            alert('Please select valid text content first');
          }
        } else {
          alert('Please select valid text content first');
        }
      } catch (e) {
        console.error('Error applying bullet list:', e);
        alert('Cannot apply bullet list format, please try again');
      }
    } else {
      alert('Please select the text to be converted to bullet list first');
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

  // Initialize canvas for drawing
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      // 设置画布尺寸
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Set canvas styles for ballpoint pen effect
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = drawingColor;
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  };

  // Drawing event handlers
  const startDrawing = (e) => {
    if (!isDrawingMode) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      setIsDrawing(true);
      setLastX(x);
      setLastY(y);
    }
  };

  const draw = (e) => {
    if (!isDrawingMode || !isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // 圆珠笔效果：连续细线条
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = drawingColor;
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.stroke();
      
      setLastX(x);
      setLastY(y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // 保存当前画布状态到历史记录
    saveDrawingState();
  };

  // 保存画布状态
  const saveDrawingState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      setDrawingHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, drawingHistoryIndex + 1);
        const updatedHistory = [...newHistory, imageData];
        // 限制历史记录数量，避免内存问题
        return updatedHistory.slice(-20);
      });
      setDrawingHistoryIndex(prevIndex => Math.min(prevIndex + 1, 19));
    }
  };

  // 撤销绘画操作
  const undoDrawing = () => {
    if (drawingHistoryIndex > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = drawingHistory[drawingHistoryIndex - 1];
        setDrawingHistoryIndex(prevIndex => prevIndex - 1);
      }
    } else if (drawingHistoryIndex === 0) {
      // 撤销到空白画布
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setDrawingHistoryIndex(-1);
      }
    }
  };

  // 重做绘画操作
  const redoDrawing = () => {
    if (drawingHistoryIndex < drawingHistory.length - 1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = drawingHistory[drawingHistoryIndex + 1];
        setDrawingHistoryIndex(prevIndex => prevIndex + 1);
      }
    }
  };

  // Color picker for drawing
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setDrawingColor(newColor);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = newColor;
    }
  };

  // Brush size picker for drawing
  const handleBrushSizeChange = (e) => {
    const newSize = parseFloat(e.target.value);
    setBrushSize(newSize);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = newSize;
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 保存清除后的状态到历史记录
      saveDrawingState();
    }
  };



  return (
    <div className="minutes-section" ref={minutesRef}>
      <MinutesToolbar
      onLeftIconClick={handleLeftIconClick}
      onRightIconClick={idx => { /* 这里可以写右侧图标点击逻辑 */ }}
      isDrawingMode={isDrawingMode}
      />
      
      {/* Drawing Controls */}
      {isDrawingMode && (
        <div className="drawing-controls">
          <div className="drawing-control-group">
            <label>Color:</label>
            <input 
              type="color" 
              value={drawingColor} 
              onChange={handleColorChange}
              className="color-picker"
            />
          </div>
          <div className="drawing-control-group">
            <label>Brush Size:</label>
            <input 
              type="range" 
              min="0.3" 
              max="5.0" 
              step="0.1"
              value={brushSize} 
              onChange={handleBrushSizeChange}
              className="brush-size-slider"
            />
            <span>{brushSize.toFixed(1)}px</span>
          </div>
          <button onClick={clearCanvas} className="clear-canvas-btn">
            Clear Canvas
          </button>
        </div>
      )}
      
      <div className="chat-bubble" style={{ animationDelay: '0.1s' }}>
        <div className={`a4-paper text-align-${textAlign}`} style={{ position: 'relative' }}> 
          <div className="minutes-content" style={{ outline: 'none' }}>
            {generateContent()}
          </div>
          
          {/* Drawing Canvas */}
          <canvas
            ref={canvasRef}
            className={`drawing-canvas ${isDrawingMode ? 'drawing-active' : 'drawing-inactive'}`}
            onMouseDown={isDrawingMode ? startDrawing : undefined}
            onMouseMove={isDrawingMode ? draw : undefined}
            onMouseUp={isDrawingMode ? stopDrawing : undefined}
            onMouseLeave={isDrawingMode ? stopDrawing : undefined}
            onTouchStart={isDrawingMode ? (e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const canvas = canvasRef.current;
              if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (touch.clientX - rect.left) * scaleX;
                const y = (touch.clientY - rect.top) * scaleY;
                
                setIsDrawing(true);
                setLastX(x);
                setLastY(y);
              }
            } : undefined}
            onTouchMove={isDrawingMode ? (e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const canvas = canvasRef.current;
              if (canvas && isDrawing) {
                const ctx = canvas.getContext('2d');
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (touch.clientX - rect.left) * scaleX;
                const y = (touch.clientY - rect.top) * scaleY;
            
            // 圆珠笔效果：连续细线条
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 1.0;
            ctx.shadowColor = drawingColor;
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
                
                setLastX(x);
                setLastY(y);
              }
            } : undefined}
            onTouchEnd={isDrawingMode ? (e) => {
              e.preventDefault();
              stopDrawing();
            } : undefined}
          />
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