/**
 * AgentInvoice - Super Simple Example
 * 
 * Just 3 lines to bill your AI agent usage!
 */

const { SimpleInvoice } = require('agentinvoice-sdk');

// Setup (one time)
const invoice = new SimpleInvoice();

// That's it! Now just bill whenever your agent does something:
async function main() {
  // 1. Agent uses API
  console.log('🤖 Agent making API calls...');
  
  // 2. Bill for it (ONE LINE!)
  await invoice.billFor('GPT-4 API - 1000 requests', 15.50);
  
  // 3. Done! Check your dashboard to see it recorded
  console.log('✅ Billing complete! Check dashboard.');
  
  // Optional: See your billing history
  const history = await invoice.getHistory();
  console.log('📊 Billing history:', history);
}

main();
