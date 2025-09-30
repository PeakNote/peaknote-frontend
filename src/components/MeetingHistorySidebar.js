import React from 'react';
import './MeetingHistorySidebar.css';

const MeetingHistorySidebar = ({ 
  isOpen, 
  onToggle, 
  meetingList = [], 
  onSelectMeeting,
  onBackToCurrent,
  currentEventId,
  selectedMeetingId 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`history-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Hide meeting history' : 'Show meeting history'}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          {isOpen ? (
            // X icon when open
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            // Menu icon when closed
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`meeting-history-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Meeting History</h3>
          <p className="meeting-count">{Math.max(0, meetingList.length - 1)} meetings </p>
          {meetingList.length > 0 && (
            <button 
              className="current-meeting-btn"
              onClick={onBackToCurrent}
              title="Go back to current meeting"
            >
              Current Meeting
            </button>
          )}
        </div>
        
        <div className="meeting-list">
          {meetingList.length === 0 ? (
            <div className="empty-state">
              <p>No meeting history</p>
            </div>
          ) : (
            meetingList.slice(1).map((meeting, index) => (
              <div 
                key={meeting.eventId}
                className={`meeting-item ${selectedMeetingId === meeting.eventId ? 'active' : ''}`}
                onClick={() => onSelectMeeting(meeting)}
              >
                <div className="meeting-content">
                  <h4 className="meeting-title">
                    {meeting.topic || `Meeting ${index + 1}`}
                  </h4>
                  <div className="meeting-time">
                    <span className="date">{formatDate(meeting.startTime)}</span>
                    <span className="duration">
                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </span>
                  </div>
                </div>
                {selectedMeetingId === meeting.eventId && (
                  <div className="active-indicator">
                    <div className="active-dot"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </>
  );
};

export default MeetingHistorySidebar;
