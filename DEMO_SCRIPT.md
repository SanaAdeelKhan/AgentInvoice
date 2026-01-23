# AgentInvoice Demo Script — Updated

## Opening (30 seconds)
"Hi! Welcome to the AgentInvoice demo — a complete blockchain billing infrastructure for AI agents built on Arc Testnet, fully integrated with Circle developer-controlled wallets."

## Problem Statement (30 seconds)
"AI agents need **autonomous, auditable billing** with usage tracking, policy enforcement, and cross-chain payments. Existing solutions require constant human intervention, limiting scalability and uptime."

## Solution Overview (1 minute)
"AgentInvoice provides:  
- **Smart contracts**: InvoiceRegistry, PolicyManager, PaymentProcessor  
- **AgentEscrow**: fully autonomous payments without human intervention  
- **Developer tools**: TypeScript SDK, CLI, REST API, and dashboards  
- **Policy enforcement & anomaly detection**: ensures security and compliance"

## Live Demo (2 minutes)

### 1️⃣ Check Circle Wallet Balance
\`\`\`bash
cd backend
node check-owner-wallet.js   # or check-balance.ps1 on Windows
\`\`\`
- Displays real USDC balance on Arc Testnet
- Confirms wallet integration

### 2️⃣ Create & Pay Autonomous Invoice (SDK)
\`\`\`javascript
import { AgentInvoiceSDK } from '@agent-invoice/sdk';

const sdk = new AgentInvoiceSDK({
  rpcUrl: 'https://rpc.testnet.arc.network',
  privateKey: process.env.AGENT_PRIVATE_KEY,
});

await sdk.fundEscrow('my-agent', 1000);  // Fund agent escrow
await sdk.autonomousPayment({
  agentId: 'my-agent',
  service: 'image-generation',
  quantity: 100
});
\`\`\`
- ✅ Invoice created on blockchain  
- ✅ Paid automatically from escrow  
- ✅ Status: PAID instantly  

### 3️⃣ CLI Tool Usage
\`\`\`bash
# Fund escrow
agent-invoice escrow fund --agent-id my-agent --amount 1000

# Create autonomous invoice
agent-invoice create-auto --service image-generation --quantity 100

# List paid invoices
agent-invoice list --filter paid
\`\`\`

### 4️⃣ Dashboard
- Autonomous mode: \`dashboard-autonomous/index.html\`  
- Manual mode: \`dashboard-simple/index.html\`  
- Real-time visibility, blockchain confirmations, and audit trails

## Technology Highlights (30 seconds)
- Solidity 0.8.20 smart contracts on Arc Testnet  
- TypeScript SDK + CLI  
- Node.js REST API (\`api/server-autonomous-simple.js\`)  
- Circle Developer-Controlled Wallets  
- Fully responsive dashboards

## Closing (30 seconds)
"AgentInvoice enables **100% autonomous operations** for AI agents, with full auditability and enterprise-grade security. All tools, scripts, and dashboards are production-ready, open-source, and deployed on Arc Testnet. Thank you!"

## ✅ Key Updates in This Version
- Removed **legacy scripts and test/demo files**.  
- Aligned SDK, CLI, and API examples with current production-ready code.  
- All dashboards reflect only **index.html** (main versions).  
- Only **backend deploy/fund scripts** referenced for live demos.  

