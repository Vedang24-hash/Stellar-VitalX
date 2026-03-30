# VitalX — Decentralized Health Records

VitalX is a Web3 health records platform where patients upload medical files to IPFS and record ownership permanently on the Stellar blockchain. No central server holds your data.

---

## Live Demo

Deployed on Vercel: [stellar-vitalx.vercel.app](https://stellar-vitalx.vercel.app)

---

## How It Works

1. Connect your Freighter wallet
2. Upload a health record (PDF, image, doc)
3. File is stored on IPFS via Pinata
4. The IPFS hash is written to a Soroban smart contract on Stellar testnet
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
| Deployment | Vercel |
| CI/CD | GitHub Actions |

---

## CI/CD Pipeline

The pipeline is defined in `.github/workflows/frontend-ci-cd.yml` and runs automatically on every push or pull request to `main`.

**What it does:**
- Checks out the code
- Sets up Node.js 20
- Runs `npm ci` to install dependencies
- Runs `npm run build` with production env vars injected from GitHub Secrets
- Fails the pipeline if the build breaks, blocking bad code from reaching production

**Vercel CD:**
Vercel is connected directly to this GitHub repo. Every push to `main` that passes the CI build triggers an automatic production deployment. Pull requests get isolated preview deployments automatically.

**GitHub Secrets required:**
- `VITE_PINATA_JWT`
- `VITE_CONTRACT_ID`

---

## Mobile Responsive UI

The entire UI is built mobile-first with CSS media queries at `640px` and `768px` breakpoints:

- Navbar collapses and stacks cleanly on small screens
- Hero section text scales down for readability
- Feature cards switch to single-column layout
- Patient dashboard header stacks vertically
- Records table transforms into labeled card rows instead of overflowing horizontally
- All buttons go full-width on mobile
- Viewport meta tag ensures correct scaling on all devices

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

---

## Project Structure

```
├── .github/workflows/
│   ├── frontend-ci-cd.yml  # Frontend CI pipeline
│   └── build-contract.yml  # Smart contract build
├── contracts/              # Rust Soroban smart contract
├── src/
│   ├── pages/              # React pages (landing, login, dashboard)
│   ├── services/           # Stellar, Pinata, Supabase integrations
│   └── styles/             # Responsive CSS
├── deploy-contract.ps1     # One-click contract deployment
└── .env                    # Local config (not committed)
```

---

## License

MIT
