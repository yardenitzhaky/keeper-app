import React from 'react';

const LoadingButton = ({ 
  onClick, 
  loading, 
  children, 
  className = '',
  disabled = false 
}) => {
  const baseClass = "relative inline-flex items-center justify-center transition-all duration-200";
  const finalClassName = `${baseClass} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={finalClassName}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
          <span className="opacity-70">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;