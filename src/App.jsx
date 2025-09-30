import React, { useState } from 'react';
import './App.css';
import MeetingForm from './components/MeetingForm';

import ShareModal from './components/ShareModal';
import SuccessAnimation from './components/SuccessAnimation';
import Pattern from './components/Pattern.jsx';
import SimpleEditor from './components/SimpleEditor.jsx';
import InfoIcon from './components/InfoIcon';
import TutorialModal from './components/TutorialModal';
import MeetingHistorySidebar from './components/MeetingHistorySidebar';

function App() {
  const [meetingData, setMeetingData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [editorContent, setEditorContent] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Meeting History Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [meetingList, setMeetingList] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Typing animation messages
  const staticMessage = 'AI-Driven Meeting Assistant';

  const handleMeetingSubmit = (data) => {
    console.log('App.jsx: Received data from MeetingForm:', data);
    setMeetingData(data);
    
    // Set the editor content with the meeting notes
    if (data.notes) {
      console.log('App.jsx: Setting editor content:', data.notes);
      setEditorContent(data.notes);
    }
    
    // Extract meeting list from the API response if available
    if (data.meetingList && Array.isArray(data.meetingList)) {
      console.log('App.jsx: Found meetingList:', data.meetingList);
      // Sort meetings by startTime (most recent first)
      const sortedMeetings = data.meetingList.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
      setMeetingList(sortedMeetings);
      console.log('App.jsx: Set meeting list:', sortedMeetings);
    } else {
      console.log('App.jsx: No meetingList found in data or not an array');
    }
    
    // Set current event ID from the API response
    if (data.currentEventId) {
      setCurrentEventId(data.currentEventId);
      console.log('App.jsx: Set current event ID:', data.currentEventId);
    } else if (data.meetingList && data.meetingList.length > 0) {
      // 总是将第一个会议设置为当前会议
      setCurrentEventId(data.meetingList[0].eventId);
      console.log('App.jsx: Set first meeting as current:', data.meetingList[0].eventId);
    }
  };

  // 优化onChange处理，避免不必要的重新渲染
  const handleEditorChange = React.useCallback((content) => {
    setEditorContent(content);
  }, []);

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

  const handleTutorialOpen = () => {
    setShowTutorial(true);
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
  };

  // Sidebar handlers
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 回到当前会议的功能
  const handleBackToCurrentMeeting = () => {
    if (meetingList.length > 0) {
      const currentMeeting = meetingList[0];
      setCurrentEventId(currentMeeting.eventId);
      console.log('Back to current meeting:', currentMeeting);
      
      // 如果当前会议有内容，直接显示
      if (meetingData && meetingData.notes) {
        setEditorContent(meetingData.notes);
        console.log('Restored current meeting content');
      }
    }
  };

  const handleSelectMeeting = async (meeting) => {
    setCurrentEventId(meeting.eventId);
    console.log('Selected meeting:', meeting);
    
    try {
      // 首先尝试使用eventId获取会议详情
      const apiUrl = `https://api.peak-note.com/transcript/by-event-id?eventId=${encodeURIComponent(meeting.eventId)}`;
      console.log('Fetching meeting details for eventId:', meeting.eventId);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const meetingData = await response.json();
      console.log('Meeting details response:', meetingData);

      // 处理返回的会议记录
      if (meetingData.meetingDetails && meetingData.meetingDetails.transcript) {
        let notes = meetingData.meetingDetails.transcript;
        
        // 检查是否是JSON格式的字符串
        if (typeof notes === 'string' && notes.includes('```json')) {
          try {
            const jsonMatch = notes.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              const jsonString = jsonMatch[1].trim();
              notes = JSON.parse(jsonString);
              console.log('Parsed JSON from transcript:', notes);
            }
          } catch (error) {
            console.error('Error parsing JSON from transcript:', error);
          }
        }
        
        // 更新编辑器内容
        setEditorContent(notes);
        console.log('Updated editor content with meeting details');
      } else {
        console.warn('No transcript found in meeting details');
        // 创建一个基本的会议信息显示
        const basicContent = {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1, textAlign: 'left' },
              content: [{ type: 'text', text: meeting.topic || 'Meeting Details' }]
            },
            {
              type: 'paragraph',
              attrs: { textAlign: 'left' },
              content: [
                { type: 'text', text: `Date: ${new Date(meeting.startTime).toLocaleDateString()}` }
              ]
            },
            {
              type: 'paragraph',
              attrs: { textAlign: 'left' },
              content: [
                { type: 'text', text: `Time: ${new Date(meeting.startTime).toLocaleTimeString()} - ${new Date(meeting.endTime).toLocaleTimeString()}` }
              ]
            },
            {
              type: 'paragraph',
              attrs: { textAlign: 'left' },
              content: [
                { type: 'text', text: 'No detailed transcript available for this meeting.' }
              ]
            }
          ]
        };
        setEditorContent(basicContent);
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      
      // 如果API调用失败，显示基本的会议信息
      const fallbackContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1, textAlign: 'left' },
            content: [{ type: 'text', text: meeting.topic || 'Meeting Details' }]
          },
          {
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: [
              { type: 'text', text: `Date: ${new Date(meeting.startTime).toLocaleDateString()}` }
            ]
          },
          {
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: [
              { type: 'text', text: `Time: ${new Date(meeting.startTime).toLocaleTimeString()} - ${new Date(meeting.endTime).toLocaleTimeString()}` }
            ]
          },
          {
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: [
              { type: 'text', text: 'Unable to load detailed transcript. The API endpoint may not be available or the eventId may be invalid.' }
            ]
          }
        ]
      };
      setEditorContent(fallbackContent);
      console.log('Using fallback content for meeting:', meeting);
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Information Icon */}
      <InfoIcon onClick={handleTutorialOpen} />
      
      {/* Meeting History Sidebar */}
      <MeetingHistorySidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        meetingList={meetingList}
        onSelectMeeting={handleSelectMeeting}
        onBackToCurrent={handleBackToCurrentMeeting}
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
            onChange={handleEditorChange}
            meetingData={meetingData}
            onShareClick={handleShare}
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

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={showTutorial}
        onClose={handleTutorialClose}
      />
    </div>
  );
}

export default App;