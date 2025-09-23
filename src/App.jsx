import React, { useState } from 'react';
import './App.css';
import MeetingForm from './components/MeetingForm';
import MeetingMinutes from './components/MeetingMinutes';
import ShareModal from './components/ShareModal';
import SuccessAnimation from './components/SuccessAnimation';
import Pattern from './components/Pattern.jsx';
import SimpleEditor from './components/SimpleEditor.jsx';
import MeetingHistorySidebar from './components/MeetingHistorySidebar'; 

function App() {
  const [meetingData, setMeetingData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [editorContent, setEditorContent] = useState(null);
  
  // Meeting History Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [meetingList, setMeetingList] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Typing animation messages
  const staticMessage = 'AI-Driven Meeting Assistant';

  const handleMeetingSubmit = (data) => {
    setMeetingData(data);
    
    // Extract meeting list from the API response if available
    if (data.meetingList) {
      setMeetingList(data.meetingList);
    }
    
    // Set current event ID from the API response
    if (data.currentEventId) {
      setCurrentEventId(data.currentEventId);
    } else if (data.meetingList && data.meetingList.length > 0) {
      // Fallback to first meeting if no current event ID is provided
      setCurrentEventId(data.meetingList[0].eventId);
    }
  };

  const handleShare = () => {
    console.log('App.jsx: handleShare called'); // 添加调试信息
    setShowShareModal(true);
  };

  const handleShareSend = (recipients) => {
    setShowShareModal(false);
    setShowSuccessAnimation(true);

    // Show confirmation after animation
    setTimeout(() => {
      const recipientNames = recipients.map(r => r.name).join(', ');
      alert(`Meeting minutes sent to Outlook for: ${recipientNames}`);
    }, 3200);
  };

  const handleSuccessComplete = () => {
    setShowSuccessAnimation(false);
  };

  // Sidebar handlers
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectMeeting = (meeting) => {
    setCurrentEventId(meeting.eventId);
    // TODO: 这里将来会向后端发送eventID请求对应的会议记录
    console.log('Selected meeting:', meeting);
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Meeting History Sidebar */}
      <MeetingHistorySidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        meetingList={meetingList}
        onSelectMeeting={handleSelectMeeting}
        currentEventId={currentEventId}
      />
      
      {/* Particles background */}
      <div className="background-video-wrapper">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="background-video"
          src="/background.mp4"
        />
      </div>
      
      <div className="container text-center">
        {/* Header */}
        <div className="logo">
          <h1 className="bounce-in">
            <span className="text-gradient">PEAKNOTE</span>
          </h1>
          <div className="typing-container">
            <p className="lead">
              {staticMessage}
            </p>
          </div>
        </div>
        
        {/* Meeting Form */}
        <MeetingForm onSubmit={handleMeetingSubmit} />

        {/* Meeting Minutes */}
        {meetingData && (
          <div style={{ margin: '2rem 0' }}>
          <SimpleEditor 
            content={editorContent} 
            onChange={(content) => setEditorContent(content)}
            meetingData={meetingData}
          />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="copyright-footer">
        <p><Pattern size={20} />  PeakNote   Inc.</p>
      </footer>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSend={handleShareSend}
        meetingData={meetingData}
      />

      {/* Success Animation */}
      <SuccessAnimation 
        isVisible={showSuccessAnimation}
        onComplete={handleSuccessComplete}
      />
    </div>
  );
}

export default App;