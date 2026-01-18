require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function verifyLinking() {
  console.log('🔍 Verifying Contract Linking\n');
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  
  // Simple ABIs
  const registryABI = [
    'function paymentProcessor() view returns (address)',
    'function policyManager() view returns (address)'
  ];
  
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    registryABI,
    provider
  );
  
  console.log('📋 InvoiceRegistry:', process.env.INVOICE_REGISTRY_ADDRESS);
  
  try {
    const paymentProc = await registry.paymentProcessor();
    const policyMgr = await registry.policyManager();
    
    console.log('   → PaymentProcessor:', paymentProc);
    console.log('   → PolicyManager:', policyMgr);
    console.log();
    
    console.log('✅ Validation:');
    
    if (paymentProc === ethers.ZeroAddress || paymentProc === '0x0000000000000000000000000000000000000000') {
      console.log('   ❌ PaymentProcessor NOT SET!');
      console.log('   Need to call: setPaymentProcessor()');
    } else if (paymentProc.toLowerCase() === process.env.PAYMENT_PROCESSOR_ADDRESS.toLowerCase()) {
      console.log('   ✅ PaymentProcessor linked correctly');
    } else {
      console.log('   ❌ PaymentProcessor points to WRONG address!');
      console.log('      Expected:', process.env.PAYMENT_PROCESSOR_ADDRESS);
      console.log('      Got:', paymentProc);
    }
    
    if (policyMgr === ethers.ZeroAddress || policyMgr === '0x0000000000000000000000000000000000000000') {
      console.log('   ❌ PolicyManager NOT SET!');
      console.log('   Need to call: updatePolicyManager()');
    } else if (policyMgr.toLowerCase() === process.env.POLICY_MANAGER_ADDRESS.toLowerCase()) {
      console.log('   ✅ PolicyManager linked correctly');
    } else {
      console.log('   ❌ PolicyManager points to WRONG address!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyLinking();
