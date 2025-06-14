"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";
import { useAccount } from "wagmi";

function FarcasterContext({ context }: { context: any }) {
  if (!context) return null;
  
  // console.log('Farcaster Context:', context);
  
  const handleOpenProfile = () => {
    console.log('Client:', context?.client);
    console.log('User:', context?.user);
    if (context?.user?.username) {
      window.open(`https://farcaster.xyz/${context.user.username}`, '_blank');
    }
  };

  return (
    <div className="mt-4 p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Farcaster Context</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenProfile}
          className="text-[var(--app-accent)]"
        >
          View Profile
        </Button>
      </div>
      <pre className="text-xs overflow-auto max-h-40 text-[var(--app-foreground-muted)]">
        {JSON.stringify(context, null, 2)}
      </pre>
    </div>
  );
}

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { address } = useAccount();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Create user when wallet is connected
  useEffect(() => {
    const createUser = async () => {
      if (address ) {
        try {
          // console.log('Farcaster client context:', context.client);
          // console.log('Farcaster user context:', context.user);
          
          // We'll update this once we see the actual structure
          const metadata = {
            full_name: context?.user?.displayName || '',
            avatar: context?.user?.pfpUrl || '',
            forecaster_id: context?.user?.fid?.toString() || '',
            forecaster_nickname: context?.user?.username || '',
          };

          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address, metadata }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create user');
          }
          
          console.log('User created/updated in database');
        } catch (error) {
          console.error('Error creating user:', error);
        }
      }
    };

    createUser();
  }, [address, context?.client]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
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
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
          {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
        </main>

        <FarcasterContext context={context} />

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </PageContainer>
  );
}
