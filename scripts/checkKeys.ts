import * as ethers from "ethers";

// TODO: Maybe automatic key set?

export const generateKeyPair = async () => {
    let ephemeralWalet = ethers.Wallet.createRandom();
    let privatekey = ethers.utils.keccak256(ethers.utils.keccak256(ephemeralWalet.privateKey));
    let wallet = new ethers.Wallet(privatekey);
    
    console.log("private key:", wallet._signingKey().privateKey);
    console.log("public key :", wallet.address);
};

generateKeyPair();