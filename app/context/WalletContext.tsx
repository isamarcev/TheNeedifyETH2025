"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type WalletContextType = {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Initialize as disconnected - simulating real product behavior
  useEffect(() => {
    // In a real app, we would check for an existing connection here
    // For now, always start disconnected
    setIsConnected(false);
    setWalletAddress(null);
    
    // Clear any previous stored state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  }, []);

  const connectWallet = () => {
    // Mock wallet connection
    const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    setIsConnected(true);
    setWalletAddress(mockAddress);
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', mockAddress);
    }
    
    console.log('Wallet connected:', mockAddress);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
    
    console.log('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
