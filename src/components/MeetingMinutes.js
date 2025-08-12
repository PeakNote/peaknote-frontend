import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './MeetingMinutes.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import MinutesToolbar from './MinutesToolbar';

const MeetingMinutes = ({ meetingData, onDownload, onShare }) => {
  const minutesRef = useRef(null);
  const [contentRef, setContentRef] = useState(null);

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

    const handleDownload = async () => {
    let downloadContainer = null;
    
    try {
      // Show download notification
      if (onDownload) onDownload();
      
      // Get current edited content
      const currentContent = getFormattedContent();
      
      // Validate content
      if (!currentContent || currentContent.trim().length === 0) {
        alert('No content available to download. Please ensure meeting notes are loaded.');
        return;
      }
      
      // Create hidden element specifically for download with improved styling (same as print)
      downloadContainer = document.createElement('div');
      downloadContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        background-color: #ffffff;
        color: #000000;
        padding: 40px;
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        box-sizing: border-box;
      `;
      
      // Add meeting minutes content with improved formatting (same as print)
      const meetingName = getNameFromUrl(meetingData.meetingUrl);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      downloadContainer.innerHTML = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px;">
          <h1 style="color: #2c3e50; margin-bottom: 15px; font-size: 28px; font-weight: bold; line-height: 1.2;">
            Meeting Summary: ${meetingName}
          </h1>
          <div style="color: #7f8c8d; font-size: 13px;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p>
            <p style="margin: 5px 0;"><strong>Template:</strong> ${meetingData.template?.charAt(0).toUpperCase() + meetingData.template?.slice(1)}</p>
            <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <div style="color: #2c3e50; font-size: 14px; line-height: 1.7;">
          ${currentContent}
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(downloadContainer);
      
      // Create download window with improved styling (same as print)
      const downloadWindow = window.open('', '_blank');
      downloadWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Meeting Minutes - Download</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Arial', 'Helvetica', sans-serif;
              background-color: #ffffff;
              color: #2c3e50;
              line-height: 1.6;
            }
            h1 {
              color: #2c3e50;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            h3 {
              color: #2c3e50;
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 15px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 8px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
              padding-left: 5px;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
              }
              h1 { page-break-after: avoid; }
              h3 { page-break-after: avoid; }
              li { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${downloadContainer.innerHTML}
        </body>
        </html>
      `);
      downloadWindow.document.close();
      
      // Wait for content to load before converting to PDF
      downloadWindow.onload = async () => {
        try {
          // Wait a bit for content to fully render
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Convert the window content to canvas
          const canvas = await html2canvas(downloadWindow.document.body, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            foreignObjectRendering: true,
            imageTimeout: 15000
          });

          // Create PDF
          const imgData = canvas.toDataURL('image/png', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          // Add first page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // Add additional pages if needed
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Generate filename
          const sanitizedName = meetingName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
          const fileName = `meeting-summary-${sanitizedName}-${new Date().toISOString().split('T')[0]}.pdf`;

          // Download PDF
          pdf.save(fileName);
          
          // Close the window
          downloadWindow.close();
          
          console.log(`PDF generated successfully: ${pdf.getNumberOfPages()} pages`);
          
        } catch (error) {
          console.error('Error generating PDF from window:', error);
          downloadWindow.close();
          alert('Failed to generate PDF. Please try again.');
        }
      };
      
      // Remove temporary element from DOM
      if (downloadContainer && downloadContainer.parentNode) {
        document.body.removeChild(downloadContainer);
      }
      
    } catch (error) {
      console.error('Error in download process:', error);
      
      // Clean up container if it exists
      if (downloadContainer && downloadContainer.parentNode) {
        document.body.removeChild(downloadContainer);
      }
      
      alert('Failed to download. Please try again.');
    }
  };

  const handlePrint = () => {
    let printContainer = null;
    
    try {
      // Get current edited content
      const currentContent = getFormattedContent();
      
      // Validate content
      if (!currentContent || currentContent.trim().length === 0) {
        alert('No content available to print. Please ensure meeting notes are loaded.');
        return;
      }
      
      // Create hidden element specifically for printing with improved styling
      printContainer = document.createElement('div');
      printContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        background-color: #ffffff;
        color: #000000;
        padding: 40px;
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        box-sizing: border-box;
      `;
      
      // Add meeting minutes content with improved formatting
      const meetingName = getNameFromUrl(meetingData.meetingUrl);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      printContainer.innerHTML = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px;">
          <h1 style="color: #2c3e50; margin-bottom: 15px; font-size: 28px; font-weight: bold; line-height: 1.2;">
            Meeting Summary: ${meetingName}
          </h1>
          <div style="color: #7f8c8d; font-size: 13px;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p>
            <p style="margin: 5px 0;"><strong>Template:</strong> ${meetingData.template?.charAt(0).toUpperCase() + meetingData.template?.slice(1)}</p>
            <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <div style="color: #2c3e50; font-size: 14px; line-height: 1.7;">
          ${currentContent}
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(printContainer);
      
      // Create print window with improved styling
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Meeting Minutes - Print</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Arial', 'Helvetica', sans-serif;
              background-color: #ffffff;
              color: #2c3e50;
              line-height: 1.6;
            }
            h1 {
              color: #2c3e50;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            h3 {
              color: #2c3e50;
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 15px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 8px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
              padding-left: 5px;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
              }
              h1 { page-break-after: avoid; }
              h3 { page-break-after: avoid; }
              li { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500); // Small delay to ensure content is fully rendered
      };
      
      // Remove temporary element from DOM
      if (printContainer && printContainer.parentNode) {
        document.body.removeChild(printContainer);
      }
      
    } catch (error) {
      console.error('Error printing:', error);
      
      // Clean up container if it exists
      if (printContainer && printContainer.parentNode) {
        document.body.removeChild(printContainer);
      }
      
      alert('Failed to print. Please try again. If the problem persists, try using the PDF download option instead.');
    }
  };

  // Text formatting functions
  const formatText = (formatType) => {
    if (!contentRef) return;
    
    // Ensure content area has focus
    contentRef.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const selectedText = selection.toString();
    
    if (!selectedText) {
      alert('Please select text to format first');
      return;
    }
    
    // Use document.execCommand to handle formatting
    // This better handles nested formatting
    let command = '';
    switch (formatType) {
      case 'bold':
        command = 'bold';
        break;
      case 'italic':
        command = 'italic';
        break;
      case 'underline':
        command = 'underline';
        break;
      default:
        return;
    }
    
    // Execute formatting command
    const result = document.execCommand(command, false, null);
    
    // Clear selection
    selection.removeAllRanges();
    
    // Debug info
    console.log(`Format command: ${command}, Result: ${result}`);
  };

  // Handle text selection
  const handleTextSelection = () => {
    // 文本选择处理，目前不需要额外操作
  };

  // Get formatted content
  const getFormattedContent = () => {
    if (!contentRef) {
      return generateContentForPDF();
    }
    
    // Get current edited HTML content
    let content = contentRef.innerHTML;
    
    // Clean some unwanted style attributes, preserve formatting tags
    content = content
      .replace(/style="[^"]*"/g, '') // Remove inline styles
      .replace(/class="[^"]*"/g, '') // Remove class attributes
      .replace(/data-[^=]*="[^"]*"/g, ''); // Remove data attributes
    
    return content;
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  const getNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname.includes('/')) {
        const parts = urlObj.pathname.split('/').filter(p => p);
        return parts[parts.length - 1].replace(/-/g, ' ');
      }
      return 'Teams Meeting';
    } catch(e) {
      return 'Teams Meeting';
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

    const generateContentForPDF = () => {
    const notes = meetingData.notes;
    if (!notes) return '<p style="color: #7f8c8d; font-style: italic;">No meeting notes available.</p>';
    
    // Handle transcript string from API
    if (typeof notes === 'object' && notes.transcript) {
      // Clean and format transcript for better PDF rendering (same as print)
      const cleanTranscript = notes.transcript
        .replace(/\n\n+/g, '</p><p>') // Convert double line breaks to paragraphs
        .replace(/\n/g, '<br>') // Convert single line breaks to <br>
        .replace(/^/, '<p>') // Start with paragraph
        .replace(/$/, '</p>'); // End with paragraph
      
      return `
        <div style="margin-top: 20px;">
          <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">
            Meeting Transcript
          </h3>
          <div style="color: #34495e; line-height: 1.8; text-align: justify;">
            ${cleanTranscript}
          </div>
        </div>
      `;
    }
    
    // Handle structured notes format (legacy)
    if (typeof notes === 'object' && (notes.agenda || notes.participants || notes.actionItems || notes.decisions)) {
      let content = '';
      
      if (notes.agenda && notes.agenda.length > 0) {
        content += `
          <div style="margin-top: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">
              Agenda
            </h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
          `;
          notes.agenda.forEach((item, index) => {
            content += `<li style="margin-bottom: 8px; padding-left: 5px;">${item}</li>`;
          });
          content += '</ul></div>';
      }
      
      if (notes.participants && notes.participants.length > 0) {
        content += `
          <div style="margin-top: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">
              Participants
            </h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
          `;
          notes.participants.forEach((participant, index) => {
            content += `<li style="margin-bottom: 8px; padding-left: 5px;">${participant}</li>`;
          });
          content += '</ul></div>';
      }
      
      if (notes.actionItems && notes.actionItems.length > 0) {
        content += `
          <div style="margin-top: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">
              Action Items
            </h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
          `;
          notes.actionItems.forEach((item, index) => {
            content += `<li style="margin-bottom: 8px; padding-left: 5px;">${item}</li>`;
          });
          content += '</ul></div>';
      }
      
      if (notes.decisions && notes.decisions.length > 0) {
        content += `
          <div style="margin-top: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">
              Decisions
            </h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
          `;
          notes.decisions.forEach((decision, index) => {
            content += `<li style="margin-bottom: 8px; padding-left: 5px;">${decision}</li>`;
          });
          content += '</ul></div>';
      }
      
      return content || '<p style="color: #7f8c8d; font-style: italic;">No meeting content available.</p>';
    }

    return '<p style="color: #7f8c8d; font-style: italic;">No meeting content available.</p>';
  };

  return (
    <div className="minutes-section" ref={minutesRef}>
      <MinutesToolbar
      onLeftIconClick={idx => {
        // 左侧按钮：文本格式化
        switch (idx) {
          case 0: // 加粗
            formatText('bold');
            break;
          case 1: // 斜体
            formatText('italic');
            break;
          case 2: // 下划线
            formatText('underline');
            break;
          default:
            break;
        }
      }}
      onRightIconClick={idx => {
        // 右侧按钮：分享、下载、打印
        if (idx === 0) {
          // 分享按钮
          handleShare();
        } else if (idx === 1) {
          // 下载按钮
          handleDownload();
        } else if (idx === 2) {
          // 打印按钮
          handlePrint();
        }
      }}
      />
      <div className="chat-bubble" style={{ animationDelay: '0.1s' }}>
        <div className="a4-paper">
          <div className="minutes-header">
            <h2>Meeting Summary: {getNameFromUrl(meetingData.meetingUrl)}</h2>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Template: <span>{meetingData.template?.charAt(0).toUpperCase() + meetingData.template?.slice(1)}</span></p>
          </div>
          <div 
            className="minutes-content" 
            ref={setContentRef}
            contentEditable={true}
            onSelect={handleTextSelection}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onFocus={() => console.log('Content area focused')}
            suppressContentEditableWarning={true}
            style={{ outline: 'none' }}
          >
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