# VitalX — Decentralized Health Records

VitalX is a Web3 health records platform where patients upload medical files to IPFS and record ownership permanently on the Stellar blockchain. No central server holds your data.

---

## How It Works

1. Connect your **Freighter** wallet
2. Upload a health record (PDF, image, doc)
3. File is stored on **IPFS** via Pinata
4. The IPFS hash is written to a **Soroban smart contract** on Stellar testnet
5. You sign the transaction — ownership is yours, on-chain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Wallet | Freighter (Stellar) |
| Blockchain | Stellar Testnet + Soroban |
| Smart Contract | Rust (soroban-sdk) |
| File Storage | IPFS via Pinata |

---

## Getting Started

### Prerequisites
- Node.js v16+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- [Pinata](https://pinata.cloud) account (for IPFS uploads)

### Install

```bash
npm install
```

### Configure `.env`

```env
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_CONTRACT_ID=CCPDOVHLBFUJUVP4LXGIDC73OEVJAXKKXGXB3SRWJMNGG3XL7NJZKXSQ
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

Get your Pinata JWT from [app.pinata.cloud](https://app.pinata.cloud) → API Keys → New Key (enable `pinFileToIPFS`).

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Smart Contract

- **Contract ID**: `CCPDOVHLBFUJUVP4LXGIDC73OEVJAXKKXGXB3SRWJMNGG3XL7NJZKXSQ`
- **Network**: Stellar Testnet
- **Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCPDOVHLBFUJUVP4LXGIDC73OEVJAXKKXGXB3SRWJMNGG3XL7NJZKXSQ)

Functions: `upload_record` · `get_record` · `get_records_by_uploader` · `record_count`

### Deploy Your Own Contract

```powershell
.\deploy-contract.ps1
```

The script handles identity setup, testnet funding check, build, deploy, and `.env` update automatically.

---

## Project Structure

```
├── contracts/              # Rust Soroban smart contract
│   └── src/lib.rs
├── src/
│   ├── pages/              # React pages (landing, login, dashboard)
│   ├── services/           # Stellar, Pinata, Supabase integrations
│   └── styles/             # CSS
├── deploy-contract.ps1     # One-click deployment script
└── .env                    # Local config (not committed)
```

---

## License

MIT
