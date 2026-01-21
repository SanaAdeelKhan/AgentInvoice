# 🚀 Quick Start: Autonomous Payments

## Prerequisites

1. ✅ Root `.env` file with `AGENT_ESCROW_ADDRESS`
2. ✅ Circle wallet with USDC tokens
3. ✅ Node.js installed
4. ✅ API dependencies installed

---

## 🎯 Step-by-Step Guide

### 1. Install Dependencies (if not already done)

```bash
cd api
npm install
```

### 2. Start the Autonomous API Server

```bash
cd api
node server-autonomous.js
```

You should see:
```
======================================================================
⚡ AgentInvoice AUTONOMOUS API Server
======================================================================
🤖 Mode: AUTONOMOUS PAYMENTS WITH ESCROW
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health

📋 Contracts:
   Registry: 0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c
   Payment:  0x3e412244e13701516a3a364278e4f43ba036b864
   Escrow:   0x13b31b30496cfefc1c30289b03210276ed6a566d
======================================================================
```

### 3. Run the Demo Script

Open a **NEW TERMINAL** and run:

```bash
cd api
node test-autonomous.js
```

This will:
1. ✅ Check API health
2. ✅ Show service pricing
3. ✅ Check escrow balance
4. ✅ Fund escrow (if needed)
5. ✅ Use services autonomously
6. ✅ Show payment receipts
7. ✅ Display summary

---

## 📋 Manual Testing (Using curl)

### Check API Health
```bash
curl http://localhost:3001/health
```

### Check Escrow Balance
```bash
curl http://localhost:3001/api/escrow/ai-agent-001/balance
```

### Fund Escrow
```bash
curl -X POST http://localhost:3001/api/escrow/ai-agent-001/fund \
  -H "Content-Type: application/json" \
  -d '{"amount": 5.0}'
```

### Use Service Autonomously
```bash
curl -X POST http://localhost:3001/api/services/autonomous/image-generation/use \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "ai-agent-001",
    "quantity": 2,
    "metadata": {"test": "demo"}
  }'
```

### Get Pricing
```bash
curl http://localhost:3001/api/pricing
```

---

## 🎮 Demo for Hackathon Judges

### Terminal 1: Start Server
```bash
cd api
node server-autonomous.js
```

### Terminal 2: Run Beautiful Demo
```bash
cd api
node test-autonomous.js
```

**Let it run!** It will show:
- 🏥 Health checks
- 💲 Pricing information  
- 💰 Balance checks
- 💵 Escrow funding
- 🤖 Autonomous service usage
- 📊 Real-time summaries
- 🎉 Success messages

---

## 🔍 What to Watch For

### Good Signs ✅
- "✅ Escrow funded successfully!"
- "✅ SERVICE USED AND PAID AUTONOMOUSLY!"
- "Status: PAID"
- "AUTONOMOUS PAYMENT COMPLETE!"

### Expected Issues ⚠️
If you see "Insufficient escrow balance":
- This is GOOD - it shows validation works!
- It means the wallet needs USDC tokens
- Ask mentors for testnet USDC faucet

---

## 📊 Expected Flow

```
1. API Health Check ✅
   └─> Mode: AUTONOMOUS_PAYMENTS

2. Get Service Pricing ✅
   └─> image-generation: $0.05
   └─> text-generation: $0.01
   └─> code-generation: $0.02

3. Check Escrow Balance ✅
   └─> Current: 0.00 USDC

4. Fund Escrow ✅
   └─> Funding: 5.00 USDC
   └─> Transaction: 0x...
   └─> Status: Confirmed

5. Use Service (Image Generation) ✅
   └─> Creating invoice...
   └─> Auto-paying from escrow...
   └─> Status: PAID
   └─> Receipt generated

6. Check New Balance ✅
   └─> Previous: 5.00 USDC
   └─> Spent: 0.10 USDC
   └─> New: 4.90 USDC
```

---

## 🎯 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check API status |
| GET | `/api/escrow/:agentId/balance` | Check escrow balance |
| POST | `/api/escrow/:agentId/fund` | Fund agent escrow |
| POST | `/api/services/autonomous/:serviceType/use` | Use service + auto pay |
| POST | `/api/escrow/:agentId/withdraw` | Withdraw from escrow |
| GET | `/api/pricing` | Get service pricing |

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <PID> /F

# Or use different port
PORT=3002 node server-autonomous.js
```

### "Cannot find module"
```bash
cd api
npm install
```

### "Insufficient escrow balance"
This is expected if wallet doesn't have USDC!
Options:
1. Ask mentors for testnet USDC
2. Show this error to demonstrate validation
3. Continue with rest of demo

### "Transaction failed"
- Check Circle wallet has Arc tokens for gas
- Check network connectivity
- Wait a bit and try again

---

## 🎤 Presentation Tips

### Opening Line:
"Let me show you TRUE AI agent autonomy. Watch how an AI agent uses services and pays automatically - without ANY human approval."

### During Demo:
1. Start server (show the contracts)
2. Run test script
3. Point out: "See? Invoice created AND paid in one go!"
4. Show balance changes
5. Emphasize: "No approval needed. Pure automation."

### Closing:
"This is the future of AI agent commerce. Autonomous payments, instant settlements, complete audit trail on blockchain."

---

## 📸 Screenshots to Capture

1. Server startup screen (with contracts)
2. Demo running (with color output)
3. Successful payment message
4. Balance changes
5. Transaction on Arc Explorer

---

## 🏆 Why This Wins

- ✅ **Novel**: First billing system FOR AI agents
- ✅ **Working**: Real demo with blockchain
- ✅ **Complete**: Both payment modes
- ✅ **Professional**: Production-quality code
- ✅ **Innovative**: Solves real problem
- ✅ **Scalable**: Ready for production

---

## 📞 Support

If anything doesn't work:
1. Check `.env` file has all addresses
2. Check Circle wallet has tokens
3. Check server is running on port 3001
4. Read error messages carefully
5. Check Arc Explorer for transactions

---

**Ready to impress the judges? Let's go! 🚀**

Built with ❤️ by Sana Adeel Khan
For Agentic Commerce on Arc Hackathon
