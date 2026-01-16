# 🏆 AgentInvoice

> **Turn AI agent payments into proper invoices in 3 lines of code**

[![Arc Testnet](https://img.shields.io/badge/Arc-Testnet-blue)](https://testnet.arc.network)
[![Circle](https://img.shields.io/badge/Circle-Integrated-green)](https://circle.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**AgentInvoice** is blockchain-based billing infrastructure for AI agents. It transforms chaotic agent-to-agent payments into proper invoices with audit trails, spending policies, and enterprise-grade compliance—all deployed during the Agentic Commerce Hackathon.

🎉 **Live on Arc Testnet** • **Deployed via Circle Console** • **Production-Ready**

---

## 🎯 The Problem

Imagine your company uses 50 AI agents that autonomously buy services from other agents:

**WITHOUT AgentInvoice:**
```
❌ Agent A paid 10.5 USDC... for what? To who? When?
❌ CFO asks: "What did we spend on AI last month?" → No answer
❌ Agent B spent $50,000 in an hour → No one noticed until too late
❌ Compliance audit: "Show us your agent transactions" → Chaos
❌ Tax time: "Categorize these 10,000 payments" → Good luck
```

**WITH AgentInvoice:**
```
✅ Every payment is a proper invoice with description, timestamp, metadata
✅ Real-time dashboard: "Marketing agents spent $12,450 in December"
✅ Policy engine catches Agent B's spending spike, auto-holds payment
✅ One-click export: All invoices ready for accounting software
✅ Complete audit trail on blockchain, immutable and verifiable
```

---

## ✨ The Solution

### **Before: Agent Payment (The Problem)**
```javascript
// Agent makes a payment - no context, no invoice, no audit trail
await agent.transfer(recipientAddress, 10.5, "USDC");
// That's it. CFO has NO IDEA what this was for.
```

### **After: AgentInvoice (The Solution)**
```javascript
// Same payment, but now it's a proper invoice with full context
const invoice = new AgentInvoiceSDK();
await invoice.create("GPT-4 API Usage - December", 10.5, {
  usage: "1,250 API calls",
  category: "AI Services"
});
// Now CFO sees: What, When, Why, How Much - complete audit trail
```

**That's it.** Three lines. Instant enterprise-grade billing.

---

## 🚀 Live Deployment

### **Smart Contracts on Arc Testnet**
All deployed via **Circle Console** (zero gas fees):

| Contract | Address | Purpose |
|----------|---------|---------|
| **InvoiceRegistry** | [`0x34158f...`](https://testnet.arcscan.com/address/0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c) | Invoice lifecycle management |
| **PolicyManager** | [`0x11dfb7...`](https://testnet.arcscan.com/address/0x11dfb74caad23c1c8884646969d33a990b339886) | Spending limits & anomaly detection |
| **PaymentProcessor** | [`0x3e4122...`](https://testnet.arcscan.com/address/0x3e412244e13701516a3a364278e4f43ba036b864) | USDC payments & Gateway integration |

### **Circle Developer Wallet**
- **Address**: `0x264d02e95d182427db11a111d7b3d256d16f3f87`
- **Type**: Developer-Controlled (MPC)
- **Security**: Non-custodial, enterprise-grade

### **Try It Now**
```bash
# Clone and test
git clone https://github.com/SanaAdeelKhan/AgentInvoice.git
cd AgentInvoice/dashboard-simple
open index.html  # See live invoices on blockchain
```

---

## 🎬 See It In Action

### **Demo: From Chaos to Clarity**

#### **Scenario 1: Marketing Agent Buys Ad Space**

**Before AgentInvoice** (typical blockchain payment):
```
Transaction: 0xabc123...
From: 0x264d02...
To: 0x789def...
Amount: 10.5 USDC
Timestamp: 1640000000
```
*CFO's reaction: "What is this? Why? Approved by who?"*

**After AgentInvoice**:
```javascript
Invoice #1:
  Description: "Facebook Ad Campaign - Q4 Holiday Sale"
  Amount: 10.5 USDC
  From: Marketing Agent (0x264d02...)
  To: Ad Service Provider (0x789def...)
  Timestamp: Dec 15, 2024, 3:45 PM
  Metadata:
    - Campaign ID: HOLIDAY_2024
    - Impressions: 50,000
    - Click-through rate: 2.3%
  Status: PAID ✅
  Policy Check: PASSED ✅ (within $50/day limit)
  Blockchain Proof: 0xabc123...
```
*CFO's reaction: "Perfect. Export to QuickBooks."*

---

#### **Scenario 2: Suspicious Activity Detected**

**Without AgentInvoice**:
```
Agent makes 100 payments in 1 hour
Total: $50,000 spent
No one notices until bank balance drops
Damage done ❌
```

**With AgentInvoice PolicyManager**:
```javascript
⚠️ ANOMALY DETECTED

Invoice #47: Attempted payment of $5,000
Agent: DataCollector_Bot_03
Usual spending: ~$50/day
Current rate: $50,000/hour (100x normal)

ACTION TAKEN:
✅ Payment automatically HELD
✅ Alert sent to admin dashboard
✅ Agent activity paused pending review

ADMIN OPTIONS:
1. Approve (if legitimate bulk purchase)
2. Cancel (if compromised/malicious)
3. Adjust policy limits

Potential loss prevented: $45,000
```

---

## 🏗️ What We Built

### **1. Smart Contracts** (~2,500 lines Solidity)

#### **InvoiceRegistry.sol**
Complete invoice lifecycle:
- ✅ **Create**: Generate invoice with metadata
- ✅ **Pay**: Process USDC payment
- ✅ **Hold**: Suspend suspicious invoices
- ✅ **Cancel**: Void pending invoices
- ✅ **Events**: Full audit trail

#### **PolicyManager.sol**
Enterprise spending controls:
- ✅ **Spending limits**: Daily/weekly/monthly caps per agent
- ✅ **Velocity limits**: Max payments per hour
- ✅ **Anomaly detection**: Statistical outlier detection
- ✅ **Automatic holds**: Flag suspicious activity
- ✅ **Configurable**: Admin can adjust thresholds

#### **PaymentProcessor.sol**
Payment execution:
- ✅ **USDC payments**: Native stablecoin support
- ✅ **Circle Gateway**: Cross-chain transfers
- ✅ **Burn & mint**: Multi-chain compatibility
- ✅ **Policy checks**: Enforce rules before payment

### **2. Circle Integration**

#### **Developer-Controlled Wallets**
- ✅ MPC security (no single point of failure)
- ✅ Programmable (SDK-based execution)
- ✅ Non-custodial (users control keys)

#### **Console Deployment**
- ✅ Zero gas fees for deployment
- ✅ GUI-based contract deployment
- ✅ Instant contract verification

### **3. Developer Tools**

#### **TypeScript SDK** (~600 lines)
```typescript
import { AgentInvoiceSDK } from '@agent-invoice/sdk';

const sdk = new AgentInvoiceSDK({
  rpcUrl: 'https://rpc.testnet.arc.network',
  registryAddress: '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c'
});

// Create invoice
const invoice = await sdk.createInvoice({
  description: 'API usage - December',
  amount: 10.5,
  metadata: { calls: 1250, tier: 'premium' }
});

// Pay invoice
await sdk.payInvoice(invoice.id);

// Check status
const status = await sdk.getInvoiceStatus(invoice.id);
console.log(status); // "PAID"
```

#### **CLI Tool** (~500 lines)
```bash
# Setup
agent-invoice setup

# Create invoice
agent-invoice create \
  --description "Cloud compute - Jan 2024" \
  --amount 125.50 \
  --metadata '{"hours": 50, "instance": "t3.large"}'

# List invoices
agent-invoice list --payer 0x264d02e95d182427db11a111d7b3d256d16f3f87

# Check status
agent-invoice status --invoice-id 0x123abc...
```

#### **Web Dashboard**
Real-time monitoring:
- ✅ Live invoice feed from blockchain
- ✅ Spending analytics
- ✅ Policy violation alerts
- ✅ One-click Arc Explorer links
- ✅ Export to CSV/JSON

---

## 🎯 Key Features

### **For Developers**
| Feature | Benefit |
|---------|---------|
| 3-line integration | Add invoicing in minutes, not days |
| TypeScript SDK | Type-safe, autocomplete, easy debugging |
| CLI tool | Test locally before production |
| Comprehensive docs | Get started fast |

### **For Enterprises**
| Feature | Benefit |
|---------|---------|
| Complete audit trail | Every payment tracked on blockchain |
| Spending policies | Prevent runaway costs |
| Anomaly detection | Catch fraud before damage |
| Export to accounting | QuickBooks/Xero compatible |

### **For AI Agents**
| Feature | Benefit |
|---------|---------|
| Programmable invoices | Agents create invoices autonomously |
| Usage attestation | Prove work was done |
| Cross-chain payments | Pay from any blockchain |
| Non-custodial | Agents control their funds |

---

## 🛠️ Tech Stack

**Blockchain**
- Arc Testnet (EVM L1, USDC-native)
- Solidity 0.8.20
- Foundry development framework

**Circle**
- Developer-Controlled Wallets
- Circle Console (deployment)
- Circle Gateway (cross-chain)

**Development**
- TypeScript + ethers.js v6
- Node.js backend
- Tailwind CSS frontend

---

## 🎓 Real-World Use Cases

### **1. AI-as-a-Service Platform**
```
Problem: AI agents selling API access to other agents
Solution: Automatic invoice generation per API call
Result: Clean billing, usage tracking, revenue reconciliation
```

### **2. Enterprise Bot Management**
```
Problem: 100 company agents spending $1M/year - no visibility
Solution: All agent spending flows through AgentInvoice
Result: CFO dashboard, policy enforcement, cost optimization
```

### **3. Multi-Agent Marketplace**
```
Problem: Agents buying/selling data, models, compute
Solution: Every transaction becomes a proper invoice
Result: Tax compliance, dispute resolution, trust
```

### **4. Cross-Chain Agent Payments**
```
Problem: Agent on Ethereum wants to pay agent on Polygon
Solution: Circle Gateway integration for seamless transfers
Result: Unified invoice regardless of source chain
```

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Smart Contracts** | 3 contracts, ~2,500 lines Solidity |
| **SDK** | ~600 lines TypeScript |
| **CLI** | ~500 lines TypeScript |
| **Deployment** | All via Circle Console during hackathon |
| **Gas Used** | ~0.03 USDC (thanks to Circle Console!) |
| **Time to Deploy** | 2 weeks (from idea to live contracts) |
| **Lines of Code** | ~3,600 total |

---

## 🔒 Security Features

✅ **Non-custodial** - Users control wallets  
✅ **MPC technology** - Circle's enterprise security  
✅ **Policy enforcement** - Spending limits & velocity checks  
✅ **Usage attestation** - Cryptographic proof of work  
✅ **Anomaly detection** - Statistical outlier algorithms  
✅ **Automatic holds** - Suspicious invoices flagged  
✅ **Immutable audit trail** - Blockchain-based records  

---

## 🚀 Quick Start

### **1. View Live Deployment**
```bash
git clone https://github.com/SanaAdeelKhan/AgentInvoice.git
cd AgentInvoice/dashboard-simple
open index.html
```

### **2. Test Circle Integration**
```bash
cd AgentInvoice/examples
npm install
node circle-wallet-demo.js
```

### **3. Use the SDK**
```bash
cd AgentInvoice/sdk
npm install
npm run build

# Now import in your project
import { AgentInvoiceSDK } from './sdk';
```

### **4. Try the CLI**
```bash
cd AgentInvoice/cli
npm install
npm run build
node dist/index.js --help
```

---

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Smart Contracts](docs/CONTRACTS.md)
- [SDK Reference](docs/SDK.md)
- [CLI Guide](docs/CLI.md)
- [Circle Integration](docs/CIRCLE.md)
- [Examples](examples/)

---

## 🎥 Live Demo

**Explore the deployment:**
- [InvoiceRegistry Contract](https://testnet.arcscan.com/address/0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c)
- [PolicyManager Contract](https://testnet.arcscan.com/address/0x11dfb74caad23c1c8884646969d33a990b339886)
- [PaymentProcessor Contract](https://testnet.arcscan.com/address/0x3e412244e13701516a3a364278e4f43ba036b864)
- [Circle Wallet](https://testnet.arcscan.com/address/0x264d02e95d182427db11a111d7b3d256d16f3f87)

**Test invoices on blockchain:**
- Invoice #1: 10.5 USDC - "GPT-4 API Usage" - PENDING
- Invoice #2: 0.5 USDC - "Image Generation" - PENDING

---

## 🏆 Why AgentInvoice Wins

### **1. Real Problem, Real Solution**
Most hackathon projects: "Agent buys a coffee"  
AgentInvoice: "Enterprise-grade billing infrastructure"

### **2. Production-Ready**
- ✅ Complete smart contracts (tested & deployed)
- ✅ Professional SDK & CLI
- ✅ Live dashboard with real data
- ✅ Comprehensive documentation

### **3. Circle Integration Excellence**
- ✅ Developer-Controlled Wallets
- ✅ Console deployment (zero gas!)
- ✅ Gateway for cross-chain
- ✅ Production-quality implementation

### **4. Multi-Track Alignment**
- ✅ **Best Dev Tools**: SDK + CLI + Dashboard
- ✅ **Gateway-Based Micropayments**: Cross-chain invoices
- ✅ **Trustless AI Agent**: Policy enforcement + attestation

### **5. Enterprise-Focused**
Not a toy demo. This is infrastructure enterprises actually need:
- Audit trails for compliance
- Policy enforcement for cost control
- Accounting exports for finance teams
- Anomaly detection for security

---

## 🤲 Built With Love

**Developer**: Sana Adeel Khan  
**Event**: Agentic Commerce on Arc Hackathon  
**Status**: Production-Ready  
**Deployment**: All during hackathon (2 weeks)  

---

## 🙏 Acknowledgments

Special thanks to:
- **Circle** - Excellent wallet infrastructure
- **Arc** - Fast, USDC-native blockchain
- **The Community** - Support and feedback

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🚀 Future Roadmap

- [ ] Multi-agent invoice batching
- [ ] Advanced analytics dashboard
- [ ] Integration with LangChain/AutoGPT
- [ ] Mainnet deployment
- [ ] Additional blockchain support
- [ ] Mobile app for invoice management
- [ ] QuickBooks/Xero direct integration
- [ ] AI-powered spending optimization

---

## 💬 Contact

**GitHub**: [@SanaAdeelKhan](https://github.com/SanaAdeelKhan)  
**Project**: [AgentInvoice](https://github.com/SanaAdeelKhan/AgentInvoice)  
**Demo**: [Live Dashboard](./dashboard-simple/index.html)

---

<div align="center">

### **AgentInvoice: Building the Billing Infrastructure for the AI Agent Economy** 🚀

**Three lines of code. Enterprise-grade invoicing. Production-ready.**

[![GitHub Stars](https://img.shields.io/github/stars/SanaAdeelKhan/AgentInvoice?style=social)](https://github.com/SanaAdeelKhan/AgentInvoice)
[![Deployed on Arc](https://img.shields.io/badge/Deployed-Arc%20Testnet-blue)](https://testnet.arc.network)
[![Powered by Circle](https://img.shields.io/badge/Powered%20by-Circle-green)](https://circle.com)

**[View Contracts](https://testnet.arcscan.com/address/0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c)** • **[Try Dashboard](./dashboard-simple/index.html)** • **[Read Docs](docs/)**

</div>

---

**Alhamdulillah!** From idea to deployed contracts in 2 weeks. Never gave up. 💪

**InshaaAllah, this changes how AI agents handle billing!** 🚀
