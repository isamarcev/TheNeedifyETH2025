"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import { useState } from 'react';

export const BottomNav = () => {
  const pathname = usePathname();
  const { isConnected, WalletButton } = useWallet();
  const [activeItem, setActiveItem] = useState(pathname);
  
  const navItems = [
    {
      name: 'Tasks',
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      )
    },
    {
      name: 'Create',
      href: '/create-order',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      )
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 shadow-lg">

      {/* Wallet connection status */}
      <div className="absolute -top-10 right-4 bg-white dark:bg-gray-800 shadow-md rounded-full py-1 px-3 border border-gray-200 dark:border-gray-700 text-xs flex items-center">
        <span className={`mr-2 ${isConnected ? 'text-green-500' : 'text-gray-500'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <div className="scale-75 origin-right">
          <WalletButton />
        </div>
      </div>
      {/* Wallet connection toggle */}
      {/* <div className="absolute -top-10 right-4 bg-white dark:bg-gray-800 shadow-md rounded-full py-1 px-3 border border-gray-200 dark:border-gray-700 text-xs flex items-center">
        <span className={`mr-2 ${isConnected ? 'text-green-500' : 'text-gray-500'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <button
          onClick={isConnected ? disconnectWallet : connectWallet}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span className="sr-only">
            {isConnected ? 'Disconnect wallet' : 'Connect wallet'}
          </span>
          <span
            className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isConnected ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div> */}
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          // Determine if this nav item should be active
          const routeMatches = 
            pathname === item.href || 
            (item.href === '/orders' && pathname.startsWith('/orders')) ||
            (item.href !== '/orders' && item.href !== '/' && pathname.startsWith(item.href));
            
          // Set as active if route matches or if we've manually set this as active
          const isActive = routeMatches || activeItem === item.href;
            
          // Handle click - either follow link or show connect screen
          const handleClick = (e: React.MouseEvent) => {
            // Always update the active item state for visual feedback
            setActiveItem(item.href);
            
            // For non-Tasks items that require wallet connection
            if (!isConnected && item.name !== 'Tasks') {
              // Let the navigation happen, don't prevent default
              // The page will handle showing the connect wallet screen
            }
          };
            
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="w-full h-full flex flex-col items-center justify-center"
              onClick={handleClick}
            >
              <div className={`flex flex-col items-center transition-colors duration-300 ${
                isActive 
                  ? 'text-yellow-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 mx-auto w-1.5 h-1.5 bg-yellow-500 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-xs mt-1">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};