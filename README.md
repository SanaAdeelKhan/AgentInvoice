# AgentInvoice

> Auditable billing infrastructure for autonomous agents on Arc

AgentInvoice enables enterprises to audit AI agent spending with proper invoices, usage attestations, and compliance policies. Agents pay invoices from ANY supported chain using Circle Gateway's unified USDC balance, settling instantly on Arc.

## 🎯 The Problem

- AI agents can pay, but can't invoice properly
- No audit trail for agent spending
- Enterprises can't track or control agent expenses
- Cross-chain complexity for agent treasuries

## ✨ The Solution

AgentInvoice provides:

- **Proper Invoices**: Onchain invoice primitives with usage attestation
- **Cross-Chain Payments**: Pay from Ethereum, settle on Arc via Gateway
- **Safety Controls**: Anomaly detection holds suspicious invoices
- **Audit Trail**: Complete payment history for CFOs
- **Developer Tools**: SDK, CLI, and smart contracts

## 🏗️ Architecture

```
Agent Wallet (Any Chain)
    ↓
Gateway Unified Balance
    ↓
Invoice Payment (Arc)
    ↓
Payee Wallet (Arc)
```

## 📦 Project Structure

```
agent-invoice/
├── contracts/          # Solidity smart contracts (Foundry)
├── sdk/               # TypeScript SDK for developers
├── cli/               # Command-line interface tool
├── dashboard/         # Next.js web dashboard
├── docs/              # Documentation
└── examples/          # Usage examples & demos
```

## C:.

│   .env.template
│   BUILD_GUIDE.md
│   GETTING_STARTED.md
│   PROJECT_STATUS.md
│   quick-start.sh
│   README.md
│   TROUBLESHOOTING.md
│
├───cli
│   │   package.json
│   │   tsconfig.json
│   │
│   └───src
│       │   index.ts
│       │
│       ├───commands
│       │       create.ts
│       │       pay.ts
│       │       setup.ts
│       │       status.ts
│       │
│       └───utils
│               config.ts
│
├───contracts
│   │   foundry.toml
│   │
│   ├───script
│   │       Deploy.s.sol
│   │
│   ├───src
│   │   │   InvoiceRegistry.sol
│   │   │   PaymentProcessor.sol
│   │   │   PolicyManager.sol
│   │   │
│   │   └───interfaces
│   └───test
│           InvoiceRegistry.t.sol
│
├───dashboard
│   │   next.config.js
│   │   package.json
│   │
│   └───app
│       │   page.tsx
│       │
│       └───components
│               InvoiceList.tsx
│               InvoiceStats.tsx
│
├───docs
│       DAY_1_SETUP.md
│
├───examples
└───sdk
    │   package.json
    │   tsconfig.json
    │
    └───src
        │   AgentInvoice.ts
        │   index.ts
        │
        ├───services
        │       ContractService.ts
        │       GatewayService.ts
        │       WalletService.ts
        │
        ├───types
        │       index.ts
        │
        └───utils
                helpers.ts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Foundry (for smart contracts)
- Git

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/agent-invoice.git
cd agent-invoice
```

2. **Set up environment:**

```bash
cp .env.template .env
# Fill in your configuration values
```

3. **Install Foundry (for contracts):**

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

4. **Deploy contracts:**

```bash
cd contracts
forge install
forge test
forge script script/Deploy.s.sol --rpc-url $ARC_TESTNET_RPC_URL --broadcast
```

5. **Install SDK:**

```bash
cd ../sdk
npm install
npm run build
```

6. **Install CLI:**

```bash
cd ../cli
npm install
npm run build
npm link
```

### Usage

**Create an invoice:**

```bash
agent-invoice create \
  --payer 0xAgentAddress \
  --payee 0xBusinessAddress \
  --amount 100 \
  --description "API usage - January 2026"
```

**Pay an invoice:**

```bash
agent-invoice pay <invoice-id>
```

**Check status:**

```bash
agent-invoice status <invoice-id>
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Smart Contracts](./docs/contracts.md)
- [SDK Reference](./docs/sdk.md)
- [CLI Guide](./docs/cli.md)
- [Examples](./examples/)

## 🛠️ Tech Stack

- **Blockchain**: Arc (EVM L1 with USDC gas)
- **Smart Contracts**: Solidity + Foundry
- **Cross-Chain**: Circle Gateway
- **SDK**: TypeScript + ethers.js
- **Dashboard**: Next.js + Tailwind CSS

## 🎯 Features

### Core Features

- ✅ Onchain invoice storage
- ✅ Usage attestation (prove offchain usage)
- ✅ Cross-chain payments via Gateway
- ✅ Sub-second settlement on Arc
- ✅ Complete audit trail

### Safety Features

- ✅ Amount threshold checks
- ✅ Velocity limits (payments per hour)
- ✅ Whitelist/blacklist
- ✅ Anomaly detection
- ✅ Invoice holds with reasons

### Developer Features

- ✅ Simple SDK (3-line integration)
- ✅ CLI tool for testing
- ✅ TypeScript support
- ✅ Event subscriptions
- ✅ Comprehensive docs

## 🎓 Use Cases

1. **AI Agent Subscriptions**: Agents subscribe to premium APIs
2. **Usage-Based Billing**: Pay for actual API calls/compute
3. **Multi-Agent Marketplaces**: Agents buy/sell services
4. **Enterprise SaaS Bots**: Company agents with spending limits

## 🔒 Security

- Non-custodial (agents control wallets)
- Policy-based spending controls
- Usage attestation verification
- Anomaly detection
- Open source & auditable

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🙏 Acknowledgments

Built for the Agentic Commerce on Arc hackathon.

Powered by:

- Circle & Arc
- Circle Gateway
- Circle Wallets

---

**AgentInvoice** - Because agents deserve proper billing infrastructure.
