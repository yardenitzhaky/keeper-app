/**
 * LoadingButton Component
 * A reusable button component that handles loading states
 */

import React from 'react';
import PropTypes from 'prop-types';

const LoadingButton = ({
  onClick,
  loading,
  children,
  className = '',
  disabled = false
}) => {
  // ============================================================================
  // STYLES
  // ============================================================================
  
  const baseClass = "relative inline-flex items-center justify-center transition-all duration-200";
  const finalClassName = `${baseClass} ${className}`;

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={finalClassName}
      role="button"
      aria-busy={loading}
      aria-disabled={loading || disabled}
    >
      {loading ? (
        <div 
          className="flex items-center space-x-2"
          aria-hidden="true"
        >
          <div 
            className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" 
            role="progressbar"
          />
          <span className="opacity-70">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};


export default LoadingButton;