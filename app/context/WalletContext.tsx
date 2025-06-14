"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAccount, useConnect } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";

type WalletContextType = {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  WalletButton: React.FC;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected: wagmiIsConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [isConnected, setIsConnected] = useState(false);
  const autoConnectAttempted = useRef(false);
  
  // Initialize MiniKit
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Auto reconnect logic
  useEffect(() => {
    const attemptAutoConnect = async () => {
      if (autoConnectAttempted.current || wagmiIsConnected) return;
      
      // Check if we should auto-reconnect
      if (typeof window !== 'undefined') {
        const storedConnection = localStorage.getItem('walletConnected');
        
        if (storedConnection === 'true' && !wagmiIsConnected) {
          console.log('Attempting auto-reconnect...');
          
          try {
            // Wait for connectors to be ready
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // Log all available connectors for debugging
            console.log('Available connectors:', connectors);
            
            // Try all connectors
            for (const connector of connectors) {
              try {
                console.log(`Trying to connect with ${connector.name}`);
                await connect({ connector });
                console.log(`Successfully connected with ${connector.name}`);
                break;
              } catch (err) {
                console.log(`Failed to connect with ${connector.name}:`, err);
              }
            }
          } catch (error) {
            console.error('Auto-reconnect failed:', error);
          }
        }
        
        autoConnectAttempted.current = true;
      }
    };
    
    if (typeof window !== 'undefined') {
      // Give page time to fully load
      const timer = setTimeout(attemptAutoConnect, 50);
      return () => clearTimeout(timer);
    }
  }, [wagmiIsConnected, connect, connectors, isFrameReady]);

  // Update connection state when address changes
  useEffect(() => {
    setIsConnected(wagmiIsConnected);
    
    if (wagmiIsConnected && address) {
      // Store connection info in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
      }
    }
  }, [wagmiIsConnected, address]);

  const connectWallet = () => {
    // The actual connection is handled by the Wallet component
    console.log('Opening wallet connection dialog');
  };

  const disconnectWallet = () => {
    // Disconnect will be handled by WalletDropdownDisconnect
    console.log('Please use the wallet dropdown to disconnect');
  };

  // Custom wallet button component
  const WalletButton = () => {
    return (
      <Wallet className="z-10">
        <ConnectWallet>
          <Name className="text-inherit" />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    );
  };

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      walletAddress: address || null, 
      connectWallet, 
      disconnectWallet,
      WalletButton
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
 