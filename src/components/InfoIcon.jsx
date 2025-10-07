import React from 'react';
import './InfoIcon.css';

const InfoIcon = ({ onClick }) => {
  return (
    <div className="info-icon-container" onClick={onClick}>
      <div className="info-icon">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          <path 
            d="M12 16V12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <circle 
            cx="12" 
            cy="8" 
            r="1" 
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default InfoIcon;


