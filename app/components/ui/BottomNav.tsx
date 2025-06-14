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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 shadow-lg pb-safe w-full max-w-full">
      {/* Remove the wallet connection status and button */}
      
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
                  ? 'text-gray-800' 
                  : 'text-gray-400 dark:text-gray-400'
              }`}>
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 mx-auto w-1.5 h-1.5 bg-yellow-400 rounded-full"
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