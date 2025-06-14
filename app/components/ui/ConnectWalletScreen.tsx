"use client";

import { motion } from 'framer-motion';
import { Button } from './Button';
import { useEffect, useState } from 'react';

export const ConnectWalletScreen = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: animate ? 1 : 0 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
            className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </motion.div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: animate ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
        >
          Connect Your Wallet
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: animate ? 1 : 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          You need to connect your wallet to access this feature and start using Needify.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            variant="primary"
            size="lg"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
              </svg>
            }
          >
            Connect Wallet
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animate ? 1 : 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Supports Farcaster, Coinbase Wallet, and MetaMask</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
