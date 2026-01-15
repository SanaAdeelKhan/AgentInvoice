# 🏆 AgentInvoice

> Auditable billing infrastructure for AI agents on Arc with Circle integration

AgentInvoice provides complete blockchain-based billing infrastructure for AI agents, featuring invoice primitives, policy management, anomaly detection, and full Circle wallet integration.

**🎉 Deployed via Circle Console • Live on Arc Testnet • Built for Agentic Commerce Hackathon**

---

## 🚀 Live Deployment

**Smart Contracts (Deployed via Circle Console):**
```
InvoiceRegistry:   0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c
PolicyManager:     0x11dfb74caad23c1c8884646969d33a990b339886
PaymentProcessor:  0x3e412244e13701516a3a364278e4f43ba036b864
```

**Circle Developer Wallet:**
```
Address: 0x264d02e95d182427db11a111d7b3d256d16f3f87
Type: Developer-Controlled (MPC)
```

**View on Arc Explorer:**
- [InvoiceRegistry](https://testnet.arcscan.app/address/0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c)
- [PolicyManager](https://testnet.arcscan.app/address/0x11dfb74caad23c1c8884646969d33a990b339886)
- [PaymentProcessor](https://testnet.arcscan.app/address/0x3e412244e13701516a3a364278e4f43ba036b864)

---

## 🎯 The Problem

- AI agents need proper invoicing with audit trails
- No standardized invoice primitives for agent-to-agent payments
- Enterprises can't track or control agent spending
- No policy enforcement for autonomous agent payments

## ✨ The Solution

AgentInvoice provides:

- **📋 Invoice Primitives**: Purpose-built smart contracts for agent billing
- **🔐 Circle Integration**: Secure wallet management with MPC technology
- **🛡️ Policy Management**: Spending limits and anomaly detection
- **📊 Audit Trail**: Complete payment history on blockchain
- **🛠️ Developer Tools**: SDK, CLI, and dashboard for seamless integration
- **🌉 Cross-Chain Ready**: Circle Gateway integration for multi-chain payments

---

## 🏗️ What We Built

### Smart Contracts (~2,500 lines Solidity)
- **InvoiceRegistry**: Complete invoice lifecycle (create, pay, hold, cancel)
- **PolicyManager**: Policy enforcement with anomaly detection
- **PaymentProcessor**: USDC payments + Circle Gateway integration

### Circle Integration
- ✅ Developer-Controlled Wallets with MPC security
- ✅ Console-based deployment (zero gas fees)
- ✅ SDK-based contract execution
- ✅ Full Arc Testnet integration

### Developer Tools
- **TypeScript SDK** (~600 lines): Complete invoice management API
- **CLI Tool** (~500 lines): Command-line interface for developers
- **Web Dashboard**: Real-time invoice tracking and analytics

---

## 📦 Project Structure
```
AgentInvoice/
├── contracts/          # Solidity smart contracts (Foundry)
│   ├── src/           # Contract source code
│   └── script/        # Deployment scripts
├── sdk/               # TypeScript SDK
│   ├── src/           # SDK source code
│   └── dist/          # Compiled SDK
├── cli/               # Command-line interface
│   ├── src/           # CLI source code
│   └── dist/          # Compiled CLI
├── backend/           # Circle wallet integration
│   └── scripts/       # Deployment & linking scripts
├── dashboard-simple/  # Web dashboard
├── examples/          # Usage examples
└── docs/              # Documentation
```

---

## 🚀 Quick Start

### Test the Live Deployment
```bash
# Clone the repository
git clone https://github.com/SanaAdeelKhan/AgentInvoice.git
cd AgentInvoice

# Test Circle wallet integration
cd examples
npm install
node circle-wallet-demo.js

# Use the CLI
cd ../cli
npm install
npm run build
node dist/index.js list --payer 0x264d02e95d182427db11a111d7b3d256d16f3f87

# View the dashboard
open ../dashboard-simple/index.html
```

---

## 🎯 Key Features

### Invoice Management
- ✅ Create invoices with usage attestations
- ✅ Pay invoices with USDC
- ✅ Hold suspicious invoices
- ✅ Cancel pending invoices
- ✅ Complete audit trail

### Policy Enforcement
- ✅ Spending limits per agent
- ✅ Velocity limits (payments per hour)
- ✅ Anomaly detection algorithms
- ✅ Automatic holds on suspicious activity
- ✅ Configurable thresholds

### Circle Gateway Integration
- ✅ Cross-chain USDC transfers
- ✅ Burn & mint attestations
- ✅ Multi-chain invoice payments
- ✅ Unified balance across chains

### Developer Experience
- ✅ Complete TypeScript SDK
- ✅ CLI tool for easy integration
- ✅ Web dashboard for monitoring
- ✅ Comprehensive documentation
- ✅ Usage examples

---

## 🛠️ Tech Stack

**Blockchain:**
- Arc Testnet (EVM L1)
- Native USDC payments
- Solidity 0.8.20

**Circle:**
- Developer-Controlled Wallets
- Circle Console deployment
- Circle Gateway (cross-chain)

**Development:**
- TypeScript + ethers.js v6
- Foundry (contracts)
- Node.js (backend)
- Tailwind CSS (UI)

---

## 🎓 Use Cases

1. **AI Agent Subscriptions**: Agents pay for premium API access
2. **Usage-Based Billing**: Track and bill for actual API usage
3. **Multi-Agent Marketplaces**: Agents buy/sell services
4. **Enterprise Bot Management**: Company agents with spending policies
5. **Cross-Chain Agent Payments**: Pay from any supported blockchain

---

## 📊 Project Stats

- **Smart Contracts**: 3 contracts, ~2,500 lines Solidity
- **SDK**: ~600 lines TypeScript
- **CLI**: ~500 lines TypeScript  
- **Deployment**: All via Circle Console during hackathon
- **Tests**: All contracts verified and linked
- **Gas Used**: ~0.03 USDC for deployment and linking

---

## 🔒 Security Features

- Non-custodial (users control wallets)
- Circle MPC wallet technology
- Policy-based spending controls
- Usage attestation verification
- Anomaly detection algorithms
- Automatic invoice holds
- Complete audit trail

---

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Smart Contracts](./docs/contracts.md)
- [SDK Reference](./docs/sdk.md)
- [CLI Guide](./docs/cli.md)
- [Circle Integration](./docs/circle.md)
- [Examples](./examples/)

---

## 🎥 Demo

**Live Demo:**
- Smart Contracts: View on [Arc Explorer](https://testnet.arcscan.app/address/0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c)
- Circle Wallet: `0x264d02e95d182427db11a111d7b3d256d16f3f87`
- GitHub: https://github.com/SanaAdeelKhan/AgentInvoice

---

## 🏆 Built For

**Agentic Commerce on Arc Hackathon**

Demonstrating:
- Complete Circle wallet integration
- Production-ready smart contracts
- Developer-friendly tooling
- Real-world use case for AI agents

---

## 👥 Team

**Sana Adeel Khan**
- Full-stack blockchain developer
- Complete end-to-end implementation
- Circle integration specialist

---

## 🙏 Acknowledgments

Built for the Agentic Commerce on Arc Hackathon.

Special thanks to:
- **Circle** - For excellent wallet infrastructure and documentation
- **Arc** - For the fast, USDC-native blockchain
- **The Community** - For support and feedback

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🚀 Future Roadmap

- [ ] Multi-agent invoice batching
- [ ] Advanced analytics dashboard
- [ ] Integration with popular AI frameworks
- [ ] Mainnet deployment
- [ ] Additional blockchain support via Gateway
- [ ] Mobile app for invoice management

---

**AgentInvoice: Building the billing infrastructure for the AI agent economy** 🚀

*Powered by Circle • Built on Arc • Deployed During Hackathon*

[![GitHub](https://img.shields.io/badge/GitHub-AgentInvoice-blue)](https://github.com/SanaAdeelKhan/AgentInvoice)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Arc Testnet](https://img.shields.io/badge/Arc-Testnet-orange)](https://testnet.arcscan.app)
