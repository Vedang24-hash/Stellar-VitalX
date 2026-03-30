import {
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
  isConnected,
  isAllowed
} from "@stellar/freighter-api";

/**
 * Check if Freighter is installed (async — uses the official API)
 */
export const isFreighterInstalled = async () => {
  try {
    const result = await isConnected();
    // v6 returns { isConnected: bool }, older versions return bool directly
    if (typeof result === 'object' && result !== null) {
      return result.isConnected === true;
    }
    return result === true;
  } catch {
    return false;
  }
};

/**
 * Connect to Freighter Wallet
 * This will trigger the Freighter popup for user approval
 */
export const connectWallet = async () => {
  try {
    console.log("🔄 Connecting to Freighter...");

    // Bail early if extension isn't installed
    const installed = await isFreighterInstalled();
    if (!installed) {
      throw new Error("Freighter is not installed");
    }

    // Request access — triggers the Freighter popup
    const accessGranted = await Promise.race([
      requestAccess(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Freighter is not installed")), 8000)
      ),
    ]);
    
    if (!accessGranted) {
      throw new Error("Access to Freighter was denied");
    }

    // Get wallet address
    const addressResponse = await getAddress();
    
    // Extract the actual address string
    // getAddress() might return an object like { address: "G..." } or just "G..."
    let address;
    if (typeof addressResponse === 'string') {
      address = addressResponse;
    } else if (addressResponse && typeof addressResponse === 'object') {
      // Try common property names
      address = addressResponse.address || addressResponse.publicKey || addressResponse.key;
    }

    if (!address || typeof address !== 'string') {
      console.error("❌ Invalid address format:", addressResponse);
      throw new Error("Unable to fetch wallet address - invalid format");
    }

    // Store wallet locally
    localStorage.setItem("walletAddress", address);
    console.log("✅ Connected:", address);

    return address;
  } catch (error) {
    console.error("❌ Connection failed:", error);

    if (error.message?.includes("User declined") || error.message?.includes("denied")) {
      throw new Error("You rejected the connection request. Please try again and approve.");
    }

    // Re-throw as-is so callers can inspect the message (e.g. "not installed")
    throw error;
  }
};

/**
 * Disconnect Wallet
 */
export const disconnectWallet = () => {
  localStorage.removeItem("walletAddress");
  console.log("🔌 Wallet disconnected");
};

/**
 * Get saved wallet address from localStorage
 */
export const getWalletAddress = () => {
  return localStorage.getItem("walletAddress");
};

/**
 * Check if wallet is connected
 */
export const checkConnection = async () => {
  try {
    const connected = await isConnected();
    return connected;
  } catch (error) {
    console.error("Error checking connection:", error);
    return false;
  }
};

/**
 * Check if app is allowed to access Freighter
 */
export const checkAllowed = async () => {
  try {
    const allowed = await isAllowed();
    return allowed;
  } catch (error) {
    console.error("Error checking allowed:", error);
    return false;
  }
};

/**
 * Get current network (PUBLIC / TESTNET)
 */
export const getCurrentNetwork = async () => {
  try {
    const network = await getNetwork();
    console.log("🌐 Network:", network);
    return network;
  } catch (error) {
    console.error("Error getting network:", error);
    return "TESTNET";
  }
};

/**
 * Sign a transaction
 */
export const signTx = async (xdr, networkPassphrase) => {
  try {
    const network = networkPassphrase || await getNetwork();
    
    const signed = await signTransaction(xdr, {
      network,
      networkPassphrase: networkPassphrase || "Test SDF Network ; September 2015"
    });

    console.log("✅ Transaction signed");
    return signed;
  } catch (error) {
    console.error("❌ Signing failed:", error);
    throw error;
  }
};

