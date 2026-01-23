# 🚀 AgentInvoice V2 Deployment Guide (Autonomous Mode)

**Date:** January 23, 2026  
**Purpose:** Deploy updated contracts that enable TRUE autonomous payments

---

## 🎯 What's New in V2?

✅ **AgentEscrow can now mark invoices as PAID automatically**  
✅ **One-transaction autonomous payments** (no manual approval needed)  
✅ **InvoiceRegistry allows both PaymentProcessor AND AgentEscrow** to mark paid

---

## 📋 Deployment Steps via Circle Console

### Step 1: Deploy InvoiceRegistry

1. Go to Circle Console → Contracts → Deploy
2. Choose "Custom Contract"
3. Upload `contracts/InvoiceRegistry-abi.json`
4. Upload `contracts/InvoiceRegistry-bytecode.txt`
5. **Constructor parameters:**
   - `_policyManager`: Use your wallet address temporarily (we'll update it later)
6. Deploy to **Arc Testnet**
7. **Save the deployed address!**
```
INVOICE_REGISTRY_V2_ADDRESS=0x... (save this)
```

---

### Step 2: Deploy PolicyManager

1. Go to Circle Console → Contracts → Deploy
2. Choose "Custom Contract"
3. Upload `contracts/PolicyManager-abi.json`
4. Upload `contracts/PolicyManager-bytecode.txt`
5. **Constructor parameters:**
   - `_registry`: Use the InvoiceRegistry address from Step 1
6. Deploy to **Arc Testnet**
7. **Save the deployed address!**
```
POLICY_MANAGER_V2_ADDRESS=0x... (save this)
```

---

### Step 3: Deploy PaymentProcessor

1. Go to Circle Console → Contracts → Deploy
2. Choose "Custom Contract"
3. Upload `contracts/PaymentProcessor-abi.json`
4. Upload `contracts/PaymentProcessor-bytecode.txt`
5. **Constructor parameters:**
   - `_invoiceRegistry`: InvoiceRegistry address from Step 1
   - `_policyManager`: PolicyManager address from Step 2
   - `_usdc`: `0x3600000000000000000000000000000000000000` (Arc Testnet USDC)
6. Deploy to **Arc Testnet**
7. **Save the deployed address!**
```
PAYMENT_PROCESSOR_V2_ADDRESS=0x... (save this)
```

---

### Step 4: Deploy AgentEscrow

1. Go to Circle Console → Contracts → Deploy
2. Choose "Custom Contract"
3. Upload `contracts/AgentEscrow-abi.json`
4. Upload `contracts/AgentEscrow-bytecode.txt`
5. **Constructor parameters:**
   - `_usdc`: `0x3600000000000000000000000000000000000000` (Arc Testnet USDC)
   - `_invoiceRegistry`: InvoiceRegistry address from Step 1
   - `_policyManager`: PolicyManager address from Step 2
6. Deploy to **Arc Testnet**
7. **Save the deployed address!**
```
AGENT_ESCROW_V2_ADDRESS=0x... (save this)
```

---

### Step 5: Link Contracts

Now we need to call functions to link everything together:

#### 5.1 Set PaymentProcessor in InvoiceRegistry

1. Go to InvoiceRegistry contract in Circle Console
2. Call `setPaymentProcessor(address _paymentProcessor)`
3. Parameter: PaymentProcessor address from Step 3
4. Execute transaction

#### 5.2 Set AgentEscrow in InvoiceRegistry

1. Go to InvoiceRegistry contract in Circle Console
2. Call `setAgentEscrow(address _agentEscrow)`
3. Parameter: AgentEscrow address from Step 4
4. Execute transaction

#### 5.3 Update PolicyManager in InvoiceRegistry

1. Go to InvoiceRegistry contract in Circle Console
2. Call `updatePolicyManager(address _newPolicyManager)`
3. Parameter: PolicyManager address from Step 2
4. Execute transaction

---

### Step 6: Update .env File

Add V2 addresses to your `.env`:
```bash
# V2 Contracts (Autonomous Mode)
INVOICE_REGISTRY_V2_ADDRESS=0x...
POLICY_MANAGER_V2_ADDRESS=0x...
PAYMENT_PROCESSOR_V2_ADDRESS=0x...
AGENT_ESCROW_V2_ADDRESS=0x...

# Keep V1 for manual mode
INVOICE_REGISTRY_ADDRESS=0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c
POLICY_MANAGER_ADDRESS=0x11dfb74caad23c1c8884646969d33a990b339886
PAYMENT_PROCESSOR_ADDRESS=0x3e412244e13701516a3a364278e4f43ba036b864
AGENT_ESCROW_ADDRESS=0x13b31b30496cfefc1c30289b03210276ed6a566d
```

---

### Step 7: Fund Escrow & Set Spending Limit
```bash
cd backend

# Fund escrow with USDC
node real-fund-escrow.js

# The script will also set spending limits automatically
```

---

### Step 8: Test Autonomous Payment! 🎉
```bash
# This should now work with V2 contracts!
node real-autonomous-payment.js
```

Expected result:
- ✅ Invoice created on blockchain
- ✅ Payment executed from escrow automatically  
- ✅ Invoice marked as PAID in one transaction
- ✅ NO human approval needed!

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] All 4 contracts deployed successfully
- [ ] PaymentProcessor set in InvoiceRegistry
- [ ] AgentEscrow set in InvoiceRegistry
- [ ] PolicyManager updated in InvoiceRegistry
- [ ] Escrow funded with USDC
- [ ] Spending limits configured
- [ ] Test autonomous payment works

---

## 🔄 Rollback Plan

If V2 has issues, you can always use V1 contracts for manual mode:
```bash
# Switch back to V1 in your scripts
export INVOICE_REGISTRY_ADDRESS=0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c
export AGENT_ESCROW_ADDRESS=0x13b31b30496cfefc1c30289b03210276ed6a566d
```

---

## 📝 Notes

- **V1 = Manual Mode** (2-step: create invoice → pay manually)
- **V2 = Autonomous Mode** (1-step: create + pay automatically)
- Both can coexist - use V1 for large payments, V2 for microtransactions

---

**Good luck with deployment! 🚀**
