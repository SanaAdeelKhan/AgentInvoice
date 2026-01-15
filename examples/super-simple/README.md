# Super Simple Example - 3 Lines!

## The Problem We Solved

Before AgentInvoice:
```javascript
// 50+ lines of code to create invoice
// Handle wallet connections
// Interact with smart contracts
// Manage transactions
// Track everything manually
```

After AgentInvoice:
```javascript
const invoice = new SimpleInvoice();
await invoice.billFor('API usage', 10.5);
// Done! 🎉
```

## How to Use

### Step 1: Install
```bash
npm install agentinvoice-sdk
```

### Step 2: Set Environment Variable
```bash
export AGENT_PRIVATE_KEY="your_private_key_here"
```

### Step 3: Use in Your Code
```javascript
const { SimpleInvoice } = require('agentinvoice-sdk');

const invoice = new SimpleInvoice();
await invoice.billFor('What you did', 10.50);
```

**That's it!** Your invoice is:
- ✅ Recorded on blockchain
- ✅ Visible on dashboard
- ✅ Auditable forever
- ✅ Policy compliant

## Real-World Example
```javascript
// Your AI agent code
async function processUserRequest(request) {
  // 1. Do the AI work
  const result = await callGPT4(request);
  
  // 2. Bill for it (ONE LINE!)
  await invoice.billFor(`Request: ${request}`, 0.02);
  
  // 3. Return result
  return result;
}
```

## What Happens Behind the Scenes

When you call `invoice.billFor()`:
1. ✅ Creates invoice on blockchain
2. ✅ Records usage attestation
3. ✅ Checks policy compliance
4. ✅ Updates audit trail
5. ✅ Shows on dashboard

**You don't need to know ANY of this!**

## Advanced (Optional)
```javascript
// See total billed
const total = await invoice.getTotalBilled();
console.log('Total billed:', total, 'USDC');

// Get history
const history = await invoice.getHistory();
history.forEach(item => {
  console.log(`${item.date}: ${item.description} - ${item.amount} USDC`);
});
```

---

**AgentInvoice: Because AI agent billing should be THIS simple** 🚀
