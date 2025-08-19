import React, { useEffect, useRef } from 'react';
import TiptapEditor from './TiptapEditor';
import './MeetingMinutes.css';

const MeetingMinutes = ({ meetingData, onShare }) => {
  const minutesRef = useRef(null);

  useEffect(() => {
    if (minutesRef.current) {
      minutesRef.current.classList.add('show');
      minutesRef.current.scrollIntoView({ behavior: 'smooth' });

      // Add paper reveal animation
      const paper = minutesRef.current.querySelector('.a4-paper');
      if (paper) {
        paper.classList.add('paper-reveal');
      }

      // Remove floating animations - content displays normally
    }
  }, [meetingData]);



  // Generate HTML content for Tiptap editor from backend API data
  // Requirement 2.3: Handle HTML content from backend API directly
  // Requirement 3.1: Pass HTML content to Tiptap without conversion when possible
  const getEditorContent = () => {
    const notes = meetingData?.notes;
    if (!notes) return '<p>No meeting notes available.</p>';
    
    // Primary: Handle HTML content from backend API directly (Requirement 3.1)
    if (typeof notes === 'object' && notes.transcript) {
      // If backend returns HTML content, pass it directly to Tiptap (Requirement 2.3)
      if (typeof notes.transcript === 'string') {
        // Check if it's HTML content
        if (notes.transcript.trim().startsWith('<') || notes.transcript.includes('<p>') || notes.transcript.includes('<h')) {
          return notes.transcript;
        }
        
        // Fallback: Convert plain text/markdown to HTML for compatibility
        if (notes.transcript.trim()) {
          // Simple markdown-like conversion for backward compatibility
          let htmlContent = notes.transcript
            .replace(/\n\n/g, '</p><p>')  // Double newlines become paragraph breaks
            .replace(/\n/g, '<br>')       // Single newlines become line breaks
            .replace(/^(.+)$/gm, '<p>$1</p>'); // Wrap in paragraphs
          
          // Clean up any double paragraph tags
          htmlContent = htmlContent.replace(/<p><\/p>/g, '');
          
          return htmlContent || '<p>No meeting content available.</p>';
        }
      }
    }
    
    // Secondary: Handle structured notes format (legacy) - convert to HTML
    if (typeof notes === 'object' && (notes.agenda || notes.participants || notes.actionItems || notes.decisions)) {
      let htmlSections = [];
      
      if (notes.agenda && Array.isArray(notes.agenda) && notes.agenda.length > 0) {
        const agendaItems = notes.agenda.map(item => `<li>${item}</li>`).join('');
        htmlSections.push(`<h3>Agenda</h3><ul>${agendaItems}</ul>`);
      }
      
      if (notes.participants && Array.isArray(notes.participants) && notes.participants.length > 0) {
        const participantItems = notes.participants.map(participant => `<li>${participant}</li>`).join('');
        htmlSections.push(`<h3>Participants</h3><ul>${participantItems}</ul>`);
      }
      
      if (notes.actionItems && Array.isArray(notes.actionItems) && notes.actionItems.length > 0) {
        const actionItems = notes.actionItems.map(item => `<li>${item}</li>`).join('');
        htmlSections.push(`<h3>Action Items</h3><ul>${actionItems}</ul>`);
      }
      
      if (notes.decisions && Array.isArray(notes.decisions) && notes.decisions.length > 0) {
        const decisionItems = notes.decisions.map(decision => `<li>${decision}</li>`).join('');
        htmlSections.push(`<h3>Decisions</h3><ul>${decisionItems}</ul>`);
      }
      
      return htmlSections.length > 0 ? htmlSections.join('') : '<p>No meeting content available.</p>';
    }

    // Fallback for any other content format
    if (typeof notes === 'string' && notes.trim()) {
      return `<p>${notes}</p>`;
    }

    return '<p>No meeting notes available.</p>';
  };

  return (
    <div className="minutes-section" ref={minutesRef}>
      <div>
        <div className="a4-paper"> 
          <div className="minutes-content">
            <TiptapEditor 
              content={getEditorContent()}
              editable={true}
              placeholder="Meeting notes will appear here..."
              className="meeting-minutes-editor arial-white-text"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingMinutes;