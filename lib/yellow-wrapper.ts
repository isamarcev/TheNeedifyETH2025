import {
  AuthRequest,
  AuthVerifyRPCResponseParams,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  parseRPCResponse,
  RPCMethod,
} from "@erc7824/nitrolite";
import { Address, createWalletClient, http, PrivateKeyAccount } from "viem";
import { mainnet } from "viem/chains";

export class YellowClient {
  private ws: WebSocket;
  private serverKeypair: PrivateKeyAccount;
  private sessionKey: PrivateKeyAccount;
  private connection: Promise<boolean>;

  constructor(
    endpoint: string,
    serverKeypair: PrivateKeyAccount,
    sessionKey: PrivateKeyAccount
  ) {
    this.ws = new WebSocket(endpoint);
    this.serverKeypair = serverKeypair;
    this.sessionKey = sessionKey;
    console.log("Constructed");

    this.connection = new Promise((resolve) => {
      this.ws.onopen = () => {
        console.log("connected");
        resolve(true);
      };
    });

    this.ws.onerror = (err) => {
      console.log("ERROR: ", err);
    };
  }

  async ensureConnection() {
    return await this.connection;
  }

  async authentificate(expireHour: number) {
    await this.connection;
    const authMsg: AuthRequest = {
      wallet: this.serverKeypair.address,
      participant: this.serverKeypair.address,
      app_name: "yellow-client",
      expire: String(expireHour), // 1 hour expiration
      scope: "console",
      application: this.sessionKey.address,
      allowances: [],
    };

    const walletClient = createWalletClient({
      account: this.serverKeypair,
      chain: mainnet,
      transport: http(),
    });

    const authRequestMsg = await createAuthRequestMessage(authMsg);

    let promise = new Promise<AuthVerifyRPCResponseParams>((resolve) => {
      this.ws.onmessage = async (event) => {
        try {
          const message = parseRPCResponse(event.data);
          console.log("Parsed message:", message);
          switch (message.method) {
            case RPCMethod.AuthChallenge:
              console.log("Auth challenge received");
              const messageEipSigner = createEIP712AuthMessageSigner(
                walletClient,
                {
                  scope: authMsg.scope!,
                  application: authMsg.application!,
                  participant: authMsg.participant,
                  expire: authMsg.expire!,
                  allowances: authMsg.allowances.map(a => ({
                    asset: a.symbol,
                    amount: a.amount,
                  })),
                },
                {
                  name: "yellow-client",
                }
              );

              const authVerifyMessage = await createAuthVerifyMessage(
                messageEipSigner,
                message
              );

              this.ws.send(authVerifyMessage);
              console.log("Auth verify message sent");
              break;
            case RPCMethod.AuthVerify:
              console.log("Auth verification received");
              resolve(message.params);
              break;
            default:
              console.log("Unhandled message type:", message.method);
          }
        } catch (err) {
          // console.error("Error handling message:", err);
        }
      };
    });

    this.ws.send(authRequestMsg);
    console.log("Auth request message sent");

    return promise;
  }

  async createAppSession(serverKey: PrivateKeyAccount, user: Address) {}
}
