import React, { useState } from 'react';
import './MeetingForm.css';

const MeetingForm = ({ onSubmit, onError }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

  // Function to extract error reason from error message
  const extractErrorReason = (errorMessage) => {
    // If the error message contains a colon, extract the part after the last colon
    if (errorMessage && errorMessage.includes(':')) {
      const parts = errorMessage.split(':');
      return parts[parts.length - 1].trim();
    }
    // If no colon, return the original message
    return errorMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom validation
    if (!meetingUrl.trim()) {
      setError('Please enter a meeting URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(meetingUrl);
    } catch (error) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsProcessing(true);
    setError(null); // Clear any previous errors

    try {
      // Use the meeting URL directly as it should already be properly encoded
      const apiUrl = `https://api.peak-note.com/transcript/by-url?url=${meetingUrl}`;

      console.log('Calling API:', apiUrl); // 调试信息
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

      // Check if the API response contains an error
      if (transcriptData.error) {
        const errorReason = extractErrorReason(transcriptData.error);
        setError(errorReason);
        if (onError) onError(transcriptData.error);
        // Clear any previous meeting data when there's an error
        if (onSubmit) onSubmit(null);
        return;
      }

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
      const errorMessage = 'Failed to generate meeting transcript. Please try again.';
      const errorReason = extractErrorReason(errorMessage);
      setError(errorReason);
      if (onError) onError(errorMessage);
      // Clear any previous meeting data when there's an error
      if (onSubmit) onSubmit(null);
    } finally {
      setIsProcessing(false);
      setIsFinished(true);
    }
  };

  const handleUrlChange = (e) => {
    setMeetingUrl(e.target.value);
    setIsFinished(false);
    setError(null); // Clear error when user types
    if (onError) onError(null); // Clear error state in parent component
    // Clear any previous meeting data when user starts typing
    if (onSubmit) onSubmit(null);
  };

  return (
    <div className="card shadow p-4 meeting-form-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">  
            <input
              type="text"
              className="form-control"
              id="teams-url"
              placeholder="Enter Teams meeting URL"
              value={meetingUrl}
              onChange={handleUrlChange}
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
        
        {/* Error message display */}
        {error && (
          <div className="error-message-form">
            <p>{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default MeetingForm;
