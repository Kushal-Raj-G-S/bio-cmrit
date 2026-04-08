import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wheat, BookOpen } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'page' | 'component';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  message = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (variant === 'page') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <div className="relative">
            <Wheat className="w-12 h-12 text-green-500" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-green-500/20"
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Loading Education Platform
          </h3>
          <p className="text-gray-600">{message}</p>
        </motion.div>
      </div>
    );
  }

  if (variant === 'component') {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen className={`${sizeClasses[size]} text-green-500`} />
        </motion.div>
        {message && (
          <span className="ml-2 text-gray-600">{message}</span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className={`${sizeClasses[size]} text-green-500`} />
    </motion.div>
  );
};

// Skeleton loading components
export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);
