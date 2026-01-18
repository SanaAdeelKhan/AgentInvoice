require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkConfig() {
  console.log('🔍 Checking PaymentProcessor Configuration\n');
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  
  // Load PaymentProcessor ABI
  const processorPath = path.join(__dirname, '../contracts/out/PaymentProcessor.sol/PaymentProcessor.json');
  const registryPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  
  if (!fs.existsSync(processorPath)) {
    console.log('❌ PaymentProcessor ABI not found');
    return;
  }
  
  const processorArtifact = JSON.parse(fs.readFileSync(processorPath, 'utf8'));
  const registryArtifact = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  const processor = new ethers.Contract(
    process.env.PAYMENT_PROCESSOR_ADDRESS,
    processorArtifact.abi,
    provider
  );
  
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    registryArtifact.abi,
    provider
  );
  
  try {
    console.log('📍 Addresses:');
    console.log('   PaymentProcessor:', process.env.PAYMENT_PROCESSOR_ADDRESS);
    console.log('   InvoiceRegistry:', process.env.INVOICE_REGISTRY_ADDRESS);
    console.log('   USDC:', process.env.USDC_ADDRESS);
    console.log();
    
    // Check PaymentProcessor config
    const processorInvoiceReg = await processor.invoiceRegistry();
    const processorUsdc = await processor.usdc();
    
    console.log('💳 PaymentProcessor Configuration:');
    console.log('   invoiceRegistry:', processorInvoiceReg);
    console.log('   usdc:', processorUsdc);
    console.log();
    
    // Check InvoiceRegistry config  
    const registryProcessor = await registry.paymentProcessor();
    
    console.log('📋 InvoiceRegistry Configuration:');
    console.log('   paymentProcessor:', registryProcessor);
    console.log();
    
    // Validate
    console.log('✅ Validation:');
    
    if (processorInvoiceReg.toLowerCase() === process.env.INVOICE_REGISTRY_ADDRESS.toLowerCase()) {
      console.log('   ✅ PaymentProcessor → InvoiceRegistry: CORRECT');
    } else {
      console.log('   ❌ PaymentProcessor → InvoiceRegistry: WRONG!');
      console.log('      Expected:', process.env.INVOICE_REGISTRY_ADDRESS);
      console.log('      Got:', processorInvoiceReg);
    }
    
    if (registryProcessor.toLowerCase() === process.env.PAYMENT_PROCESSOR_ADDRESS.toLowerCase()) {
      console.log('   ✅ InvoiceRegistry → PaymentProcessor: CORRECT');
    } else {
      console.log('   ❌ InvoiceRegistry → PaymentProcessor: WRONG!');
      console.log('      Expected:', process.env.PAYMENT_PROCESSOR_ADDRESS);
      console.log('      Got:', registryProcessor);
    }
    
    if (processorUsdc.toLowerCase() === process.env.USDC_ADDRESS.toLowerCase()) {
      console.log('   ✅ PaymentProcessor → USDC: CORRECT');
    } else {
      console.log('   ❌ PaymentProcessor → USDC: WRONG!');
      console.log('      Expected:', process.env.USDC_ADDRESS);
      console.log('      Got:', processorUsdc);
    }
    
  } catch (error) {
    console.error('❌ Error reading config:', error.message);
  }
}

checkConfig();
