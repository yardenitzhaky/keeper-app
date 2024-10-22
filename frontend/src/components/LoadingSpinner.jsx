import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring outer"></div>
        <div className="spinner-ring inner"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-text">Loading... Initial load may take up to 50 seconds as the server spins up on Render's free tier. </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;