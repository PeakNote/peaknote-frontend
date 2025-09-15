import React, { useState } from 'react';
import './MeetingForm.css';

const MeetingForm = ({ onSubmit }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      console.log('MeetingForm: Submitted URL:', meetingUrl); // Debug log
      
      // Check for test URL to generate sample content
      if (meetingUrl.toLowerCase().trim() === 'test') {
        console.log('MeetingForm: Test mode detected'); // Debug log
        
        // Generate sample meeting data for testing
        const sampleData = {
          meetingUrl: 'https://teams.microsoft.com/l/meetup-join/sample-test-meeting',
          template: 'smart',
          notes: {
            transcript: `# Weekly Product Team Meeting

*December 15, 2024 | 10:00 AM - 11:00 AM EST*

---

## 📋 Meeting Agenda

- Q4 Product roadmap review
- Customer feedback analysis
- Resource allocation for Q1 2025

## 👥 Participants

- **Sarah Johnson** - Product Manager
- **Mike Chen** - Engineering Lead
- **Lisa Rodriguez** - UX Designer
- **David Thompson** - Marketing Director

## 💡 Key Discussion Points

### Q4 Roadmap Performance

We've successfully delivered **85% of planned features** for Q4. The new dashboard feature received particularly positive feedback from beta users.

> *"The new analytics dashboard has improved our workflow efficiency by 40%. This is exactly what we needed." - Customer Beta Tester*

### Customer Feedback Analysis

Lisa presented the latest UX research findings. Key insights include:

1. **Mobile responsiveness** is our top priority for Q1 2025
2. Users want more customization options in their workspace  
3. Integration with Slack and Microsoft Teams is highly requested

## ✅ Action Items

- [ ] **Mike**: Create technical specifications for mobile app by **December 22**
- [ ] **Lisa**: Design mockups for customization features by January 5
- [ ] **David**: Research integration partnerships with Slack and Teams by January 10
- [ ] **Sarah**: Schedule Q1 planning session with stakeholders by January 3

## 🎯 Key Decisions Made

- **Budget Allocation:** 60% for mobile development, 40% for integrations in Q1 2025
- **Timeline:** Mobile app MVP to be completed by March 31, 2025
- **Team Structure:** Hiring 2 additional mobile developers starting January 2025

---

*Next meeting: December 22, 2024 at 10:00 AM EST*  
*Meeting notes compiled by PeakNote AI Assistant*`
          },
          generatedAt: new Date().toISOString()
        };

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        onSubmit(sampleData);
        setIsFinished(true);
        return;
      }

      // Use the meeting URL directly as it should already be properly encoded
      const apiUrl = `https://api.peak-note.com/transcript/by-url?url=${meetingUrl}`;

      console.log('Calling API:', apiUrl);
      // Call transcript API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('MeetingForm response status:', response.status);
      console.log('MeetingForm response headers:', response.headers);

      if (!response.ok) {
        throw new Error('Failed to generate meeting transcript');
      }

      const transcriptData = await response.json();
      console.log('MeetingForm API response:', transcriptData);

      // Structure the data to match what the app expects
      const formattedData = {
        meetingUrl,
        template: 'smart',
        notes: transcriptData,
        generatedAt: new Date().toISOString()
      };

      onSubmit(formattedData);
    } catch (error) {
      console.error('Error generating meeting transcript:', error);
      alert('Failed to generate meeting transcript. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsFinished(true);
    }
  };

  const handleUrlChange = (e) => {
    setMeetingUrl(e.target.value);
    setIsFinished(false);
  };

  return (
    <div className="card shadow p-4 meeting-form-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">  
            <input
              type="text"
              className="form-control"
              id="teams-url"
              placeholder="Enter Teams meeting URL or type 'test' for demo"
              value={meetingUrl}
              onChange={handleUrlChange}
              required
            /> 
        </div>
        <button
          type="submit"
          className={`btn btn-primary${isProcessing ? ' btn-processing' : ''}${isFinished ? ' btn-finished' : ''}`}
          disabled={isProcessing}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>
            {isProcessing ? 'Generating...' : 'Generate Notes'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default MeetingForm;
