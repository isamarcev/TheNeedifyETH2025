import WebSocket from 'ws';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { createAuthRequestMessage, createAuthVerifyMessage, createEIP712AuthMessageSigner, parseRPCResponse, RPCMethod } from '@erc7824/nitrolite';

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private isAuthenticated: boolean = false;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // Server wallet configuration
  private readonly walletPrivatekey = "0x39590c6f031edbe054a6a4be603680eb6b72cc29d47c56876461ffef2b35e536";
  private readonly wallet = privateKeyToAccount(this.walletPrivatekey);
  private readonly client = createWalletClient({
    account: this.wallet,
    chain: mainnet,
    transport: custom({
      request: async ({ method, params }) => {
        // This is a mock implementation since we're not actually using the transport
        return Promise.resolve(null);
      },
    }),
  });

  private constructor() {
    this.initializeWebSocket();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeWebSocket() {
    const WS_URL = "wss://clearnet.yellow.com/ws";
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticate();
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.isAuthenticated = false;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = parseRPCResponse(event.data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, delay);
    }
  }

  private async authenticate() {
    if (!this.ws || !this.isConnected) return;

    const authMsgInner = {
      wallet: this.wallet.address,
      participant: this.wallet.address,
      app_name: "needify",
      expire: String(1), // 1 hour expiration
      scope: "console",
      application: this.wallet.address,
      allowances: [],
    };

    const authRequestMsg = await createAuthRequestMessage(authMsgInner);
    this.ws.send(authRequestMsg);
  }

  private handleMessage(message: any) {
    if (message.method === RPCMethod.AuthChallenge) {
      this.handleAuthChallenge(message);
    } else {
      // Handle other message types
      const handlers = this.messageHandlers.get(message.method) || [];
      handlers.forEach(handler => handler(message));
    }
  }

  private async handleAuthChallenge(message: any) {
    if (!this.ws) return;

    const eipSigner = createEIP712AuthMessageSigner(
      this.client,
      {
        scope: "console",
        application: this.wallet.address,
        participant: this.wallet.address,
        expire: "1",
        allowances: [],
      },
      {
        name: "needify",
      }
    );

    const authVerifyMessage = await createAuthVerifyMessage(eipSigner, message);
    this.ws.send(authVerifyMessage);
    this.isAuthenticated = true;
  }

  public addMessageHandler(method: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(method) || [];
    handlers.push(handler);
    this.messageHandlers.set(method, handlers);
  }

  public removeMessageHandler(method: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(method) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(method, handlers);
    }
  }

  public send(message: string): boolean {
    if (!this.ws || !this.isConnected || !this.isAuthenticated) {
      return false;
    }
    this.ws.send(message);
    return true;
  }

  public getWallet() {
    return this.wallet;
  }

  public isReady(): boolean {
    return this.isConnected && this.isAuthenticated;
  }

  public close() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }
}

export const wsService = WebSocketService.getInstance(); 