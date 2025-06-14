// import {
//   AuthRequest,
//   AuthVerifyRPCResponseParams,
//   createAuthRequestMessage,
//   createAuthVerifyMessage,
//   createEIP712AuthMessageSigner,
//   parseRPCResponse,
//   RPCMethod,
// } from "@erc7824/nitrolite";
// import { createWalletClient, http } from "viem";
// import { mainnet } from "viem/chains";
// import { createAppSessionMessage, MessageSigner, RequestData, ResponsePayload } from "@erc7824/nitrolite";
// import { Address, PrivateKeyAccount, Hex, toBytes} from "viem";
// import { ethers} from 'ethers';
// import { toUtf8Bytes } from "ethers/lib/utils";

// export class YellowClient {
//   private ws: WebSocket;
//   // private serverKeypair: PrivateKeyAccount; // wallet
//   private serverKeypair: ethers.Wallet; // wallet
//   private sessionKey: ethers.Wallet; // participant
//   private connection: Promise<boolean>;

//   constructor (
//     endpoint: string,
//     serverKeypair: ethers.Wallet,
//     sessionKey: ethers.Wallet
//   ) {
//     this.ws = new WebSocket(endpoint);
//     this.serverKeypair = serverKeypair;
//     this.sessionKey = sessionKey;
//     console.log("Constructed");

//     this.connection = new Promise((resolve) => {
//       this.ws.onopen = () => {
//         console.log("connected");
//         resolve(true);
//       };
//     });

//     this.ws.onerror = (err) => {
//       console.log("ERROR: ", err);
//     };
//   }

//   async ensureConnection() {
//     return await this.connection;
//   }

//   async authentificate(expireHour: number) {
//     await this.connection;
//     const authMsg: AuthRequest = {
//       wallet: this.serverKeypair.address,
//       participant: this.serverKeypair.address,
//       app_name: "yellow-client",
//       expire: String(expireHour), // 1 hour expiration
//       scope: "console",
//       application: this.sessionKey.address,
//       allowances: [],
//     };

//     const walletClient = createWalletClient({
//       account: this.serverKeypair,
//       chain: mainnet,
//       transport: http(),
//     });

//     const authRequestMsg = await createAuthRequestMessage(authMsg);

//     let promise = new Promise<AuthVerifyRPCResponseParams>((resolve) => {
//       this.ws.onmessage = async (event) => {
//         try {
//           const message = parseRPCResponse(event.data);
//           console.log("Parsed message:", message);
//           switch (message.method) {
//             case RPCMethod.AuthChallenge:
//               console.log("Auth challenge received");
//               const messageEipSigner = createEIP712AuthMessageSigner(
//                 walletClient,
//                 {
//                   scope: authMsg.scope!,
//                   application: authMsg.application!,
//                   participant: authMsg.participant,
//                   expire: authMsg.expire!,
//                   allowances: authMsg.allowances.map(a => ({
//                     asset: a.symbol,
//                     amount: a.amount,
//                   })),
//                 },
//                 {
//                   name: "yellow-client",
//                 }
//               );

//               const authVerifyMessage = await createAuthVerifyMessage(
//                 messageEipSigner,
//                 message
//               );

//               this.ws.send(authVerifyMessage);
//               console.log("Auth verify message sent");
//               break;
//             case RPCMethod.AuthVerify:
//               console.log("Auth verification received");
//               resolve(message.params);
//               break;
//             default:
//               console.log("Unhandled message type:", message.method);
//           }
//         } catch (err) {
//           console.error("Error handling message:", err);
//         }
//       };
//     });

//     this.ws.send(authRequestMsg);
//     console.log("Auth request message sent");

//     return promise;
//   }

//   // async messageSigner(payload : RequestData | ResponsePayload): Promise<Hex> {
//   //   try {
//   //     const wallet = this.serverKeypair;
//   //     const messageBytes = ethers.utils.arrayify(ethers.utils.id(JSON.stringify(payload)));
//   //     const flatSignature = await wallet._signingKey().signDigest(messageBytes);
//   //     const signature = ethers.utils.joinSignature(flatSignature);
//   //     return signature as Hex;
//   //   }
//   //   catch (error) {
//   //     console.error('Error signing message: ', error);
//   //     throw error;
//   //   }
//   // }

//   // async messageSigner(payload: RequestData | ResponsePayload): Promise<Hex> {
//   //   try {
//   //     const wallet = this.serverKeypair;
  
//   //     const messageString = JSON.stringify(payload);
//   //     // const messageBytes = ethers.utils.toUtf8Bytes(messageString);
//   //     console.log(messageString);
//   //     // const signature = await wallet.signMessage(messageBytes); // <- standard way
//   //     // const signature = await wallet.signMessage(ethers.utils.arrayify(messageString));
//   //     // const signature = await wallet.signMessage(toUtf8Bytes(messageString));
//   //     const signature = await wallet.signMessage( { messageString } );
//   //     return signature as Hex;
//   //   } catch (error) {
//   //     console.error('Error signing message: ', error);
//   //     throw error;
//   //   }
//   // }

//   async messageSigner(payload: RequestData | ResponsePayload): Promise<Hex> {
//     try {
//       const wallet = this.serverKeypair;
  
//       const messageString = JSON.stringify(payload);
//       console.log(messageString);
  
//       const signature = await wallet.signMessage({ message: messageString });
//       return signature as Hex;
//     } catch (error) {
//       console.error('Error signing message: ', error);
//       throw error;
//     }
//   }


//   async createAppSession(participantA: ethers.Wallet, participantB: ethers.Wallet  /*, serverKey: PrivateKeyAccount, user: Address*/ ) {
//     try {
//       console.log(`Creating an app session between ${participantA.address} and ${participantB.address}`);
//       // const messageSigner = async (payload) => {
//       //   try {
//       //     const message = JSON.stringify(payload);
//       //     const digestHex = ethers.utils.id(message);
//       //     const messageBytes = ethers.utils.arrayify(digestHex);
              
//           // const { serialized: signature } = await this.messageSigner(messa geBytes);
//       //     return signature;
          
//       //     // const signedMessage = await createAppSessionMessage(this.messageSigner, [
//       //     //   {
//       //     //     definition: AppDefinition,
//       //     //     allocations: allocations,
//       //     //   },
//       //     // ]); 
//       //     // return signedMessage;
        
//       //   }
//       //   catch (error) {
//       //     console.error("Error signing message: ", error);
//       //     throw error;
//       //   }
//       // };
//       const AppDefinition = {
//         protocol: "nitroliterpc",
//         participants: [participantA.address, participantB.address],
//         weights: [0, 100],
//         quorum: 100,
//         challenge: 0,
//         nonce: Date.now(),
//       };
//       const amount = '1000000';
//       const allocations = [
//         {
//           participant: participantA.address,
//           asset: 'usdc',
//           amount: amount,
//         },
//         {
//           participant: participantB.address,
//           asset: 'usdc',
//           amount: 0,
//         },
//       ];
//       // const signedMessage = await createAppSessionMessage(
//       //   this.messageSigner,
//       //   [
//       //     {
//       //       definition: AppDefinition,
//       //       allocations: allocations,
//       //     },
//       //   ]
//       // );

//       const signedMessage = await createAppSessionMessage(
//         this.messageSigner.bind(this), // ✅ fixes context
//         [
//           {
//             definition: AppDefinition,
//             allocations: allocations,
//           },
//         ]
//       );
//       console.log("1");

//       return new Promise<string>((resolve, reject) => {
//         const handleAppSessionResponse = (event: MessageEvent) => {
//           try {
//             const rawData = typeof event.data === 'string' ? event.data : event.data.toString();
//             const message = JSON.parse(rawData);
      
//             console.log("2");
//             console.log('Received app session creation response:', message);
      
//             if (message.res &&
//                 (message.res[1] === 'create_app_session' || message.res[1] === 'app_session_created')) {
//               this.ws.removeEventListener('message', handleAppSessionResponse);
      
//               const appSessionId = message.res[2]?.[0]?.app_session_id;
//               if (!appSessionId) {
//                 reject(new Error('Failed to get app session ID from response'));
//                 return;
//               }
//               resolve(appSessionId);
//             }
      
//             console.log("3");
//             if (message.err) {
//               this.ws.removeEventListener('message', handleAppSessionResponse);
//               reject(new Error(`Error ${message.err[1]}: ${message.err[2]}`));
//             }
//           } catch (error) {
//             console.error('Error handling app session response:', error);
//             reject(error);
//           }
//         };
      
//         // ✅ This line was missing
//         this.ws.addEventListener('message', handleAppSessionResponse);
      
//         // ✅ Send signed message to initiate session
//         this.ws.send(JSON.stringify(signedMessage));
//       });
      
//       // return new Promise((resolve, reject) => {
//       //   const handleAppSessionResponse = (data) => {
//       //     try {
//       //       const rawData = typeof data === 'string' ? data : data.toString();
//       //       const message = JSON.parse(rawData);
//       //       console.log("2");
//       //       console.log('Received app session creation response:', message);
            
//       //       // Check if this is an app session response
//       //       if (message.res && 
//       //           (message.res[1] === 'create_app_session' || 
//       //            message.res[1] === 'app_session_created')) {
//       //         // Remove the listener once we get the response
//       //         this.ws.removeEventListener('message', handleAppSessionResponse);
              
//       //         // Extract app session ID from response
//       //         const appSessionId = message.res[2]?.[0]?.app_session_id;
//       //         if (!appSessionId) {
//       //           reject(new Error('Failed to get app session ID from response'));
//       //           return;
//       //         }
//       //         resolve(appSessionId);
//       //         // return appSessionId;
//       //       }
            
//       //       console.log("3");
//       //       // Check for error responses
//       //       if (message.err) {
//       //         this.ws.removeEventListener('message', handleAppSessionResponse);
//       //         reject(new Error(`Error ${message.err[1]}: ${message.err[2]}`));
//       //       }
//       //     } catch (error) {
//       //       console.error('Error handling app session response:', error);
//       //     }
//       //   };
//       //   this.ws.addEventListener('message', handleAppSessionResponse);
//       // });

//     }
//     catch (error) {
//       console.error('Error creating app session: ', error);
//       throw error;
//     }
//   }
  
// }



import {
  AuthRequest,
  AuthVerifyRPCResponseParams,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  parseRPCResponse,
  RPCMethod,
} from "@erc7824/nitrolite";
import { createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { createAppSessionMessage, MessageSigner, RequestData, ResponsePayload } from "@erc7824/nitrolite";
import { Address, PrivateKeyAccount, Hex } from "viem";
import { ethers } from 'ethers';

export class YellowClient {
  private ws: WebSocket;
  private serverKeypair: PrivateKeyAccount; // Use viem account consistently
  private sessionKey: PrivateKeyAccount; // Use viem account consistently
  private connection: Promise<boolean>;

  constructor (
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

  async authenticate(expireHour: number) {
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
          console.error("Error handling message:", err);
        }
      };
    });

    this.ws.send(authRequestMsg);
    console.log("Auth request message sent");

    return promise;
  }

  

  async messageSigner(payload: RequestData | ResponsePayload): Promise<Hex> {
    try {
      const walletClient = createWalletClient({
        account: this.serverKeypair,
        chain: mainnet,
        transport: http(),
      });

      const messageString = JSON.stringify(payload);
      console.log("Signing message:", messageString);

      const signature = await walletClient.signMessage({ 
        message: messageString,
        account: this.serverKeypair 
      });
      
      return signature as Hex;
    } catch (error) {
      console.error('Error signing message: ', error);
      throw error;
    }
  }

  async createAppSession(participantA: PrivateKeyAccount, participantB: PrivateKeyAccount) {
    try {
      console.log(`Creating an app session between ${participantA.address} and ${participantB.address}`);
      
      const AppDefinition = {
        protocol: "nitroliterpc",
        participants: [participantA.address, participantB.address],
        weights: [50, 50], // More balanced weights
        quorum: 100,
        challenge: 0,
        nonce: Date.now(),
      };
      
      const amount = '1000000';
      const allocations = [
        {
          participant: participantA.address,
          asset: 'usdc',
          amount: amount,
        },
        {
          participant: participantB.address,
          asset: 'usdc',
          amount: '0', // Keep as string for consistency
        },
      ];

      const sessionData = [
        {
          definition: AppDefinition,
          allocations: allocations,
        },
      ];

      console.log("Session data:", JSON.stringify(sessionData, null, 2));

      const signedMessage = await createAppSessionMessage(
        this.messageSigner.bind(this),
        sessionData
      );
      
      console.log("Signed message created:", JSON.stringify(signedMessage, null, 2));

      return new Promise<string>((resolve, reject) => {
        // Set up timeout
        const timeout = setTimeout(() => {
          reject(new Error('App session creation timeout'));
        }, 30000);

        const handleAppSessionResponse = (event: MessageEvent) => {
          try {
            const rawData = typeof event.data === 'string' ? event.data : event.data.toString();
            console.log("Raw response:", rawData);
            
            let message;
            try {
              message = JSON.parse(rawData);
            } catch (parseErr) {
              console.log("Failed to parse as JSON, trying RPC response parser");
              message = parseRPCResponse(rawData);
            }

            console.log('Received app session response:', JSON.stringify(message, null, 2));

            // Handle successful response
            if (message.res) {
              const [requestId, method, params, timestamp] = message.res;
              
              if (method === 'create_app_session' || method === 'app_session_created') {
                clearTimeout(timeout);
                this.ws.removeEventListener('message', handleAppSessionResponse);

                const appSessionId = params?.[0]?.app_session_id || params?.[0]?.id;
                if (appSessionId) {
                  resolve(appSessionId);
                } else {
                  reject(new Error('Failed to get app session ID from response'));
                }
                return;
              }
            }

            // Handle error response
            if (message.err || (message.method === 'error')) {
              clearTimeout(timeout);
              this.ws.removeEventListener('message', handleAppSessionResponse);
              
              const errorMsg = message.err
                ? `Error ${message.err[1]}: ${JSON.stringify(message.err[2])}`
                : `Error: ${JSON.stringify(message.params)}`;

              reject(new Error(`App session creation failed: ${errorMsg}`));
              return;
            }

          } catch (error) {
            console.error('Error handling app session response:', error);
            clearTimeout(timeout);
            reject(error);
          }
        };

        this.ws.addEventListener('message', handleAppSessionResponse);
        
        console.log("Sending app session message:", JSON.stringify(signedMessage));
        this.ws.send(JSON.stringify(signedMessage));
      });

    } catch (error) {
      console.error('Error creating app session: ', error);
      throw error;
    }
  }
}
