import { createPublicClient, createWalletClient, http, parseEther, type WalletClient } from 'viem';
import { base } from 'viem/chains';

// USDC contract address on Base
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const SERVER_WALLET_ADDRESS = '0x66989a799FC51d889F6df8F9c56eD2Cb3c48984D';

// USDC ABI - only the functions we need
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

export async function transferUSDC(
  fromAddress: `0x${string}`,
  amount: number,
  walletClient: WalletClient
): Promise<`0x${string}`> {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });

    // Convert amount to USDC decimals (6 decimals)
    const amountInUSDC = BigInt(Math.floor(amount * 1e6));

    // Check balance
    const balance = await publicClient.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [fromAddress]
    });

    console.log("Amount in USDC", balance);

    // if (balance < amountInUSDC) {
    //   throw new Error('Insufficient USDC balance');
    // }

    // Prepare the transaction
    const { request } = await publicClient.simulateContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [SERVER_WALLET_ADDRESS, amountInUSDC],
      account: fromAddress
    });

    // Send the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for transaction confirmation
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    console.error('Error transferring USDC:', error);
    throw error;
  }
} 