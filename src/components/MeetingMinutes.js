import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './MeetingMinutes.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import MinutesToolbar from './MinutesToolbar';

const MeetingMinutes = ({ meetingData, onDownload, onShare }) => {
  const minutesRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
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
    try {
      // 显示下载提示
      onDownload();
      
      // 获取当前编辑后的内容
      const currentContent = getFormattedContent();
      
      // 创建专门用于PDF的隐藏元素
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      pdfContainer.style.width = '800px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.color = '#000000';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.fontSize = '14px';
      pdfContainer.style.lineHeight = '1.6';
      
      // 添加会议纪要内容（包含用户编辑的格式化）
      pdfContainer.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="color: #000000; margin-bottom: 10px; font-size: 24px;">Meeting Summary: ${getNameFromUrl(meetingData.meetingUrl)}</h1>
          <p style="color: #666666; margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
          <p style="color: #666666; margin: 5px 0;">Template: ${meetingData.template?.charAt(0).toUpperCase() + meetingData.template?.slice(1)}</p>
        </div>
        <div style="color: #000000;">
          ${currentContent}
        </div>
      `;
      
      // 添加到DOM
      document.body.appendChild(pdfContainer);
      
      // 使用html2canvas将元素转换为canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2, // 提高分辨率
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: pdfContainer.scrollHeight
      });

      // 从DOM中移除临时元素
      document.body.removeChild(pdfContainer);

      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // 计算PDF尺寸
      const imgWidth = 210; // A4宽度
      const pageHeight = 295; // A4高度
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容超过一页，添加新页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 生成文件名
      const meetingName = getNameFromUrl(meetingData.meetingUrl);
      const fileName = `meeting-minutes-${meetingName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      // 下载PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    try {
      // 获取当前编辑后的内容
      const currentContent = getFormattedContent();
      
      // 创建专门用于打印的隐藏元素
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '-9999px';
      printContainer.style.width = '800px';
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.color = '#000000';
      printContainer.style.padding = '40px';
      printContainer.style.fontFamily = 'Arial, sans-serif';
      printContainer.style.fontSize = '14px';
      printContainer.style.lineHeight = '1.6';
      
      // 添加会议纪要内容（包含用户编辑的格式化）
      printContainer.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="color: #000000; margin-bottom: 10px; font-size: 24px;">Meeting Summary: ${getNameFromUrl(meetingData.meetingUrl)}</h1>
          <p style="color: #666666; margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
          <p style="color: #666666; margin: 5px 0;">Template: ${meetingData.template?.charAt(0).toUpperCase() + meetingData.template?.slice(1)}</p>
        </div>
        <div style="color: #000000;">
          ${currentContent}
        </div>
      `;
      
      // 添加到DOM
      document.body.appendChild(printContainer);
      
      // 创建打印窗口
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
              font-family: Arial, sans-serif;
              background-color: #ffffff;
              color: #000000;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      
      // 等待内容加载完成后打印
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      // 从DOM中移除临时元素
      document.body.removeChild(printContainer);
      
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to print. Please try again.');
    }
  };

  // 文本格式化函数
  const formatText = (formatType) => {
    if (!contentRef) return;
    
    // 确保内容区域有焦点
    contentRef.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    if (!selectedText) {
      alert('请先选择要格式化的文本');
      return;
    }
    
    // 使用 document.execCommand 来处理格式化
    // 这样可以更好地处理嵌套格式
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
    
    // 执行格式化命令
    const result = document.execCommand(command, false, null);
    
    // 清除选择
    selection.removeAllRanges();
    
    // 调试信息
    console.log(`Format command: ${command}, Result: ${result}`);
  };

  // 处理文本选择
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    setSelectedText(selectedText);
  };

  // 获取格式化后的内容
  const getFormattedContent = () => {
    if (!contentRef) {
      return generateContentForPDF();
    }
    
    // 获取当前编辑后的HTML内容
    let content = contentRef.innerHTML;
    
    // 清理一些不需要的样式属性，保留格式化标签
    content = content
      .replace(/style="[^"]*"/g, '') // 移除内联样式
      .replace(/class="[^"]*"/g, '') // 移除class属性
      .replace(/data-[^=]*="[^"]*"/g, ''); // 移除data属性
    
    return content;
  };

  const handleShare = () => {
    onShare();
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
          <h3>Meeting Transcript</h3>
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
    if (!notes) return '<p>No meeting notes available.</p>';
    
    // Handle transcript string from API
    if (typeof notes === 'object' && notes.transcript) {
      return `
        <h3 style="color: #000000; margin-top: 20px; margin-bottom: 10px; font-size: 18px;">Meeting Transcript</h3>
        <div style="color: #000000; line-height: 1.6;">
          ${notes.transcript.replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // Handle structured notes format (legacy)
    if (typeof notes === 'object' && (notes.agenda || notes.participants || notes.actionItems || notes.decisions)) {
      let content = '';
      
      if (notes.agenda && notes.agenda.length > 0) {
        content += '<h3 style="color: #000000; margin-top: 20px; margin-bottom: 10px; font-size: 18px;">Agenda</h3><ul style="color: #000000;">';
        notes.agenda.forEach(item => {
          content += `<li style="margin-bottom: 5px;">${item}</li>`;
        });
        content += '</ul>';
      }
      
      if (notes.participants && notes.participants.length > 0) {
        content += '<h3 style="color: #000000; margin-top: 20px; margin-bottom: 10px; font-size: 18px;">Participants</h3><ul style="color: #000000;">';
        notes.participants.forEach(participant => {
          content += `<li style="margin-bottom: 5px;">${participant}</li>`;
        });
        content += '</ul>';
      }
      
      if (notes.actionItems && notes.actionItems.length > 0) {
        content += '<h3 style="color: #000000; margin-top: 20px; margin-bottom: 10px; font-size: 18px;">Action Items</h3><ul style="color: #000000;">';
        notes.actionItems.forEach(item => {
          content += `<li style="margin-bottom: 5px;">${item}</li>`;
        });
        content += '</ul>';
      }
      
      if (notes.decisions && notes.decisions.length > 0) {
        content += '<h3 style="color: #000000; margin-top: 20px; margin-bottom: 10px; font-size: 18px;">Decisions</h3><ul style="color: #000000;">';
        notes.decisions.forEach(decision => {
          content += `<li style="margin-bottom: 5px;">${decision}</li>`;
        });
        content += '</ul>';
      }
      
      return content || '<p>No meeting content available.</p>';
    }

    return '<p>No meeting content available.</p>';
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
    </div>
  );
};

export default MeetingMinutes;