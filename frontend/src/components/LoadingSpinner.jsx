import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-wrapper">
          <div className="spinner-ring outer"></div>
          <div className="spinner-ring inner"></div>
          <div className="spinner-dot"></div>
        </div>
        <div className="spinner-text">Loading...</div>
        <div className="spinner-subtext">Please note: Initial load may take up to 30 seconds as the server spins up on Render's free tier.</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;