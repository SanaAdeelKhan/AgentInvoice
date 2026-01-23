require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const REGISTRY_ADDRESS = process.env.INVOICE_REGISTRY_ADDRESS;
const PAYMENT_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS;
const POLICY_ADDRESS = process.env.POLICY_MANAGER_ADDRESS;
const ESCROW_ADDRESS = process.env.AGENT_ESCROW_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;

async function checkLinks() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('🔗 Checking Contract Links...\n');
  console.log('='.repeat(80));
  
  // Check InvoiceRegistry
  const registryABI = ['function paymentProcessor() view returns (address)'];
  const registry = new ethers.Contract(REGISTRY_ADDRESS, registryABI, provider);
  
  try {
    const linkedPayment = await registry.paymentProcessor();
    console.log('\n📋 InvoiceRegistry:', REGISTRY_ADDRESS);
    console.log('   Linked PaymentProcessor:', linkedPayment);
    console.log('   Expected:', PAYMENT_ADDRESS);
    console.log('   Status:', linkedPayment.toLowerCase() === PAYMENT_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
  } catch (e) {
    console.log('❌ Cannot read InvoiceRegistry:', e.message);
  }
  
  // Check PaymentProcessor
  const paymentABI = [
    'function invoiceRegistry() view returns (address)',
    'function policyManager() view returns (address)',
    'function usdc() view returns (address)'
  ];
  const payment = new ethers.Contract(PAYMENT_ADDRESS, paymentABI, provider);
  
  try {
    const linkedRegistry = await payment.invoiceRegistry();
    const linkedPolicy = await payment.policyManager();
    const linkedUsdc = await payment.usdc();
    
    console.log('\n💳 PaymentProcessor:', PAYMENT_ADDRESS);
    console.log('   Linked InvoiceRegistry:', linkedRegistry);
    console.log('   Expected:', REGISTRY_ADDRESS);
    console.log('   Status:', linkedRegistry.toLowerCase() === REGISTRY_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
    
    console.log('\n   Linked PolicyManager:', linkedPolicy);
    console.log('   Expected:', POLICY_ADDRESS);
    console.log('   Status:', linkedPolicy.toLowerCase() === POLICY_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
    
    console.log('\n   Linked USDC:', linkedUsdc);
    console.log('   Expected:', USDC_ADDRESS);
    console.log('   Status:', linkedUsdc.toLowerCase() === USDC_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
  } catch (e) {
    console.log('❌ Cannot read PaymentProcessor:', e.message);
  }
  
  // Check AgentEscrow
  const escrowABI = [
    'function usdc() view returns (address)',
    'function invoiceRegistry() view returns (address)',
    'function policyManager() view returns (address)'
  ];
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, provider);
  
  try {
    const escrowUsdc = await escrow.usdc();
    const escrowRegistry = await escrow.invoiceRegistry();
    const escrowPolicy = await escrow.policyManager();
    
    console.log('\n🤖 AgentEscrow:', ESCROW_ADDRESS);
    console.log('   Linked USDC:', escrowUsdc);
    console.log('   Expected:', USDC_ADDRESS);
    console.log('   Status:', escrowUsdc.toLowerCase() === USDC_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
    
    console.log('\n   Linked InvoiceRegistry:', escrowRegistry);
    console.log('   Expected:', REGISTRY_ADDRESS);
    console.log('   Status:', escrowRegistry.toLowerCase() === REGISTRY_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
    
    console.log('\n   Linked PolicyManager:', escrowPolicy);
    console.log('   Expected:', POLICY_ADDRESS);
    console.log('   Status:', escrowPolicy.toLowerCase() === POLICY_ADDRESS.toLowerCase() ? '✅ CORRECT' : '❌ MISMATCH');
  } catch (e) {
    console.log('❌ Cannot read AgentEscrow:', e.message);
  }
  
  console.log('\n' + '='.repeat(80));
}

checkLinks();
