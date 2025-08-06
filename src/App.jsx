import React, { useState } from 'react';
import './App.css';
import MeetingForm from './components/MeetingForm';
import MeetingMinutes from './components/MeetingMinutes';
import ShareModal from './components/ShareModal';
import SuccessAnimation from './components/SuccessAnimation';
import useParticles from './hooks/useParticles';
import useTypingAnimation from './hooks/useTypingAnimation';

function App() {
  const [meetingData, setMeetingData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Initialize particles
  useParticles();

  // Typing animation messages
  const typingMessages = [
    'Your intelligent meeting assistant',
    'Capture every important detail',
    'Never miss a key discussion point',
    'Make your meetings more productive'
  ];

  const currentTypingMessage = useTypingAnimation(typingMessages, 5000);

  const handleMeetingSubmit = (data) => {
    setMeetingData(data);
  };

  // const handleDownload = () => {
  //   console.log('Download meeting minutes');
  //   // Download functionality is now implemented in MeetingMinutes component
  // };

  // const handleShare = () => {
  //   setShowShareModal(true);
  // };

  // const handleShareSend = (recipients) => {
  //   setShowShareModal(false);
  //   setShowSuccessAnimation(true);

  //   // Show confirmation after animation
  //   setTimeout(() => {
  //     const recipientNames = recipients.map(r => r.name).join(', ');
  //     alert(`Meeting minutes sent to Outlook for: ${recipientNames}`);
  //   }, 3200);
  // };

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
      <div id="particles-js"></div>
      
      <div className="container text-center">
        {/* Header */}
        <div className="logo">
          <h1 className="bounce-in">
            <span className="text-gradient">PEAKNOTE</span>
          </h1>
          <div className="typing-container">
            <p className="lead typing-animation" key={currentTypingMessage}>
              {currentTypingMessage}
            </p>
          </div>
        </div>
        
        {/* Meeting Form */}
        <MeetingForm onSubmit={handleMeetingSubmit} />
        
        {/* Meeting Minutes */}
        {meetingData && (
          <MeetingMinutes 
            meetingData={meetingData}
            // onDownload={handleDownload}
            // onShare={handleShare}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="copyright-footer">
        <div className="container">
          <p>© PeakNote Team, 2025</p>
        </div>
      </footer>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        // onSend={handleShareSend}
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