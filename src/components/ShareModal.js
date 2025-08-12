import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, onSend, meetingData }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); 

  const teamMembers = [
    { name: 'RZ Gao', email: 'gaorz866999@gmail.com', dept: 'Engineering' },
    { name: 'John Smith', email: 'john.smith@company.com', dept: 'Engineering' },
    { name: 'Sarah Johnson', email: 'sarah.j@company.com', dept: 'Product Management' },
    { name: 'Michael Chen', email: 'michael.c@company.com', dept: 'Design' },
    { name: 'Emily Davis', email: 'emily.d@company.com', dept: 'Marketing' },
    { name: 'Alex Wong', email: 'alex.w@company.com', dept: 'Engineering' },
    { name: 'Jessica Miller', email: 'jessica.m@company.com', dept: 'Sales' },
    { name: 'David Taylor', email: 'david.t@company.com', dept: 'Operations' }
  ];

  // 控制背景滚动
  useEffect(() => {
    if (isOpen) {
      // 模态框打开时，阻止背景滚动
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      console.log('Modal opened, background scroll disabled'); // 调试信息
    } else {
      // 模态框关闭时，恢复背景滚动
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      console.log('Modal closed, background scroll enabled'); // 调试信息
    }

    // 清理函数
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      console.log('Cleanup: background scroll restored'); // 调试信息
    };
  }, [isOpen]);


  const toggleUserSelection = (index) => {
    setSelectedUsers(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // 生成PDF函数
  const generatePDF = async () => {
    try {
      // 获取 .a4-paper 元素
      const element = document.querySelector('.a4-paper');
      
      if (!element) {
        throw new Error('Meeting content not found. Please generate meeting data first.');
      }

      // 临时隐藏不需要的元素
      const originalDisplay = element.style.display;
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.zIndex = '-1';

      // 使用改进的 html2canvas 配置
      const canvas = await html2canvas(element, {
        scale: 3, // 更高的清晰度
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        foreignObjectRendering: false,
        removeContainer: true,
        logging: false
      });

      // 恢复元素样式
      element.style.display = originalDisplay;
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      element.style.zIndex = '';

      // 创建高质量PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 宽度 (mm)
      const pageHeight = 297; // A4 高度 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容超过一页，添加后续页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  // 下载PDF函数
  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const pdf = await generatePDF();
      
      // 生成文件名
      const fileName = `PeakNote-Meeting-Summary-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // 下载PDF
      pdf.save(fileName);
      
      return fileName;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating PDF: ' + error.message);
      throw error;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    try {
      // 1. 先生成并下载PDF
      const fileName = await downloadPDF();
      
      // 2. 获取选中的收件人邮箱
      const selectedEmails = selectedUsers
        .map(index => teamMembers[index].email)
        .join(',');

      // 3. 构建邮件内容
      const subject = encodeURIComponent('PeakNote Meeting Summary');
      const body = encodeURIComponent(`
Dear Team,

Please find attached the meeting summary from our recent discussion.

Meeting Details:
- Meeting URL: ${meetingData?.meetingUrl || 'N/A'}
- Generated: ${new Date().toLocaleString()}

Note: The PDF file "${fileName}" has been downloaded to your device. Please attach it to this email.

Best regards,
PeakNote Team
      `.trim());

      // 4. 构建 mailto 链接并打开邮件客户端
      const mailtoLink = `mailto:${selectedEmails}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');
      
      // 5. 显示成功消息
      alert(`PDF "${fileName}" downloaded! Email client opened. Please attach the PDF file.`);
      
      // 6. 关闭模态框
      onClose();
      setSelectedUsers([]);
      
    } catch (error) {
      console.error('Error in handleSend:', error);
      alert('Error: ' + error.message);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share Meeting Minutes</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="text-white mb-3">Select recipients to share the meeting minutes via Outlook:</p>
            <div className="user-list">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={`user-item ${selectedUsers.includes(index) ? 'selected' : ''}`}
                  onClick={() => toggleUserSelection(index)}
                >
                  <div className="user-avatar">{getInitials(member.name)}</div>
                  <div className="user-info">
                    <div className="user-name">{member.name}</div>
                    <div className="user-email">{member.email}</div>
                    <small>{member.dept}</small>
                  </div>
                  <input
                    type="checkbox"
                    className="user-checkbox"
                    checked={selectedUsers.includes(index)}
                    onChange={() => toggleUserSelection(index)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" id="send-btn" onClick={handleSend}>
              Send to Selected
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default ShareModal;