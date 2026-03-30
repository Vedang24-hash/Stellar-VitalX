# VitalX — Decentralized Health Records

VitalX is a Web3 health records platform where patients securely upload medical files to IPFS and record permanent ownership on the Stellar blockchain. No central server holds your data — you own it.

[![CI](https://github.com/Vedang24-hash/Stellar-VitalX/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/Vedang24-hash/Stellar-VitalX/actions/workflows/frontend-ci-cd.yml)

**Live:** [stellar-vitalx.vercel.app](https://stellar-vitalx.vercel.app)

---

## Architecture & Upload Workflow

VitalX uses a two-layer storage model — the industry standard for Web3 file storage:

```
User selects file
      │
      ▼
 Pinata (IPFS)          ← file stored here, returns a content hash (CID)
      │
      ▼
 Stellar Soroban        ← CID written on-chain as an immutable ownership record
      │
      ▼
 Freighter Wallet       ← user signs the transaction, proving ownership
```

**Why this approach?**
- The blockchain does not store the file — it stores the *proof* of the file
- IPFS is content-addressed: if the file changes, the hash changes — tamper-proof by design
- Stellar handles the ownership record cheaply and fast
- This is the same pattern used by NFTs, decentralized medical records, and most Web3 storage apps

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

## Getting Started

### Prerequisites

- Node.js v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- [Pinata](https://pinata.cloud) account

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

Create a `.env` file in the root:

```env
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_CONTRACT_ID=CCPDOVHLBFUJUVP4LXGIDC73OEVJAXKKXGXB3SRWJMNGG3XL7NJZKXSQ
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

Get your Pinata JWT: [app.pinata.cloud](https://app.pinata.cloud) → API Keys → New Key → enable `pinFileToIPFS`.

> `.env` is gitignored and never committed.

---

## Smart Contract

| | |
|---|---|
| Contract ID | `CCPDOVHLBFUJUVP4LXGIDC73OEVJAXKKXGXB3SRWJMNGG3XL7NJZKXSQ` |
| Network | Stellar Testnet |
| Language | Rust (soroban-sdk) |
| Explorer | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCPDOVHLBFUJUVP4LXGIDC73OEVJAXKKXGXB3SRWJMNGG3XL7NJZKXSQ) |

**Functions:** `upload_record` · `get_record` · `get_records_by_uploader` · `record_count`

### Deploy Your Own Contract

```powershell
.\deploy-contract.ps1
```

The script configures the Stellar testnet, creates a deployer identity, deploys the contract, and updates `.env` automatically.

> New wallet accounts must be funded via [Stellar Friendbot](https://friendbot.stellar.org) before they can sign transactions on testnet.

---

## CI/CD Pipeline

Defined in `.github/workflows/frontend-ci-cd.yml`.

**Triggers:** every push and pull request to `main`

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. `npm ci` — clean dependency install
4. `npm run build` — production build with secrets injected from GitHub Secrets
5. Build failure blocks the merge — no broken code reaches production

**Continuous Deployment:**
Vercel is connected directly to this repo. Every push to `main` triggers an automatic production deployment. Pull requests get isolated preview URLs automatically.

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `VITE_PINATA_JWT` | Pinata API JWT for IPFS uploads |
| `VITE_CONTRACT_ID` | Deployed Soroban contract ID |

---

## Mobile Responsive UI

Fully responsive across all screen sizes with CSS breakpoints at `640px` and `768px`:

- Navbar stacks cleanly on small screens
- Hero section scales for readability
- Feature cards switch to single-column layout
- Dashboard header collapses vertically
- Records table becomes labeled card rows on mobile (no horizontal scroll)
- All CTAs go full-width on mobile

---

## Project Structure

```
├── .github/workflows/
│   ├── frontend-ci-cd.yml      # Frontend CI pipeline (GitHub Actions)
│   └── build-contract.yml      # Smart contract build pipeline
├── contracts/
│   └── src/lib.rs              # Rust Soroban smart contract
├── src/
│   ├── pages/                  # React pages (Landing, Login, SignUp, Dashboard)
│   ├── services/
│   │   ├── stellarContract.js  # Soroban contract interactions
│   │   ├── stellarWallet.js    # Freighter wallet connection
│   │   ├── pinataUpload.js     # IPFS file upload
│   │   └── supabaseClient.js   # Supabase client (optional fallback)
│   └── styles/                 # Responsive CSS
├── deploy-contract.ps1         # One-click contract deployment script
└── .env                        # Local config (gitignored)
```

---

## License

MIT
