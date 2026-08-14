import {
  Allowance,
  AppSessionAllocation,
  AuthRequest,
  AuthVerifyRPCResponseParams,
  CloseAppSessionRequest,
  CloseAppSessionRPCResponseParams,
  createAppSessionMessage,
  CreateAppSessionRPCResponseParams,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createAuthVerifyMessageWithJWT,
  createCloseAppSessionMessage,
  createEIP712AuthMessageSigner,
  generateRequestId,
  getCurrentTimestamp,
  NitroliteRPC,
  parseRPCResponse,
  RequestData,
  ResponsePayload,
  RPCMethod,
} from "@erc7824/nitrolite";
import { ethers, Wallet } from "ethers";
import { createWalletClient, Hex, http, RpcError } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

export const DEFAULT_APPNAME = "THENEEDIFY";
export const DUMMY_APPLICATION = Wallet.createRandom().address;
export const YELLOW_NODE = "wss://clearnet.yellow.com/ws";

type Participant = {
  eoaWallet: Wallet;
  sessionWallet: Wallet;
  asset: string; // Can be deleted, because we dont use it
  amount: number;
};


function getHexFromZalupaFrontend (payload: RequestData | ResponsePayload) {
  try {
    const messageBytes = ethers.utils.arrayify(
      ethers.utils.id(JSON.stringify(payload))
    );
    return messageBytes;
  }
  catch (error) {
    throw error;
  }
}


function createMessageSigner(wallet: Wallet) {
  return async (payload: RequestData | ResponsePayload): Promise<Hex> => {
    try {
      const messageBytes = ethers.utils.arrayify(
        ethers.utils.id(JSON.stringify(payload))
      );

      const flatSignature = await wallet._signingKey().signDigest(messageBytes);
      console.log(flatSignature, "\n\n");
      const signature = ethers.utils.joinSignature(flatSignature);
      console.log(signature);
      return signature as Hex;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  };
}

/**
 *
 * @param userWallet - wallet, which holds tokens
 * @param sessionKey - session wallet, which sign the transactions
 * @param jwtTokenExpire - in hours
 * @param allowances - {asset: count}
 * @param nodeAddress - optional, because
 */
export async function authUser(
  userWallet: Wallet,
  sessionKey: Wallet,
  jwtTokenExpire: number,
  allowances: Array<Allowance>,
  nodeAddress: string = YELLOW_NODE
): Promise<AuthVerifyRPCResponseParams> {
  const userWalletClient = createWalletClient({
    account: privateKeyToAccount(userWallet.privateKey as Hex),
    transport: http(),
    chain: mainnet,
  });

  const authRequest: AuthRequest = {
    wallet: userWallet.address as `0x${string}`,
    participant: sessionKey.address as `0x${string}`,
    app_name: DEFAULT_APPNAME,
    application: DUMMY_APPLICATION as `0x${string}`,
    allowances: allowances,
    expire: jwtTokenExpire.toString(),
    scope: "console",
  };

  const authRequestMessage = await createAuthRequestMessage(authRequest);

  return new Promise((response) => {
    const ws = new WebSocket(nodeAddress);

    ws.onopen = () => {
      console.log("onopen");
      ws.send(authRequestMessage);
    };

    ws.onmessage = async (event) => {
      //   console.log(event.data);
      try {
        const message = parseRPCResponse(event.data);

        if (message.method === RPCMethod.AuthChallenge) {
          const eipMessageSigner = createEIP712AuthMessageSigner(
            userWalletClient,
            {
              scope: authRequest.scope!,
              application: authRequest.application!,
              participant: authRequest.participant!,
              expire: authRequest.expire!,
              allowances: allowances.map((x) => ({
                asset: x.symbol, // TODO: Ensure correctness
                amount: x.amount,
              })),
            },
            {
              name: DEFAULT_APPNAME,
            }
          );

          const authVerifyMessage = await createAuthVerifyMessage(
            eipMessageSigner,
            message
          );

          ws.send(authVerifyMessage);
        } else if (message.method === RPCMethod.AuthVerify) {
          //   console.log(event);
          ws.close();
          response(message.params);
        }
      } catch (err) {}
    };
  });
}

/**
 * 
 * @param participantA - has 100 vote weight
 * @param participantB - has 0 vote weight
 * @param jwt -- last valid JWT
 * @param nodeAddress -- by deault, DEFAULT
 * @returns     
 */
export async function createApplicationSession(
  participantA: Participant,
  participantB: Participant,
  jwt: string,
  nodeAddress: string = YELLOW_NODE
): Promise<CreateAppSessionRPCResponseParams> {
  return new Promise(async (resolve) => {
    const appDefinition = {
      protocol: "nitroliterpc",
      participants: [
        participantA.sessionWallet.address,
        participantB.sessionWallet.address,
      ],
      weights: [100, 0],
      quorum: 100,
      challenge: 0, // Challenge period
      nonce: Date.now(), // Unique identifier
    };

    const allocations = [
      {
        participant: participantA.eoaWallet.address,
        asset: "usdc",
        amount: participantA.amount,
      },
      {
        participant: participantB.eoaWallet.address,
        asset: "usdc",
        amount: participantB.amount,
      },
    ];

    const params = [
      {
        definition: appDefinition,
        allocations: allocations,
      },
    ];

    // Next lines is workaround, because we need multiple signatures
    const requestId = generateRequestId();
    const timestamp = getCurrentTimestamp();

    const request = NitroliteRPC.createRequest(
      requestId,
      RPCMethod.CreateAppSession,
      params,
      timestamp
    );
    const signedRequest = await NitroliteRPC.signRequestMessage(
      request,
      createMessageSigner(participantA.sessionWallet)
    );

    const counterpartyRequest = NitroliteRPC.createRequest(
      requestId,
      RPCMethod.CreateAppSession,
      params,
      timestamp
    );
    const counterpartySignedRequest = await NitroliteRPC.signRequestMessage(
      counterpartyRequest,
      createMessageSigner(participantB.sessionWallet)
    );

    if (
      signedRequest.sig == undefined ||
      counterpartySignedRequest.sig == undefined
    ) {
      throw new Error("Sig missed");
    }

    signedRequest.sig = [
      signedRequest.sig[0] as `0x${string}`,
      counterpartySignedRequest.sig[0] as `0x${string}`,
    ];

    const signedMessage = JSON.stringify(signedRequest);

    // Send the signed message to the ClearNode
    const ws = new WebSocket(nodeAddress);

    ws.onopen = async () => {
      console.log("Send ipso");
      const authRequestMsg = await createAuthVerifyMessageWithJWT(
        jwt // JWT token for reconnection
      );
      ws.send(authRequestMsg);
      ws.send(signedMessage);
    };

    ws.onmessage = (event) => {
      try {
        const message = parseRPCResponse(event.data);
        console.log(message);

        if (message.method === RPCMethod.AuthVerify) {
          console.log("Auth successful");
        } else if (message.method === RPCMethod.CreateAppSession) {
          ws.close();
          resolve(message.params);
        }
      } catch (err) {}
    };

    ws.onerror = (err) => {
      console.log("ERROR: ", err);
    };
  });
}

// FIXME: signatures are incorrect
export async function closeApplicationSession(
  appSessionId: string,
  participantA: Participant,
  participantB: Participant,
  jwt: string,
  nodeAddress: string = YELLOW_NODE
): Promise<CloseAppSessionRPCResponseParams> {
  return new Promise(async (resolve) => {
    const allocations: AppSessionAllocation[] = [
      {
        participant: participantA.eoaWallet.address as `0x${string}`,
        asset: "usdc",
        amount: participantA.amount.toString(),
      },
      {
        participant: participantB.eoaWallet.address as `0x${string}`,
        asset: "usdc",
        amount: participantB.amount.toString(),
      },
    ];

    const closeRequest: CloseAppSessionRequest = {
      app_session_id: appSessionId as `0x${string}`, // Name conventions included)
      allocations: allocations,
    };

    const signedMessage = await createCloseAppSessionMessage(
      createMessageSigner(participantA.sessionWallet),
      [closeRequest]
    );

    const ws = new WebSocket(nodeAddress);

    ws.onopen = async () => {
      console.log("Send close ipso");
      const authRequestMsg = await createAuthVerifyMessageWithJWT(
        jwt // JWT token for reconnection
      );
      ws.send(authRequestMsg);
      ws.send(signedMessage);
    };

    ws.onmessage = (event) => {
      try {
        const message = parseRPCResponse(event.data);
        console.log(message);

        if (message.method === RPCMethod.AuthVerify) {
          console.log("Auth successful");
        } else if (message.method === RPCMethod.CloseAppSession) {
          ws.close();
          resolve(message.params);
        }
      } catch (err) {}
    };

    ws.onerror = (err) => {
      console.log("ERROR: ", err);
    };
  });
}
