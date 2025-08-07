import React, { useState } from 'react';
import './MeetingForm.css';
import config from '../config';

const MeetingForm = ({ onSubmit }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Use the meeting URL directly as it should already be properly encoded
      const apiUrl = `${config.BACKEND_URL}${config.ENDPOINTS.TRANSCRIPT_BY_URL}?url=${meetingUrl}`;

      // Call transcript API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate meeting transcript');
      }

      const transcriptData = await response.json();

      // Structure the data to match what the app expects
      const formattedData = {
        meetingUrl,
        template: 'smart',
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
          <div className="col-md-8">
            <input
              type="url"
              className="form-control"
              id="teams-url"
              placeholder="Enter Teams meeting URL (optional for demo)"
              value={meetingUrl}
              onChange={handleUrlChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              id="template-select"
              value="    Smart Mode(AI Driven)"
              readOnly
            />
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
