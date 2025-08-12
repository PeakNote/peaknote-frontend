import React, { useState, useEffect } from 'react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, onSend, meetingData }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

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

  const handleSend = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

     // 获取选中的收件人邮箱
  const selectedEmails = selectedUsers
  .map(index => teamMembers[index].email)
  .join(',');

  // 构建邮件内容
  const subject = encodeURIComponent('PeakNote Meeting Summary');
  const body = encodeURIComponent(`
  Dear Team,

  Please find attached the meeting summary from our recent discussion.

  Meeting Details:
  - Meeting URL: ${meetingData?.meetingUrl || 'N/A'}
  - Generated: ${new Date().toLocaleString()}

  Note: The PDF file has been downloaded to your device. Please attach it to this email.

  Best regards,
  PeakNote Team
  `.trim());

  // 构建 mailto 链接并打开邮件客户端
  const mailtoLink = `mailto:${selectedEmails}?subject=${subject}&body=${body}`;
  window.open(mailtoLink, '_blank');

  // 显示成功消息
  alert('Email client opened! Please attach the PDF file manually.');

  // 关闭模态框
  onClose();
  setSelectedUsers([]);
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