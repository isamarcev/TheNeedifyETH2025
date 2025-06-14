import { AuthRequest, createAuthRequestMessage } from "@erc7824/nitrolite";
import { Address, PrivateKeyAccount } from "viem";

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

  async createAppSession(serverKey: PrivateKeyAccount, user: Address) {}
}
