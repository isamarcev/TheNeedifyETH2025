"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from 'wagmi/connectors';
import { Button } from '../components/ui/Button';
import { useMiniKit } from "@coinbase/onchainkit/minikit";

// User interface matching our backend User type
interface User {
  address: string;
  full_name: string;
  avatar: string;
  forecaster_id: string;
  forecaster_nickname: string;
  created_at: string;
}

type WalletContextType = {
  isConnected: boolean;
  walletAddress: string | null;
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
  WalletButton: React.FC;
  user: User | null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  // Initialize MiniKit
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Define connect and disconnect functions
  const connect = () => {
    wagmiConnect({ connector: injected() });
  };

  const disconnect = () => {
    wagmiDisconnect();
    localStorage.removeItem('needify_user');
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  // Handle user data when connection state changes
  useEffect(() => {
    if (isConnected && address) {
      // Store connection info in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
      }
      
      setWalletAddress(address);
      fetchUser(address);
    } else {
      setWalletAddress(null);
      setUser(null);
    }
  }, [isConnected, address]);

  // Load stored user data if available
  useEffect(() => {
    if (isConnected && !user) {
      const storedUser = localStorage.getItem('needify_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
    }
  }, [isConnected, user]);

  const fetchUser = async (address: string) => {
    try {
      setIsLoadingUser(true);
      const response = await fetch(`/api/users?address=${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // Store user in localStorage for persistence
      localStorage.setItem('needify_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Custom wallet button component
  const WalletButton = () => {
    if (isConnected) {
      return (
        <Button variant="outline" size="sm" onClick={disconnect}>
          {isLoadingUser ? 'Loading...' : user?.forecaster_nickname || walletAddress?.slice(0, 6) + '...' + walletAddress?.slice(-4)}
        </Button>
      );
    }

    return (
      <Button variant="primary" size="sm" onClick={connect} loading={isPending}>
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  };

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      walletAddress, 
      connect, 
      disconnect, 
      isConnecting: isPending,
      WalletButton,
      user
    }}>
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
     

