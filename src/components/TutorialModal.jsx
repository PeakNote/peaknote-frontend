import React from 'react';
import './TutorialModal.css';

const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tutorialSteps = [
    {
      title: "1. Enter Meeting Information",
      description: "Paste your Microsoft Teams meeting link. Our AI will analyze the conversation and automatically generate clear, structured meeting minutes.",
      icon: "📝",
      gif: "/generate.gif"
    },
    {
      title: "2. Access Meeting History",
      description: "For recurring meetings, easily review past meeting records to keep track of decisions and progress over time.",
      icon: "🤖",
      gif: "/history.gif"
    },
    {
      title: "3. Edit and Optimize",
      description: "Use the rich text editor to edit, format, and optimize the generated meeting minutes.",
      icon: "✏️",
      gif: "/edit.gif"
    },
    {
      title: "4. Share and Export",
      description: "Share completed meeting minutes with team members or export in different formats.",
      icon: "📤",
      gif: "/share-and-export.gif"
    }
  ];

  const features = [
    "🎯 Smart Meeting Content Analysis",
    "📋 Auto-Generated Meeting Minutes",
    "✏️ Rich Text Editing Features",
    "📤 Multiple Sharing Options",
    "🔒 Secure Data Processing",
    "⚡ Real-time Collaboration Support"
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
                  {feature}
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
