import React from 'react';

const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Đang tải...
        </h2>
        <p className="text-sm text-gray-500">
          Vui lòng chờ trong giây lát
        </p>
        
        {/* Skeleton Animation (Optional) */}
        <div className="mt-8 space-y-3 max-w-md mx-auto">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
