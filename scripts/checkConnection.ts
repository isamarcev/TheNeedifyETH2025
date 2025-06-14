import {
    createAuthRequestMessage,
  createPingMessage,
  MessageSigner,
  parseRPCResponse,
  RequestData,
  ResponsePayload,
} from "@erc7824/nitrolite";
import { createWalletClient, custom, getAddress, WalletClient } from "viem";
import { polygon } from "viem/chains";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface ConnectionStatus {
  wallet: {
    isConnected: boolean;
    address?: string;
    error?: string;
  };
  websocket: {
    isConnected: boolean;
    error?: string;
  };
}

export async function checkWalletConnection(): Promise<{
  isConnected: boolean;
  address?: string;
  error?: string;
}> {
  try {
    if (!window.ethereum) {
      return {
        isConnected: false,
        error: "No wallet found! Please install MetaMask.",
      };
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      return {
        isConnected: false,
        error: "No accounts found! Please connect your wallet.",
      };
    }

    const client = createWalletClient({
      transport: custom(window.ethereum),
      chain: polygon,
      account: getAddress(accounts[0]),
    });

    return {
      isConnected: true,
      address: accounts[0],
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function checkWebSocketConnection(
  ws: WebSocket | null,
  signer: MessageSigner
): Promise<{ isConnected: boolean; error?: string }> {
  try {
    if (!ws) {
      return {
        isConnected: false,
        error: "WebSocket instance is not initialized",
      };
    }

    if (ws.readyState !== WebSocket.OPEN) {
      return { isConnected: false, error: "WebSocket is not open" };
    }

    // Try to send a ping message
    const msg = await createPingMessage(signer);
    ws.send(msg);

    return { isConnected: true };
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function checkAllConnections(
  ws: WebSocket | null,
  signer: MessageSigner
): Promise<ConnectionStatus> {
  const [walletStatus, wsStatus] = await Promise.all([
    checkWalletConnection(),
    checkWebSocketConnection(ws, signer),
  ]);

  return {
    wallet: walletStatus,
    websocket: wsStatus,
  };
}

(async () => {
  // Initialize WebSocket connection
  const WS_URL = "wss://clearnet.yellow.com/ws"; // Replace with your actual WebSocket server URL
  const ws = new WebSocket(WS_URL);

  // Read private key from file
  const privateKey = ethers.Wallet.createRandom().privateKey;
  console.log("privateKey", privateKey);

const authRequestMsg = await createAuthRequestMessage({
    wallet: '0xYourWalletAddress',
    participant: '0xYourSignerAddress',
    app_name: 'Your Domain',
    expire: String(Math.floor(Date.now() / 1000) + 3600), // 1 hour expiration
    scope: 'console',
    application: '0xYourApplicationAddress',
    allowances: [],
  });

  ws.onopen = () => {
    ws.send(authRequestMsg);
  };

  ws.onmessage = (event) => {
    try {
        const message = parseRPCResponse(event.data);
        console.log("message", message);
    } catch(err) {}
    
  };
})();
