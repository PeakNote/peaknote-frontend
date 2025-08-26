import React, { useState } from 'react';
import './App.css';
import MeetingForm from './components/MeetingForm';
import MeetingMinutes from './components/MeetingMinutes';
import ShareModal from './components/ShareModal';
import SuccessAnimation from './components/SuccessAnimation';
import Pattern from './components/Pattern'; 

function App() {
  const [meetingData, setMeetingData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Typing animation messages
  const staticMessage = 'AI-Driven Meeting Assistant';

  const handleMeetingSubmit = (data) => {
    setMeetingData(data);
    // Clear error state when successful, or set error state when data is null
    if (data === null) {
      setHasError(true);
    } else {
      setHasError(false);
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

  return (
    <div className="App">
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
        <MeetingForm 
          onSubmit={handleMeetingSubmit} 
          onError={(error) => setHasError(error !== null)}
        />
        
        {/* Meeting Minutes */}
        {meetingData && !hasError && (
          <MeetingMinutes 
            meetingData={meetingData}
            onShare={handleShare} 
          />
        )}
      </div>

      {/* Footer */}
      <footer className="copyright-footer">
        <div className="container">
          <p><Pattern size={20} />  PeakNote   Inc.</p>
        </div>
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