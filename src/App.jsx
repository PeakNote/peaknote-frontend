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

  // 用于测试
  const generateTestData = () => {
    const testData = {
      meetingUrl: "test://meeting",
      template: 'smart',
      notes: {
        transcript: `Project Development Meeting Minutes
  
  Meeting Overview
  
  Meeting Information
  
  Date: January 15, 2024
  Time: 2:00 PM - 3:30 PM
  Facilitator: Sarah Johnson
  Participants: Alex Developer, Emma Designer, Mike Tester, Lisa Product Manager
  
  Project Progress
  
  Completed Work
  
  Alex Developer: Completed user authentication module development, including password encryption and JWT token generation. Code has been committed to Git repository and is ready for code review.
  
  Emma Designer: Completed mobile interface design mockups, including login page, homepage, and settings page. Design files have been uploaded to Figma for the development team reference.
  
  Mike Tester: Completed test case writing for login functionality, covering normal login, exception login, password error scenarios. Test cases have been added to the test management platform.
  
  Lisa Product Manager: Completed product requirement document updates, clarifying next phase feature requirements. Documents have been synchronized to team shared folder.
  
  Today's Plan
  
  Alex Developer: Start developing user registration functionality, expected to take 2 days to complete. Also assist Emma Designer with technical implementation issues.
  
  Emma Designer: Continue improving mobile interface design, focusing on user experience details. Plan to complete personal center page design.
  
  Mike Tester: Begin executing login functionality tests, record test results and discovered bugs. Prepare test report template.
  
  Lisa Product Manager: Communicate with clients to confirm new feature requirements, collect user feedback. Schedule next week's product review meeting.
  
  Issues and Risks
  
  Technical Risk: The newly introduced third-party login SDK may have compatibility issues and requires early technical research.
  
  Timeline Risk: Mobile development progress may lag behind schedule, requiring development plan adjustments.
  
  Resource Risk: Insufficient testing personnel may affect testing quality.
  
  Next Steps
  
  1. Alex Developer responsible for technical research, complete third-party login SDK evaluation report by Friday
  2. Emma Designer accelerate design progress, complete all page design mockups by next Tuesday
  3. Mike Tester develop detailed test plan, ensure test coverage reaches 90% or above
  4. Lisa Product Manager arrange client communication meeting, confirm final product requirements
  
  Meeting Summary
  
  This meeting clarified current project progress and next phase plans, team member responsibilities are clear, and the project is expected to be completed on schedule. Next meeting scheduled for next Wednesday at 2:00 PM.
  
  ---
  
  📝 Testing Instructions:
  
  Please select the following text and test toolbar functions:
  
  • 6th button → H1 title (32px) - Select "Project Development Meeting Minutes"
  • 7th button → H2 title (26px) - Select "Meeting Overview" 
  • 8th button → H3 title (20px) - Select "Meeting Information"
  
  �� Features:
  - H1: 32px, largest and most prominent for main titles
  - H2: 26px, secondary headers for sections
  - H3: 20px, tertiary headers for subsections
  - Multiple clicks maintain fixed size, no continuous growth
  - Switch between different header levels seamlessly
  
  ⌨️ Keyboard Shortcuts:
  - **Ctrl+Z** (Windows/Linux) or **Cmd+Z** (Mac): Undo operations
  - Made a mistake? Just press Ctrl+Z to revert your last change!`
        },
        generatedAt: new Date().toISOString()
      };
      setMeetingData(testData);
    };

  const handleMeetingSubmit = (data) => {
    setMeetingData(data);
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
            onShare={handleShare} 
          />
        )}
      </div>

      {/* 添加测试按钮 */}
      <button 
          onClick={generateTestData}
          style={{
            margin: '10px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Test Generate
        </button>

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
        onSend={handleShareSend}
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