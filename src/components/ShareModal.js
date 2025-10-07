import { useState, useEffect, useCallback } from 'react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, meetingData }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState(null);

  // 获取会议参与者
  const fetchAttendees = useCallback(async () => {
    // 检查是否有eventId - 修复：从正确的路径获取eventId
    const eventId = meetingData?.currentEventId;
    // 添加详细的调试信息
    console.log('=== 调试 meetingData ===');
    console.log('meetingData:', meetingData);
    console.log('meetingData.currentEventId:', meetingData?.currentEventId);
    console.log('eventId 类型:', typeof eventId);
    console.log('eventId 长度:', eventId ? eventId.length : 'undefined');
    console.log('=== 调试结束 ===');


    if (!eventId) {
      setAttendeesError('No event ID available. Please generate meeting summary first.');
      setIsLoadingAttendees(false);
      return;
    }


    try {
      setIsLoadingAttendees(true);
      setAttendeesError(null);

      console.log('Using eventId from meeting data:', eventId);
      console.log('Full API URL:', `https://api.peak-note.com/attendees?eventId=${eventId}`);
      // console.log('Full API URL:', `https://4dd3f18734a3.ngrok-free.app/attendees?eventId=${eventId}`);


      // 调用参与者API
      const response = await fetch(`https://api.peak-note.com/attendees?eventId=${eventId}`, {
      // const response = await fetch(`https://4dd3f18734a3.ngrok-free.app/attendees?eventId=${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 显示response的详细信息
      console.log('=== Response 详细信息 ===');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      console.log('Response url:', response.url);
      console.log('Response type:', response.type);
      console.log('Response redirected:', response.redirected);
      console.log('Response bodyUsed:', response.bodyUsed);

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.attendees && Array.isArray(data.attendees)) {
        setAttendees(data.attendees);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching attendees:', error);
      let errorMessage = 'Failed to load attendees';
      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error. Please check server configuration.';
        } else {
          errorMessage = `Failed to load attendees: ${error.message}`;
        }
      }

      setAttendeesError(errorMessage);

      // 如果API失败，不显示任何参与者
      setAttendees([]);
    } finally {
      setIsLoadingAttendees(false);
    }
  }, [meetingData]);

  // 控制背景滚动
  useEffect(() => {
    if (isOpen) {
      // 模态框打开时，阻止背景滚动
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      fetchAttendees();// 获取参与者信息
    } else {
      // 模态框关闭时，恢复背景滚动
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      setSelectedUsers([]); // 重置选择
      setAttendeesError(null); // 清除错误
    }

    // 清理函数
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, fetchAttendees]);


  const toggleUserSelection = (index) => {
    setSelectedUsers(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // 添加全选/取消全选功能
  const toggleSelectAll = () => {
    if (selectedUsers.length === attendees.length) {
      // 如果全部已选中，则取消全选
      setSelectedUsers([]);
    } else {
      // 否则全选
      setSelectedUsers(attendees.map((_, index) => index));
    }
  };

  // 检查是否全选
  const isAllSelected = attendees.length > 0 && selectedUsers.length === attendees.length;

  const handleSend = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    // 获取选中的收件人邮箱
    const selectedEmails = selectedUsers.map(index => attendees[index].email);

    console.log('选中的邮箱列表：', selectedEmails);

    // 构建邮件内容
    const subject = encodeURIComponent('PeakNote Meeting Summary');
    const body = encodeURIComponent(`
Dear Team,

Please find attached the meeting summary from our recent discussion.

Meeting Details:
- Meeting URL: ${meetingData?.meetingUrl || 'N/A'}
- Generated: ${new Date().toLocaleString()}




Best regards,
PeakNote Team
`.trim());

    // 构建 mailto 链接并打开邮件客户端
    const mailtoLink = `mailto:${selectedEmails.join(',')}?subject=${subject}&body=${body}`;
    console.log('生成的 mailto 链接：', mailtoLink);

    window.open(mailtoLink, '_blank');

    // 显示成功消息
    alert('Email client opened! Please attach the PDF file manually.');
    console.log('The email client has been opened, and the user needs to manually attach the PDF file.');

    // 关闭模态框
    onClose();
    setSelectedUsers([]);
  };

  const getInitials = (name) => {
    // 添加安全检查
    if (!name || typeof name !== 'string') {
      return '?'; // 返回默认字符
    }
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
            <p className="text-white mb-3">Select recipients to share the meeting minutes via email:</p>

            {/* 全选按钮 */}
            {attendees.length > 0 && (
              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={toggleSelectAll}
                  style={{ fontSize: '12px' }}
                >
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}

            {/* 加载状态 */}
            {isLoadingAttendees && (
              <div className="text-center text-white mb-3">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading meeting attendees...
              </div>
            )}

            {/* 错误信息 */}
            {attendeesError && (
              <div className="alert alert-warning mb-3">
                <strong>Warning:</strong> {attendeesError}
                <br />
                <small>No attendees available for this meeting.</small>
              </div>
            )}

            {/* 参与者列表 */}
            <div className="user-list">
              {attendees.map((attendee, index) => (
                <div
                  key={index}
                  className={`user-item ${selectedUsers.includes(index) ? 'selected' : ''}`}
                  onClick={() => toggleUserSelection(index)}
                >
                  <div className="user-avatar">{getInitials(attendee.displayName || attendee.name)}</div>
                  <div className="user-info">
                    <div className="user-name">{attendee.displayName || attendee.name || 'Unknown Name'}</div>
                    <div className="user-email">{attendee.email || 'No email'}</div>
                    <small>{attendee.dept || ''}</small>
                  </div>
                  <input
                    type="checkbox"
                    className="user-checkbox"
                    checked={selectedUsers.includes(index)}
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                    }}
                    onChange={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      toggleUserSelection(index);
                    }}
                    style={{
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: 1000
                    }}
                  />
                </div>
              ))}
            </div>
            {/* 无参与者时的提示 */}
            {!isLoadingAttendees && attendees.length === 0 && !attendeesError && (
              <div className="text-center text-white">
                <p>No attendees found for this meeting.</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {/* <button type="button" className="btn btn-primary" id="send-btn" onClick={handleSend} disabled={isGeneratingPDF}>
              Send to Selected
            </button> */}
            <button type="button" className="btn btn-primary" id="send-btn" onClick={handleSend} disabled={isLoadingAttendees || attendees.length === 0}>
              Open Email Client
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default ShareModal;