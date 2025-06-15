"use client";

import { WagmiConfig, createConfig } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WalletProvider } from "./context/WalletContext";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Configure react-query
const queryClient = new QueryClient();

// Configure wagmi
const config = createConfig(
  getDefaultConfig({
    // Your ConnectKit configuration
    appName: "Needify",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [mainnet],
    // autoConnect is not supported here
  })
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <MiniKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
            config={{
              appearance: {
                mode: "auto",
                theme: "mini-app-theme",
                name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
                logo: process.env.NEXT_PUBLIC_ICON_URL,
              },
            }}
          >
            <WalletProvider>{children}</WalletProvider>
          </MiniKitProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
