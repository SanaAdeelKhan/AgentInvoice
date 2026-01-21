require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'http://localhost:3001';
const TEST_AGENT_ID = 'ai-agent-demo-001';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log('='.repeat(70), 'cyan');
  log(title, 'bright');
  log('='.repeat(70), 'cyan');
  console.log('');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHealth() {
  section('🏥 HEALTH CHECK');
  try {
    const response = await axios.get(`${API_URL}/health`);
    log('✅ API is running', 'green');
    log(`   Mode: ${response.data.mode}`, 'blue');
    log(`   Timestamp: ${response.data.timestamp}`, 'blue');
    console.log('');
    log('📋 Contracts:', 'cyan');
    log(`   Registry: ${response.data.contracts.invoiceRegistry}`, 'blue');
    log(`   Payment:  ${response.data.contracts.paymentProcessor}`, 'blue');
    log(`   Escrow:   ${response.data.contracts.agentEscrow}`, 'blue');
    return true;
  } catch (error) {
    log('❌ API is not running!', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('', 'reset');
    log('Please start the server first:', 'yellow');
    log('   cd api && node server-autonomous.js', 'yellow');
    return false;
  }
}

async function checkBalance(agentId) {
  section('💰 CHECK ESCROW BALANCE');
  try {
    const response = await axios.get(`${API_URL}/api/escrow/${agentId}/balance`);
    log(`✅ Current Balance: ${response.data.balance} USDC`, 'green');
    log(`   Agent ID: ${response.data.agentId}`, 'blue');
    return parseFloat(response.data.balance);
  } catch (error) {
    log('❌ Failed to check balance', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return 0;
  }
}

async function fundEscrow(agentId, amount) {
  section('💵 FUND ESCROW');
  log(`Funding ${amount} USDC for agent ${agentId}...`, 'yellow');
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/api/escrow/${agentId}/fund`, {
      amount: amount
    });
    
    log('✅ Escrow funded successfully!', 'green');
    log(`   Amount: ${response.data.funding.amount} USDC`, 'blue');
    log(`   Approve TX: ${response.data.funding.approveTransaction}`, 'blue');
    log(`   Deposit TX: ${response.data.funding.depositTransaction}`, 'blue');
    log(`   Explorer: ${response.data.funding.explorerUrl}`, 'cyan');
    
    log('', 'reset');
    log('⏳ Waiting for confirmation (15 seconds)...', 'yellow');
    await sleep(15000);
    
    return true;
  } catch (error) {
    log('❌ Failed to fund escrow', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function useService(agentId, serviceType, quantity) {
  section(`🤖 AUTONOMOUS SERVICE USE: ${serviceType.toUpperCase()}`);
  log(`Agent ${agentId} is using ${quantity} units of ${serviceType}...`, 'yellow');
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/api/services/autonomous/${serviceType}/use`, {
      agentId: agentId,
      quantity: quantity,
      metadata: {
        requestId: `req-${Date.now()}`,
        clientVersion: 'test-v1.0.0'
      }
    });
    
    log('✅ SERVICE USED AND PAID AUTONOMOUSLY!', 'green');
    console.log('');
    
    log('📊 Service Details:', 'cyan');
    log(`   Type: ${response.data.service.type}`, 'blue');
    log(`   Description: ${response.data.service.description}`, 'blue');
    log(`   Quantity: ${response.data.service.quantity}`, 'blue');
    log(`   Amount: ${response.data.service.amount} ${response.data.service.currency}`, 'blue');
    console.log('');
    
    log('👤 Agent Balance:', 'cyan');
    log(`   Previous: ${response.data.agent.previousBalance} USDC`, 'blue');
    log(`   New:      ${response.data.agent.newBalance} USDC`, 'blue');
    console.log('');
    
    log('📝 Invoice:', 'cyan');
    log(`   Status: ${response.data.invoice.status}`, 'green');
    log(`   Paid At: ${response.data.invoice.paidAt}`, 'blue');
    console.log('');
    
    log('🔗 Transactions:', 'cyan');
    log(`   Invoice Creation: ${response.data.transactions.invoiceCreation}`, 'blue');
    log(`   Auto Payment:     ${response.data.transactions.autonomousPayment}`, 'blue');
    console.log('');
    
    log('🧾 Receipt:', 'cyan');
    log(`   Service:   ${response.data.receipt.service}`, 'blue');
    log(`   Quantity:  ${response.data.receipt.quantity}`, 'blue');
    log(`   Total:     ${response.data.receipt.totalPaid} ${response.data.receipt.currency}`, 'blue');
    log(`   Timestamp: ${response.data.receipt.timestamp}`, 'blue');
    
    return true;
  } catch (error) {
    log('❌ Failed to use service', 'red');
    const errorData = error.response?.data;
    if (errorData) {
      log(`   Error: ${errorData.error}`, 'red');
      if (errorData.required && errorData.available) {
        log(`   Required: ${errorData.required} USDC`, 'yellow');
        log(`   Available: ${errorData.available} USDC`, 'yellow');
        log(`   ${errorData.message}`, 'yellow');
      }
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function getPricing() {
  section('💲 SERVICE PRICING');
  try {
    const response = await axios.get(`${API_URL}/api/pricing`);
    log('✅ Available Services:', 'green');
    console.log('');
    
    Object.entries(response.data.pricing).forEach(([service, config]) => {
      log(`   ${service}:`, 'cyan');
      log(`      Price: $${config.basePrice} per unit`, 'blue');
      log(`      Description: ${config.description}`, 'blue');
      console.log('');
    });
    
    if (response.data.note) {
      log(`📌 ${response.data.note}`, 'yellow');
    }
  } catch (error) {
    log('❌ Failed to get pricing', 'red');
  }
}

async function runFullDemo() {
  console.log('');
  log('╔════════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║                                                                    ║', 'magenta');
  log('║         🤖 AgentInvoice AUTONOMOUS PAYMENT DEMO 🤖                ║', 'magenta');
  log('║                                                                    ║', 'magenta');
  log('║  Demonstrating truly autonomous AI agent payments using escrow    ║', 'magenta');
  log('║                                                                    ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════════════╝', 'magenta');
  console.log('');
  
  // Step 1: Health Check
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    process.exit(1);
  }
  
  await sleep(2000);
  
  // Step 2: Get Pricing
  await getPricing();
  await sleep(2000);
  
  // Step 3: Check Initial Balance
  const initialBalance = await checkBalance(TEST_AGENT_ID);
  await sleep(2000);
  
  // Step 4: Fund Escrow (if needed)
  if (initialBalance < 1.0) {
    log('💡 Escrow needs funding. Funding with 5 USDC...', 'yellow');
    await sleep(1000);
    const funded = await fundEscrow(TEST_AGENT_ID, 5.0);
    if (!funded) {
      log('', 'reset');
      log('⚠️  Note: You need USDC tokens in your Circle wallet to fund escrow', 'yellow');
      log('   Wallet: ' + process.env.PRIMARY_WALLET_ADDRESS, 'yellow');
      log('   Continue demo to see the validation...', 'yellow');
      await sleep(2000);
    }
  }
  
  // Step 5: Check Balance Again
  await checkBalance(TEST_AGENT_ID);
  await sleep(2000);
  
  // Step 6: Use Services Autonomously
  log('', 'reset');
  log('🚀 Now let\'s use services with AUTONOMOUS payments!', 'bright');
  await sleep(2000);
  
  // Use image generation service
  await useService(TEST_AGENT_ID, 'image-generation', 2);
  await sleep(3000);
  
  // Check balance after first service
  await checkBalance(TEST_AGENT_ID);
  await sleep(2000);
  
  // Use text generation service
  await useService(TEST_AGENT_ID, 'text-generation', 5);
  await sleep(3000);
  
  // Check final balance
  const finalBalance = await checkBalance(TEST_AGENT_ID);
  
  // Summary
  section('📊 DEMO SUMMARY');
  log('✅ Autonomous Payment Flow Completed!', 'green');
  console.log('');
  log('Key Points:', 'cyan');
  log('  1. Agent escrow was pre-funded', 'blue');
  log('  2. Services were used without manual approval', 'blue');
  log('  3. Payments executed automatically from escrow', 'blue');
  log('  4. Invoices marked PAID immediately', 'blue');
  log('  5. Complete audit trail on blockchain', 'blue');
  console.log('');
  
  if (initialBalance > 0) {
    const spent = initialBalance - finalBalance;
    log(`💰 Total Spent: ${spent.toFixed(6)} USDC`, 'yellow');
    log(`💰 Remaining: ${finalBalance.toFixed(6)} USDC`, 'yellow');
  }
  
  console.log('');
  log('🎉 THIS IS TRUE AI AGENT AUTONOMY!', 'bright');
  log('   No human approval needed. Just pure automation.', 'cyan');
  console.log('');
  log('='.repeat(70), 'magenta');
  console.log('');
}

// Run the demo
runFullDemo().catch(error => {
  console.error('');
  log('❌ Demo failed:', 'red');
  log(`   ${error.message}`, 'red');
  console.error('');
  process.exit(1);
});
