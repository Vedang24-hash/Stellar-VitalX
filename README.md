# VitalX - Decentralized Health Records

Blockchain-based health records management system built on Stellar with IPFS storage.

## Features

- Blockchain storage on Stellar testnet
- Decentralized file storage via IPFS (Pinata)
- Freighter wallet integration
- Immutable ownership proof

## Tech Stack

- React + Vite
- Stellar (Soroban smart contracts)
- IPFS (Pinata)
- Freighter Wallet

## Prerequisites

- Node.js v16+
- Stellar CLI
- Freighter Wallet extension
- Pinata account

## Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_CONTRACT_ID=CDJKZ2AXQ7GX5UDJUCR3AC3B3IYZ6SELRKEGFJ7IYYIUMLWLZWJM5L4O
```

3. **Get Pinata JWT**
   - Sign up at https://pinata.cloud
   - Create API key with `pinFileToIPFS` permission
   - Copy JWT token to `.env`

## Deploy Smart Contract (Optional)

To deploy your own contract:

```powershell
.\deploy-contract.ps1
```

The script will:
- Configure Stellar testnet
- Create deployer identity
- Deploy contract
- Update `.env` automatically

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Usage

1. **Connect Wallet** - Click "Connect Wallet" and approve in Freighter
2. **Upload File** - Select file → Confirm → Sign transaction in Freighter
3. **View Records** - All uploaded records appear in dashboard

## How It Works

1. File uploads to IPFS (decentralized storage)
2. IPFS hash recorded on Stellar blockchain
3. User signs transaction and pays gas fees
4. Ownership permanently recorded on-chain

## Smart Contract

**Contract ID**: `CDJKZ2AXQ7GX5UDJUCR3AC3B3IYZ6SELRKEGFJ7IYYIUMLWLZWJM5L4O`

**Functions**:
- `upload_record` - Store record reference
- `get_record` - Retrieve by ID
- `get_records_by_uploader` - Get user's records
- `record_count` - Total records

**Explorer**: https://stellar.expert/explorer/testnet/contract/CDJKZ2AXQ7GX5UDJUCR3AC3B3IYZ6SELRKEGFJ7IYYIUMLWLZWJM5L4O

## Network

- **Network**: Stellar Testnet
- **RPC**: https://soroban-testnet.stellar.org
- **Passphrase**: `Test SDF Network ; September 2015`

## Project Structure

```
├── contracts/          # Rust smart contract
├── src/
│   ├── pages/         # React components
│   ├── services/      # Blockchain & IPFS logic
│   └── styles/        # CSS
├── deploy-contract.ps1
└── .env               # Configuration
```

## License

MIT
