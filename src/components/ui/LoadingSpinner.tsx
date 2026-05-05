import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-primary/50 border-t-primary-600 rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-3 text-text-secondary text-sm font-medium">{text}</p>
      )}
    </div>
  );
}