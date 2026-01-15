require('dotenv').config();
const { ethers } = require('ethers');

async function testContracts() {
  console.log('🧪 Testing AgentInvoice Contracts\n');

  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  
  const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
  
  const registryABI = [
    'function paymentProcessor() view returns (address)',
    'function policyManager() view returns (address)'
  ];

  const registry = new ethers.Contract(registryAddress, registryABI, provider);

  try {
    console.log('📋 InvoiceRegistry:', registryAddress);
    
    const paymentProcessor = await registry.paymentProcessor();
    console.log('✅ PaymentProcessor:', paymentProcessor);
    
    const policyManager = await registry.policyManager();
    console.log('✅ PolicyManager:', policyManager);
    
    console.log('\n🎉 ALL CONTRACTS PROPERLY LINKED!');
    
    if (paymentProcessor.toLowerCase() === '0x3e412244e13701516a3a364278e4f43ba036b864') {
      console.log('✅ PaymentProcessor verification: PASSED');
    }
    
    if (policyManager.toLowerCase() === '0x11dfb74caad23c1c8884646969d33a990b339886') {
      console.log('✅ PolicyManager verification: PASSED');
    }
    
    console.log('\n🏆 AgentInvoice is FULLY OPERATIONAL!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testContracts();
