import React from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '../ui/BottomNav';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export const PageContainer = ({ 
  children,
  className = '',
  fullWidth = false
}: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`pb-24 ${fullWidth ? '' : 'max-w-7xl mx-auto'} ${className}`}
      >
        {children}
      </motion.main>
      
      <BottomNav />
      
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-transparent bg-clip-text mr-1">
                Needify
              </span>
              <span className="flex h-5 w-5 rounded-full bg-yellow-400 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with ❤️ on Layer 3 & Farcaster
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
