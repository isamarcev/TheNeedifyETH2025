import { createAppSessionMessage, AuthRequest, createAuthRequestMessage, MessageSigner, RequestData, ResponsePayload } from "@erc7824/nitrolite";
import { Address, PrivateKeyAccount, Hex} from "viem";
import { ethers} from 'ethers';

export class YellowClient {
  private ws: WebSocket;
  // private serverKeypair: PrivateKeyAccount; // wallet
  private serverKeypair: ethers.Wallet; // wallet
  private sessionKey: ethers.Wallet; // participant
  private connection: Promise<boolean>;

  constructor (
    endpoint: string,
    serverKeypair: ethers.Wallet,
    sessionKey: ethers.Wallet
  ) {
    this.ws = new WebSocket(endpoint);
    this.serverKeypair = serverKeypair;
    this.sessionKey = sessionKey;
    console.log("Constructed");

    this.connection = new Promise((resolve) => {
      this.ws.onopen = () => {
        console.log("connected")
        resolve(true);
      };
    });
  }

  async ensureConnection() {
    return await this.connection;
  }

  async authentificate(expireHour: number) {
    const authMsg: AuthRequest = {
      wallet: this.serverKeypair.address,
      participant: this.sessionKey.address,
      app_name: "some-domain",
      expire: String(expireHour), // 1 hour expiration
      scope: "console",
      application: this.sessionKey.address,
      allowances: [],
    };

    const authRequestMsg = await createAuthRequestMessage(authMsg);

    this.ws.send(authRequestMsg);

    // this.ws.onmessage = async (event) => {
    //   try {
    //     const message = parseRPCResponse(event.data);
    //     console.log("message", message);
    //     switch (message.method) {
    //       case RPCMethod.AuthChallenge:
    //         console.log("Received auth chg");
    //         const eipSigner = createEIP712AuthMessageSigner(
    //           client,
    //           {
    //             scope: authMsgInner.scope!,
    //             application: authMsgInner.application!,
    //             participant: authMsgInner.participant,
    //             expire: authMsgInner.expire!,
    //             allowances: [],
    //           },
    //           {
    //             name: "some-domain",
    //           }
    //         );

    //         console.log(eipSigner);
    //         console.log({
    //           allowances: authMsgInner.allowances.map((x) => ({
    //             asset: x.symbol,
    //             amount: x.amount,
    //           })),
    //           application: authMsgInner.application!,
    //           expire: authMsgInner.expire!,
    //           participant: authMsgInner.participant,
    //           scope: authMsgInner.scope!,
    //         });

    //         const authVerifyMessage = await createAuthVerifyMessage(
    //           eipSigner,
    //           message
    //         );

    //         ws.send(authVerifyMessage);
    //         console.log("sended");
    //         break;
    //       case RPCMethod.AuthVerify:
    //         console.log("Authentificated!");
    //         console.log(message.params.jwtToken);

    //         // Create and send the ledger balances request
    //         let getLedgerBalancesRequest = await createGetLedgerBalancesMessage(
    //           messageSigner,
    //           wallet.address
    //         );

    //         ws.send(getLedgerBalancesRequest);
    //         break;
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };

    // this.ws.onerror = (err) => {
    //   console.log("ERROR:");
    //   console.log(err);
    // };
  }

  async messageSigner(payload : RequestData | ResponsePayload): Promise<Hex> {
    try {
      const wallet = new ethers.Wallet(this.serverKeypair);
      const messageBytes = ethers.utils.arrayify(ethers.utils.id(JSON.stringify(payload)));
      const flatSignature = await wallet._signingKey().signDigest(messageBytes);
      const signature = ethers.utils.joinSignature(flatSignature);
      return signature as Hex;
    }
    catch (error) {
      console.error('Error signing message: ', error);
      throw error;
    }
  }

  async createAppSession(participantA, participantB, serverKey: PrivateKeyAccount, user: Address) {
    try {
      console.log(`Creating an app session between ${participantA} and ${participantB}`);
      const messageSigner = async (payload) => {
        try {
          const message = JSON.stringify(payload);
          const digestHex = ethers.utils.id(message);
          const messageBytes = ethers.utils.arrayify(digestHex);
          const { serialized: signature } = messageSigner(messageBytes);
          return signature;
        }
        catch (error) {
          console.error("Error signing message: ", error);
          throw error;
        }
      };
      const AppDefinition = {
        protocol: "nitroliterpc",
        participants: [participantA, participantB],
        weights: [0, 100],
        quorum: 100,
        challenge: 0,
        nonce: Date.now(),
      };
      const amount = '1000000';
      const allocations = [
        {
          participant: participantA,
          asset: 'usdc',
          amount: amount,
        },
        {
          participant: participantB,
          asset: 'usdc',
          amount: 0,
        },
      ];
      const signedMessage = await createAppSessionMessage(
        messageSigner,
        [
          {
            definition: AppDefinition,
            allocations: allocations,
          },
        ]
      );

      return new Promise((resolve, reject) => {
        const handleAppSessionResponse = (data) => {
          try {
            const rawData = typeof data === 'string' ? data : data.toString();
            const message = JSON.parse(rawData);
            
            console.log('Received app session creation response:', message);
            
            // Check if this is an app session response
            if (message.res && 
                (message.res[1] === 'create_app_session' || 
                 message.res[1] === 'app_session_created')) {
              // Remove the listener once we get the response
              this.ws.removeEventListener('message', handleAppSessionResponse);
              
              // Extract app session ID from response
              const appSessionId = message.res[2]?.[0]?.app_session_id;
              if (!appSessionId) {
                reject(new Error('Failed to get app session ID from response'));
                return;
              }
              
              resolve(appSessionId);
            }
            
            // Check for error responses
            if (message.err) {
              this.ws.removeEventListener('message', handleAppSessionResponse);
              reject(new Error(`Error ${message.err[1]}: ${message.err[2]}`));
            }
          } catch (error) {
            console.error('Error handling app session response:', error);
          }
        };
      })

    }
    catch (error) {
      console.error('Error creating app session: ', error);
      throw error;
    }
  }
}
