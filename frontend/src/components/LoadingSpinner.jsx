/**
 * LoadingSpinner Component
 * Displays a loading animation with informational text
 * Used during initial application load and data fetching operations
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = () => {
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div 
      className="loading-container"
      role="alert"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="loading-spinner">
        {/* Spinner Animation */}
        <div 
          className="spinner-wrapper"
          aria-hidden="true"
        >
          <div className="spinner-ring outer"></div>
          <div className="spinner-ring inner"></div>
          <div className="spinner-dot"></div>
        </div>

        {/* Loading Text */}
        <div 
          className="spinner-text"
          aria-live="polite"
        >
          Loading...
        </div>

        {/* Information Message */}
        <div 
          className="spinner-subtext"
          role="status"
          aria-live="polite"
        >
          Please note: Initial load may take up to 30 seconds as the server spins up 
          on Render's free tier.
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;