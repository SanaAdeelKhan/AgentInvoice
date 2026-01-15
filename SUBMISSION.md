# AgentInvoice - Hackathon Submission

**Project**: AgentInvoice - Auditable Billing for AI Agents  
**Hackathon**: Agentic Commerce on Arc  
**Team**: Sana Adeel Khan  
**GitHub**: https://github.com/SanaAdeelKhan/AgentInvoice  

---

## 🏆 Project Overview

AgentInvoice is a complete blockchain-based billing infrastructure for AI agents, featuring invoice primitives, policy management, and full Circle wallet integration on Arc Testnet.

## ✅ What We Built

### Smart Contracts (Deployed via Circle Console)
- **InvoiceRegistry**: Complete invoice lifecycle management
- **PolicyManager**: Anomaly detection & policy enforcement
- **PaymentProcessor**: USDC payments + Circle Gateway integration

**All 3 contracts deployed using Circle Console during hackathon period!**

### Circle Integration
- ✅ Developer-Controlled Wallets with MPC security
- ✅ Console-based deployment (zero gas fees)
- ✅ SDK-based contract execution
- ✅ Full Arc Testnet integration

### Developer Tools
- ✅ TypeScript SDK (~600 lines)
- ✅ CLI Tool (~500 lines)
- ✅ Web Dashboard with real-time data

---

## 🚀 Live Deployment (Arc Testnet)

**Smart Contracts:**
```
InvoiceRegistry:   0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c
PolicyManager:     0x11dfb74caad23c1c8884646969d33a990b339886
PaymentProcessor:  0x3e412244e13701516a3a364278e4f43ba036b864
```

**Circle Developer Wallet:**
```
Address: 0x264d02e95d182427db11a111d7b3d256d16f3f87
Type: Developer-Controlled (MPC)
Balance: 1.97 USDC (after deployment & linking)
```

**Contract Linking Transactions:**
```
setPaymentProcessor:  0xec644750fe3412b8f3307bb73f34c138faae658bf31dd562d0e1c68830344dc1
updatePolicyManager:  0xcb2789c7a653d8477d6997c3554871e73489d26cdf78774c746f5d8a8641a91a
```

**View on Arc Explorer:**
- Registry: https://testnet.arcscan.app/address/0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c
- Policy: https://testnet.arcscan.app/address/0x11dfb74caad23c1c8884646969d33a990b339886
- Processor: https://testnet.arcscan.app/address/0x3e412244e13701516a3a364278e4f43ba036b864

---

## 🎯 Key Features

### Invoice Primitives
- Create, pay, hold, and cancel invoices
- Complete lifecycle management
- Audit trail on blockchain

### Policy Management
- Spending limits per agent
- Anomaly detection algorithms
- Automatic hold on suspicious activity

### Circle Gateway Integration
- Cross-chain USDC transfers
- Burn & mint attestations
- Multi-chain invoice payments

### Developer Experience
- Complete TypeScript SDK
- CLI tool for easy integration
- Web dashboard for monitoring

---

## 🏗️ Technical Architecture

**Blockchain Layer:**
- Solidity 0.8.20 smart contracts
- Arc Testnet deployment
- USDC native payments

**Circle Integration:**
- Developer-Controlled Wallets SDK
- Console-based deployment
- MPC wallet security

**Application Layer:**
- TypeScript SDK with ethers.js v6
- Node.js CLI tool
- Static web dashboard

---

## 📊 Project Stats

- **Smart Contracts**: 3 contracts, ~2500 lines Solidity
- **SDK**: ~600 lines TypeScript
- **CLI**: ~500 lines TypeScript
- **Tests**: All contracts verified and linked
- **Deployment**: All via Circle during hackathon

---

## 🎥 Demo

**Try it yourself:**
```bash
# Clone the repo
git clone https://github.com/SanaAdeelKhan/AgentInvoice

# Test Circle wallet
cd examples
npm install
node circle-wallet-demo.js

# Use CLI
cd ../cli
npm install
npm run build
node dist/index.js list --payer 0x264d02e95d182427db11a111d7b3d256d16f3f87

# View dashboard
open ../dashboard-simple/index.html
```

---

## 💡 Innovation Highlights

1. **First Invoice Primitives for AI Agents**: Purpose-built smart contracts for agent billing
2. **Policy-Based Payments**: Automated anomaly detection and spending limits
3. **Full Circle Integration**: Leveraging Circle's infrastructure for security and ease
4. **Complete Developer Toolkit**: SDK, CLI, and dashboard for seamless integration
5. **Cross-Chain Ready**: Circle Gateway integration for multi-chain payments

---

## 🚀 Future Roadmap

- Multi-agent invoice batching
- Advanced analytics dashboard
- Integration with popular AI frameworks
- Mainnet deployment
- Additional blockchain support

---

## 👥 Team

**Sana Adeel Khan**
- Full-stack blockchain developer
- Built complete system end-to-end
- Deployed all contracts via Circle

---

## 🙏 Acknowledgments

Built for the Agentic Commerce on Arc Hackathon. Special thanks to Circle and Arc teams for their excellent tooling and documentation.

---

**AgentInvoice: Building the billing infrastructure for the AI agent economy** 🚀

*Powered by Circle • Built on Arc • Deployed During Hackathon*
