import React from 'react';
import './TutorialModal.css';

const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tutorialSteps = [
    {
      title: "1. Enter Meeting Information",
      description: "Paste your Microsoft Teams meeting link. Our AI will analyze the conversation and automatically generate clear, structured meeting minutes.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 5.83334H17.5M2.5 10H12.5M2.5 14.1667H8.33333" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      gif: "/generate.gif"
    },
    {
      title: "2. Access Meeting History",
      description: "For recurring meetings, easily review past meeting records to keep track of decisions and progress over time.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.33333 3.33334H16.6667C17.1269 3.33334 17.5 3.70644 17.5 4.16668V15.8333C17.5 16.2936 17.1269 16.6667 16.6667 16.6667H3.33333C2.8731 16.6667 2.5 16.2936 2.5 15.8333V4.16668C2.5 3.70644 2.8731 3.33334 3.33333 3.33334Z" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.66667 8.33334H13.3333M6.66667 11.6667H10" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      gif: "/history.gif"
    },
    {
      title: "3. Edit and Optimize",
      description: "Use the rich text editor to edit, format, and optimize the generated meeting minutes.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.25 2.5L17.5 8.75L6.25 20H2.5V16.25L11.25 2.5Z" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14.375 5.625L16.25 7.5" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      gif: "/edit.gif"
    },
    {
      title: "4. Share and Export",
      description: "Share completed meeting minutes with team members or export in different formats.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6667 6.66668L10 13.3333L3.33333 6.66668M10 13.3333V1.66668" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.5 16.6667H17.5" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      gif: "/share-and-export.gif"
    }
  ];

  const features = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1L10.5 5.5L15.5 6.5L12 10L13 15L8 12.5L3 15L4 10L0.5 6.5L5.5 5.5L8 1Z" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "Smart Meeting Content Analysis"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 3.33334H13.5C14.0523 3.33334 14.5 3.78107 14.5 4.33334V11.6667C14.5 12.219 14.0523 12.6667 13.5 12.6667H2.5C1.94772 12.6667 1.5 12.219 1.5 11.6667V4.33334C1.5 3.78107 1.94772 3.33334 2.5 3.33334Z" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.33333 6.66668H10.6667M5.33333 9.33334H8" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "Auto-Generated Meeting Minutes"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 2L13 6L6 13H2V9L9 2Z" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.5 4.5L13.5 6.5" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "Rich Text Editing Features"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3333 5.33334L8 10.6667L2.66667 5.33334M8 10.6667V1.33334" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 13.3333H14" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "Multiple Sharing Options"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V4.66667C12 3.19391 10.8061 2 9.33333 2H6.66667C5.19391 2 4 3.19391 4 4.66667V6M2 6H14V13.3333C14 14.2538 13.2538 15 12.3333 15H3.66667C2.74619 15 2 14.2538 2 13.3333V6ZM6 6V4.66667C6 4.29848 6.29848 4 6.66667 4H9.33333C9.70152 4 10 4.29848 10 4.66667V6" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "Secure Data Processing"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1L9.5 4.5L13 4L10.5 6.5L11.5 10L8 8L4.5 10L5.5 6.5L3 4L6.5 4.5L8 1Z" stroke="#C2BBD4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "Real-time Collaboration Support"
    }
  ];

  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-modal-header">
          <h2>PeakNote User Guide</h2>
          <button className="tutorial-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="tutorial-modal-content">
          <div className="tutorial-intro">
            <h3>Welcome to PeakNote!</h3>
            <p>PeakNote is an AI-driven meeting assistant that helps you quickly generate professional meeting minutes.</p>
          </div>

          <div className="tutorial-steps">
            <h4>How to Use</h4>
            <div className="steps-container">
              {tutorialSteps.map((step, index) => (
                <div key={index} className="tutorial-step">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-content">
                    <h5>{step.title}</h5>
                    <p>{step.description}</p>
                    {step.gif && (
                      <div className="step-gif">
                        <img 
                          src={step.gif} 
                          alt={`${step.title} demonstration`}
                          className="tutorial-gif"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tutorial-features">
            <h4>Key Features</h4>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tutorial-modal-footer">
          <button className="tutorial-start-btn" onClick={onClose}>
            Get Started with PeakNote
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
