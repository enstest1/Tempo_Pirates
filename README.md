# ☠️ Tempo Pirate (TPirate)

**Sail the Stablecoin Seas** — a TIP-20 token deployed on Tempo Chain mainnet.

---

## What is this?

Tempo Pirate is a fully on-chain token on [Tempo Chain](https://explore.tempo.xyz) with a public faucet, owner-controlled minting, and a Uniswap v2 liquidity pool for trading. Gas fees are paid in USDC — there is no native gas token on Tempo.

---

## Network

| Field    | Value                     |
|----------|---------------------------|
| Chain    | Tempo Mainnet             |
| Chain ID | 4217                      |
| RPC      | https://tempo.drpc.org    |
| Explorer | https://explore.tempo.xyz |
| Gas      | USDC (6 decimals)         |

---

## Contract

| Property      | Value                             |
|---------------|-----------------------------------|
| Name          | Tempo Pirate                      |
| Symbol        | TPirate                           |
| Standard      | TIP-20 (ERC-20 compatible)        |
| Decimals      | 6                                 |
| Max Supply    | 1,000,000,000 TPirate             |
| Initial Mint  | 100,000,000 TPirate → deployer    |
| Public Faucet | 1,000 TPirate per call, 24h cooldown per address |

---

## Project structure

```
tempo-pirate/
├── contracts/
│   ├── src/TempoPirate.sol          # Token contract
│   ├── script/Deploy.s.sol          # Deployment script
│   ├── script/AddLiquidity.s.sol    # Uniswap v2 liquidity script
│   ├── test/TempoPirate.t.sol       # Foundry tests
│   └── foundry.toml
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Root app + providers
│   │   ├── wagmi.config.ts          # Tempo chain + wagmi config
│   │   ├── abi/TempoPirate.json     # Contract ABI
│   │   └── components/
│   │       ├── WalletConnect.tsx    # Connect / disconnect / add network
│   │       ├── TokenInfo.tsx        # Live token stats + cooldown timer
│   │       └── MintTokens.tsx       # Public faucet button
│   ├── index.html
│   └── package.json
├── .env.example
└── README.md
```

---

## Prerequisites

- [Foundry](https://getfoundry.sh): `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- Node.js 18+
- MetaMask (or any injected wallet)
- USDC on Tempo mainnet for gas and optional liquidity seeding

---

## Quickstart

### 1. Install contract dependencies

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your deployer private key:

```
PRIVATE_KEY=0xabc123...
```

### 3. Build and test

```bash
forge build
forge test -v
```

All 17 tests should pass — deployment, public mint, cooldown, owner mint, burn, and max supply guard.

### 4. Deploy to Tempo mainnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://tempo.drpc.org \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --chain-id 4217
```

The deployed address is printed to the console and written to `deployments/mainnet.json`. Copy it into `.env`:

```
VITE_TPIRATE_ADDRESS=0xYourDeployedAddress
```

### 5. Copy ABI to frontend

After `forge build` the ABI lives in `out/`. Copy it so the frontend can use it:

```bash
cp contracts/out/TempoPirate.sol/TempoPirate.json \
   frontend/src/abi/TempoPirate.json
```

### 6. Add liquidity (optional — sets the launch price)

Before running this script you must confirm two external addresses and add them to `.env`:

| Variable          | Where to find it                                        |
|-------------------|---------------------------------------------------------|
| `USDC_ADDRESS`    | https://docs.tempo.xyz → network info → USDC contract  |
| `UNISWAP_V2_ROUTER` | Uniswap v2 deployment on Tempo chain                 |

Once filled in:

```bash
forge script script/AddLiquidity.s.sol \
  --rpc-url https://tempo.drpc.org \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --chain-id 4217
```

#### Launch price math

The ratio of `INITIAL_TPIRATE` to `INITIAL_USDC` sets the price:

```
Price = INITIAL_USDC / INITIAL_TPIRATE
```

| INITIAL_TPIRATE (raw) | INITIAL_USDC (raw) | Price per TPirate |
|-----------------------|--------------------|-------------------|
| 1,000,000,000,000     | 10,000,000         | $0.00001          |
| 100,000,000,000       | 10,000,000         | $0.0001           |
| 10,000,000,000        | 10,000,000         | $0.001            |
| 1,000,000,000         | 10,000,000         | $0.01             |

All amounts are raw (6 decimals). Adjust `INITIAL_TPIRATE` in `.env` before broadcasting to set your desired launch price.

### 7. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

---

## Add Tempo to MetaMask

Click **"Add Tempo to MetaMask"** in the UI, or add manually:

| Field    | Value                     |
|----------|---------------------------|
| Network  | Tempo                     |
| RPC      | https://tempo.drpc.org    |
| Chain ID | 4217                      |
| Symbol   | USDC                      |
| Explorer | https://explore.tempo.xyz |

---

## Buying TPirate

1. Connect a second wallet to the frontend
2. Get USDC on Tempo (bridge from Ethereum or Base)
3. Go to Uniswap, select the Tempo network, and paste your `VITE_TPIRATE_ADDRESS`
4. Swap USDC → TPirate

---

## Security notes

- Never commit your `.env` file. It is listed in `.gitignore`.
- The public faucet is rate-limited by a 24-hour on-chain cooldown per address — it cannot be bypassed without a new transaction after the window expires.
- `ownerMint` is gated by OpenZeppelin `Ownable`. Transfer or renounce ownership deliberately if needed.
- Liquidity pool slippage is set to `amountAMin: 0, amountBMin: 0` in `AddLiquidity.s.sol` — this is intentional for a first-time pool creation where no price exists yet. Do not reuse that script to add to an existing pool without setting proper minimums.
