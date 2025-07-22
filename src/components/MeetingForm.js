import React, { useState } from 'react';
import './MeetingForm.css';

const MeetingForm = ({ onSubmit }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [template, setTemplate] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Use the meeting URL directly as it should already be properly encoded
      const apiUrl = `https://68316233e15d.ngrok-free.app/transcript/by-url?url=${meetingUrl}`;
      
      // Call transcript API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate meeting transcript');
      }

      const transcriptData = await response.json();
      
      // Structure the data to match what the app expects
      const formattedData = {
        meetingUrl,
        template,
        notes: transcriptData, // Changed from 'transcript' to 'notes' to match MeetingMinutes expectation
        generatedAt: new Date().toISOString()
      };
      
      onSubmit(formattedData);
    } catch (error) {
      console.error('Error generating meeting transcript:', error);
      alert('Failed to generate meeting transcript. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsFinished(true); 
    }, 1500);
  };

  const handleUrlChange = (e) => {
    setMeetingUrl(e.target.value);
    setIsFinished(false);
  };
  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    setIsFinished(false);
  };

  return (
    <div className="card shadow p-4 meeting-form-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">
          <div className="col-md-8">
            <input
              type="url"
              className="form-control"
              id="teams-url"
              placeholder="Enter Teams meeting URL"
              value={meetingUrl}
              onChange={handleUrlChange}
              required
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              id="template-select"
              value={template}
              onChange={handleTemplateChange}
            >
              <option value="standard">Standard meeting</option>
              <option value="client">Client meeting</option>
              <option value="scrum">Scrum meeting</option>
              <option value="standup">Daily standup</option>
            </select>
          </div>
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