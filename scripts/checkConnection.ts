import {
  AuthRequest,
  createApplicationMessage,
  createAppSessionMessage,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  createGetLedgerBalancesMessage,
  createPingMessage,
  MessageSigner,
  parseRPCResponse,
  RequestData,
  ResponsePayload,
  RPCMethod,
} from "@erc7824/nitrolite";
import { createWalletClient, custom, getAddress, WalletClient } from "viem";
import { mainnet, polygon } from "viem/chains";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as viem from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { YellowClient } from "@/lib/yellow-wrapper";

(async () => {
  const serverPrivateKey =
    "0x39590c6f031edbe054a6a4be603680eb6b72cc29d47c56876461ffef2b35e536";
  const serverWallet = privateKeyToAccount(serverPrivateKey);

  const sessionKey =
    "0xdce59f3d1db0a761ed881d425ff4f816f8e58f59130b9f485d9e97a847cb894f";
  const sessionWallet = privateKeyToAccount(sessionKey);
  let client = new YellowClient(
    "wss://clearnet.yellow.com/ws",
    serverWallet,
    sessionWallet
  );
  await client.authentificate(10);
  console.log("\n\n\n");


  // // Initialize WebSocket connection
  // const WS_URL = "wss://clearnet.yellow.com/ws"; // Replace with your actual WebSocket server URL
  // const ws = new WebSocket(WS_URL);

  // const walletPrivatekey =
  //   "0x39590c6f031edbe054a6a4be603680eb6b72cc29d47c56876461ffef2b35e536";
  // const wallet = privateKeyToAccount(walletPrivatekey);
  // console.log(wallet);
  // const client = createWalletClient({
  //   account: wallet,
  //   chain: mainnet,
  //   transport: viem.http(),
  // });

  // // const sessionKey = ethers.Wallet.createRandom();
  // // const application = ethers.Wallet.createRandom();

  // const authMsgInner: AuthRequest = {
  //   wallet: wallet.address,
  //   participant: wallet.address,
  //   app_name: "some-domain",
  //   expire: String(1), // 1 hour expiration
  //   scope: "console",
  //   application: wallet.address,
  //   allowances: [],
  // };

  // const authRequestMsg = await createAuthRequestMessage(authMsgInner);

  // console.log("AuthMessage: ", authRequestMsg);

  // ws.onopen = () => {
  //   ws.send(authRequestMsg);
  // };

  // ws.onmessage = async (event) => {
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
  //         break;
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // ws.onerror = (err) => {
  //   console.log("ERROR:");
  //   console.log(err);
  // };
})().then(() => {});
