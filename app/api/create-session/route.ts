import { createAppSessionMessage, AppDefinition, AppSessionAllocation } from '@erc7824/nitrolite';
import { NextResponse } from 'next/server';
import { keccak256, toBytes } from 'viem';
import { wsService } from '@/app/lib/websocket';

/**
 * Create an app session
 * @param {string} participantAddress - Participant's address
 * @returns {Promise<string>} The app session ID
 */
async function createAppSession(participantAddress: `0x${string}`) {
  try {
    const serverWallet = wsService.getWallet();
    console.log(`Creating app session between ${participantAddress} and server ${serverWallet.address}`);
    
    // Message signer function
    const messageSigner = async (payload: any) => {
      try {
        const message = JSON.stringify(payload);
        const digestHex = keccak256(toBytes(message));
        const signature = await serverWallet.sign({ hash: digestHex });
        return signature;
      } catch (error) {
        console.error("Error signing message:", error);
        throw error;
      }
    };
    
    // Create app definition
    const appDefinition: AppDefinition = {
      protocol: "nitroliterpc",
      participants: [participantAddress, serverWallet.address],
      weights: [0, 100],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
    };
    
    // Define the allocations with asset type (e.g., 1 USDC with 6 decimals)
    const amount = '1000000';
    
    // Define allocations
    const allocations: AppSessionAllocation[] = [
      {
        participant: participantAddress,
        asset: 'usdc',
        amount: amount,
      },
      {
        participant: serverWallet.address,
        asset: 'usdc',
        amount: '0',
      },
    ];
    
    // Create the signed message
    const signedMessage = await createAppSessionMessage(
      messageSigner,
      [
        {
          definition: appDefinition,
          allocations: allocations,
        },
      ]
    );
    
    // Send the message and wait for response
    return new Promise((resolve, reject) => {
      if (!wsService.isReady()) {
        reject(new Error('WebSocket connection is not ready'));
        return;
      }

      // Create a one-time message handler for the app session response
      const handleAppSessionResponse = (message: any) => {
        try {
          console.log('Received app session creation response:', message);
          
          // Check if this is an app session response
          if (message.res && 
              (message.res[1] === 'create_app_session' || 
               message.res[1] === 'app_session_created')) {
            // Remove the handler once we get the response
            wsService.removeMessageHandler('create_app_session', handleAppSessionResponse);
            
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
            wsService.removeMessageHandler('create_app_session', handleAppSessionResponse);
            reject(new Error(`Error ${message.err[1]}: ${message.err[2]}`));
          }
        } catch (error) {
          console.error('Error handling app session response:', error);
        }
      };
      
      // Add the message handler
      wsService.addMessageHandler('create_app_session', handleAppSessionResponse);
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        wsService.removeMessageHandler('create_app_session', handleAppSessionResponse);
        reject(new Error('App session creation timeout'));
      }, 10000);
      
      // Send the signed message
      if (!wsService.send(signedMessage)) {
        wsService.removeMessageHandler('create_app_session', handleAppSessionResponse);
        reject(new Error('Failed to send message'));
      }
    });
  } catch (error) {
    console.error('Error creating app session:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { participantAddress } = await request.json();

    if (!participantAddress) {
      return NextResponse.json(
        { error: 'participantAddress is required' },
        { status: 400 }
      );
    }

    // Validate that address is in the correct format
    if (!participantAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Address must be in 0x format' },
        { status: 400 }
      );
    }

    const appSessionId = await createAppSession(participantAddress as `0x${string}`);

    return NextResponse.json({ appSessionId });
  } catch (error) {
    console.error('Error in create-session endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
} 