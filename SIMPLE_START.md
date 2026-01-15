# AgentInvoice - Dead Simple Start

## For Developers Who Just Want It To Work

### 1. Install
```bash
npm install agentinvoice-sdk
```

### 2. Set Your Key
```bash
export AGENT_PRIVATE_KEY="your_wallet_private_key"
```

### 3. Use
```javascript
const { SimpleInvoice } = require('agentinvoice-sdk');

const invoice = new SimpleInvoice();
await invoice.billFor('API usage', 10.50);
```

### That's It! 🎉

Your invoice is now:
- ✅ On the blockchain
- ✅ In the audit trail  
- ✅ Visible on dashboard
- ✅ Policy compliant

## No Need to Know:
- ❌ Smart contracts
- ❌ Web3
- ❌ Blockchain details
- ❌ Gas optimization
- ❌ Transaction management

## It Just Works!
```javascript
// Your AI agent
async function doWork() {
  const result = await someAIService();
  await invoice.billFor('AI work done', 5.00);
  return result;
}
```

**See? 3 lines total!**

---

## What If I Want More Control?

Check out:
- [Full SDK Documentation](./docs/sdk.md)
- [CLI Tool](./docs/cli.md)
- [Advanced Examples](./examples/)

But honestly? You probably don't need it. The simple interface does everything! 🚀

---

**Questions?** Open an issue: https://github.com/SanaAdeelKhan/AgentInvoice/issues
