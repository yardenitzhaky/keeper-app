import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div className="absolute inset-0 border-8 border-t-[#f5ba13] border-opacity-30 rounded-full animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute inset-4 border-6 border-t-[#f5ba13] border-opacity-50 rounded-full animate-spin-reverse"></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-[#f5ba13] rounded-full animate-pulse"></div>
        </div>
        {/* Loading text */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-lg font-medium text-[#f5ba13] animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;