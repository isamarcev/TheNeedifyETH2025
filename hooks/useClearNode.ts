// import { useState, useEffect, useCallback } from 'react';
// import { ethers } from 'ethers';
// import { 
//   createAuthRequestMessage, 
//   createAuthVerifyMessage,
//   createGetChannelsMessage,
//   createGetLedgerBalancesMessage,
//   createGetConfigMessage,
//   generateRequestId, 
//   getCurrentTimestamp 
// } from '@erc7824/nitrolite';

// // Custom hook for ClearNode connection
// function useClearNodeConnection(clearNodeUrl, stateWallet) {
//   const [ws, setWs] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Message signer function
//   const messageSigner = useCallback(async (payload) => {
//     if (!stateWallet) throw new Error('State wallet not available');
    
//     try {
//       const message = JSON.stringify(payload);
//       const digestHex = ethers.id(message);
//       const messageBytes = ethers.getBytes(digestHex);
//       const { serialized: signature } = stateWallet.signingKey.sign(messageBytes);
//       return signature;
//     } catch (error) {
//       console.error("Error signing message:", error);
//       throw error;
//     }
//   }, [stateWallet]);
  
//   // Create a signed request
//   const createSignedRequest = useCallback(async (method, params = []) => {
//     if (!stateWallet) throw new Error('State wallet not available');
    
//     const requestId = generateRequestId();
//     const timestamp = getCurrentTimestamp();
//     const requestData = [requestId, method, params, timestamp];
//     const request = { req: requestData };
    
//     // Sign the request
//     const message = JSON.stringify(request);
//     const digestHex = ethers.id(message);
//     const messageBytes = ethers.getBytes(digestHex);
//     const { serialized: signature } = stateWallet.signingKey.sign(messageBytes);
//     request.sig = [signature];
    
//     return JSON.stringify(request);
//   }, [stateWallet]);
  
//   // Send a message to the ClearNode
//   const sendMessage = useCallback((message) => {
//     if (!ws || ws.readyState !== WebSocket.OPEN) {
//       setError('WebSocket not connected');
//       return false;
//     }
    
//     try {
//       ws.send(typeof message === 'string' ? message : JSON.stringify(message));
//       return true;
//     } catch (error) {
//       setError(`Error sending message: ${error.message}`);
//       return false;
//     }
//   }, [ws]);
  
//   // Connect to the ClearNode
//   const connect = useCallback(() => {
//     if (ws) {
//       ws.close();
//     }
    
//     setConnectionStatus('connecting');
//     setError(null);
    
//     const newWs = new WebSocket(clearNodeUrl);
    
//     newWs.onopen = async () => {
//       setConnectionStatus('connected');
      
//       // Start authentication process
//       try {
//         const authRequest = await createAuthRequestMessage(
//           messageSigner,
//           stateWallet.address
//         );
//         newWs.send(authRequest);
//       } catch (err) {
//         setError(`Authentication request failed: ${err.message}`);
//       }
//     };
    
//     newWs.onmessage = async (event) => {
//       try {
//         const message = JSON.parse(event.data);
        
//         // Handle authentication flow
//         if (message.res && message.res[1] === 'auth_challenge') {
//           try {
//             const authVerify = await createAuthVerifyMessage(
//               messageSigner,
//               message,
//               stateWallet.address
//             );
//             newWs.send(authVerify);
//           } catch (err) {
//             setError(`Authentication verification failed: ${err.message}`);
//           }
//         } else if (message.res && message.res[1] === 'auth_success') {
//           setIsAuthenticated(true);
//         } else if (message.res && message.res[1] === 'auth_failure') {
//           setIsAuthenticated(false);
//           setError(`Authentication failed: ${message.res[2]}`);
//         }
        
//         // Additional message handling can be added here
//       } catch (err) {
//         console.error('Error handling message:', err);
//       }
//     };
    
//     newWs.onerror = (error) => {
//       setError(`WebSocket error: ${error.message}`);
//       setConnectionStatus('error');
//     };
    
//     newWs.onclose = () => {
//       setConnectionStatus('disconnected');
//       setIsAuthenticated(false);
//     };
    
//     setWs(newWs);
//   }, [clearNodeUrl, messageSigner, stateWallet]);
  
//   // Disconnect from the ClearNode
//   const disconnect = useCallback(() => {
//     if (ws) {
//       ws.close();
//       setWs(null);
//     }
//   }, [ws]);
  
//   // Connect when the component mounts
//   useEffect(() => {
//     if (clearNodeUrl && stateWallet) {
//       connect();
//     }
    
//     // Clean up on unmount
//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [clearNodeUrl, stateWallet, connect]);
  
//   // Create helper methods for common operations
//   const getChannels = useCallback(async () => {
//     // Using the built-in helper function from NitroliteRPC
//     const message = await createGetChannelsMessage(
//       messageSigner,
//       stateWallet.address
//     );
//     return sendMessage(message);
//   }, [messageSigner, sendMessage, stateWallet]);
  
//   const getLedgerBalances = useCallback(async (channelId) => {
//     // Using the built-in helper function from NitroliteRPC
//     const message = await createGetLedgerBalancesMessage(
//       messageSigner,
//       channelId
//     );
//     return sendMessage(message);
//   }, [messageSigner, sendMessage]);
  
//   const getConfig = useCallback(async () => {
//     // Using the built-in helper function from NitroliteRPC
//     const message = await createGetConfigMessage(
//       messageSigner,
//       stateWallet.address
//     );
//     return sendMessage(message);
//   }, [messageSigner, sendMessage, stateWallet]);
  
//   return {
//     connectionStatus,
//     isAuthenticated,
//     error,
//     ws,
//     connect,
//     disconnect,
//     sendMessage,
//     getChannels,
//     getLedgerBalances,
//     getConfig,
//     createSignedRequest
//   };
// }

// // Example usage in a component
// function ClearNodeComponent() {
//   const stateWallet = /* your state wallet initialization */;
//   const {
//     connectionStatus,
//     isAuthenticated,
//     error,
//     getChannels
//   } = useClearNodeConnection('wss://clearnode.example.com', stateWallet);
  
//   return (
//     <div>
//       <p>Status: {connectionStatus}</p>
//       <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
//       {error && <p className="error">Error: {error}</p>}
      
//       <button 
//         onClick={getChannels} 
//         disabled={!isAuthenticated}
//       >
//         Get Channels
//       </button>
//     </div>
//   );
// }