import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { getWalletAddress } from './stellarWallet';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = 'https://soroban-testnet.stellar.org';

const server = new StellarSdk.SorobanRpc.Server(RPC_URL);

export const isContractConfigured = () => {
  return (
    CONTRACT_ID &&
    CONTRACT_ID.length > 0 &&
    CONTRACT_ID !== 'YOUR_CONTRACT_ID'
  );
};

// ==========================
// SAFE TRANSACTION BUILDER
// ==========================

const buildAndSend = async (operation) => {
  const walletAddress = getWalletAddress();
  if (!walletAddress) throw new Error('Wallet not connected');

  const account = await server.getAccount(walletAddress);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate
  const simulated = await server.simulateTransaction(tx);

  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(simulated.error);
  }

  // Assemble transaction
  const prepared = StellarSdk.SorobanRpc
    .assembleTransaction(tx, simulated)
    .build();

  // Sign with Freighter - must pass object with networkPassphrase
  const signedXDR = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXDR,
    NETWORK_PASSPHRASE
  );

  // Send transaction
  const result = await server.sendTransaction(signedTx);

  if (result.status === 'ERROR') {
    throw new Error('Transaction submission failed');
  }

  // Wait for completion
  let txResult = await server.getTransaction(result.hash);
  while (txResult.status === 'PENDING') {
    await new Promise((r) => setTimeout(r, 1000));
    txResult = await server.getTransaction(result.hash);
  }

  if (txResult.status !== 'SUCCESS') {
    throw new Error(`Transaction failed: ${txResult.status}`);
  }

  return result;
};

// ==========================
// UPLOAD RECORD (FIXED)
// ==========================

export const uploadRecord = async (ipfsHash, label) => {
  try {
    if (!isContractConfigured()) {
      throw new Error('Smart contract not configured');
    }

    if (!ipfsHash || !label) {
      throw new Error('Invalid parameters');
    }

    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const operation = contract.call(
      'upload_record',
      StellarSdk.Address.fromString(walletAddress).toScVal(), // ✅ FIXED
      StellarSdk.nativeToScVal(ipfsHash), // ✅ FIXED
      StellarSdk.nativeToScVal(label)     // ✅ FIXED
    );

    const result = await buildAndSend(operation);

    return {
      success: true,
      transactionHash: result.hash,
    };
  } catch (error) {
    console.error('Blockchain error:', error);
    return {
      success: false,
      error: error.message || String(error),
    };
  }
};

// ==========================
// GET RECORD COUNT
// ==========================

export const getRecordCount = async () => {
  try {
    if (!isContractConfigured()) {
      return { success: true, count: 0 };
    }

    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      return { success: true, count: 0 };
    }

    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const operation = contract.call('record_count');

    const account = await server.getAccount(walletAddress);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(tx);

    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      return { success: true, count: 0 };
    }

    const result = simulated.result?.retval;
    const count = result
      ? Number(StellarSdk.scValToNative(result))
      : 0;

    return { success: true, count };
  } catch {
    return { success: true, count: 0 };
  }
};

// ==========================
// GET RECORDS BY UPLOADER
// ==========================

export const getRecordsByUploader = async (uploaderAddress) => {
  try {
    if (!isContractConfigured()) {
      return { success: true, recordIds: [] };
    }

    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      return { success: true, recordIds: [] };
    }

    const account = await server.getAccount(walletAddress);
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'get_records_by_uploader',
          StellarSdk.Address.fromString(uploaderAddress).toScVal() // ✅ FIXED
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(transaction);

    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      return { success: true, recordIds: [] };
    }

    const result = simulated.result?.retval;
    if (!result) {
      return { success: true, recordIds: [] };
    }

    const recordIds = StellarSdk.scValToNative(result);

    return {
      success: true,
      recordIds: Array.isArray(recordIds)
        ? recordIds.map(id => Number(id))
        : [],
    };
  } catch (error) {
    console.error('Error fetching records:', error?.message || error?.toString() || error);
    return { success: true, recordIds: [] };
  }
};

// ==========================
// GET RECORD
// ==========================

export const getRecord = async (recordId) => {
  try {
    if (!isContractConfigured()) {
      return { success: false, record: null };
    }

    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      return { success: false, record: null };
    }

    const account = await server.getAccount(walletAddress);
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'get_record',
          StellarSdk.nativeToScVal(recordId) // ✅ FIXED
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(transaction);

    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      return { success: false, record: null };
    }

    const result = simulated.result?.retval;
    if (!result) {
      return { success: false, record: null };
    }

    const record = StellarSdk.scValToNative(result);

    return {
      success: true,
      record: {
        id: Number(record.id),
        uploader: record.uploader,
        ipfsHash: record.ipfs_hash,
        label: record.label,
        timestamp: Number(record.timestamp),
      },
    };
  } catch (error) {
    console.error('Error fetching record:', error);
    return { success: false, record: null };
  }
};