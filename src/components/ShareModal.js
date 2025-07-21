import React, { useState } from 'react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, onSend }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const teamMembers = [
    { name: 'John Smith', email: 'john.smith@company.com', dept: 'Engineering' },
    { name: 'Sarah Johnson', email: 'sarah.j@company.com', dept: 'Product Management' },
    { name: 'Michael Chen', email: 'michael.c@company.com', dept: 'Design' },
    { name: 'Emily Davis', email: 'emily.d@company.com', dept: 'Marketing' },
    { name: 'Alex Wong', email: 'alex.w@company.com', dept: 'Engineering' },
    { name: 'Jessica Miller', email: 'jessica.m@company.com', dept: 'Sales' },
    { name: 'David Taylor', email: 'david.t@company.com', dept: 'Operations' }
  ];

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

    const recipients = selectedUsers.map(index => teamMembers[index]);
    onSend(recipients);
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