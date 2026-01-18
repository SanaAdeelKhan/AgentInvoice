require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkPayTx() {
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  
  // Check the approve transaction
  console.log('🔍 Checking APPROVE transaction...\n');
  const approveTxHash = await provider.getTransaction('f04abff3-7f2e-5f9a-aa7d-d1d1fc6f3ba0').catch(() => null);
  
  // Check the payment transaction by looking it up on Arc Explorer
  console.log('🔍 Checking PAYMENT transaction: 683a400e-1821-5585-9291-3b0d4ae1709f\n');
  
  // Let's check your USDC balance
  const usdcABI = ['function balanceOf(address) view returns (uint256)'];
  const usdc = new ethers.Contract(process.env.USDC_ADDRESS, usdcABI, provider);
  
  const balance = await usdc.balanceOf(process.env.PRIMARY_WALLET_ADDRESS);
  console.log('💵 Your USDC Balance:', ethers.formatUnits(balance, 6), 'USDC');
  
  if (balance < ethers.parseUnits('0.5', 6)) {
    console.log('\n✅ Balance decreased! Payment might have gone through!');
  } else {
    console.log('\n⚠️  Balance still 1.0 USDC - payment did not execute');
  }
  
  console.log('\n🔗 Check transaction on Arc Explorer:');
  console.log('https://testnet.arcscan.com/tx/683a400e-1821-5585-9291-3b0d4ae1709f');
  console.log('\nOpen that link and see if it says "Success" or "Reverted"');
  
  // Also check if PaymentProcessor has the right addresses set
  const abiPath = path.join(__dirname, '../contracts/out/PaymentProcessor.sol/PaymentProcessor.json');
  if (fs.existsSync(abiPath)) {
    const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const processor = new ethers.Contract(
      process.env.PAYMENT_PROCESSOR_ADDRESS,
      artifact.abi,
      provider
    );
    
    try {
      const invoiceReg = await processor.invoiceRegistry();
      const usdcAddr = await processor.usdc();
      
      console.log('\n📍 PaymentProcessor Configuration:');
      console.log('   InvoiceRegistry:', invoiceReg);
      console.log('   USDC:', usdcAddr);
      console.log('   Expected InvoiceRegistry:', process.env.INVOICE_REGISTRY_ADDRESS);
      console.log('   Expected USDC:', process.env.USDC_ADDRESS);
      
      if (invoiceReg.toLowerCase() !== process.env.INVOICE_REGISTRY_ADDRESS.toLowerCase()) {
        console.log('\n❌ PROBLEM: PaymentProcessor pointing to wrong InvoiceRegistry!');
      }
      if (usdcAddr.toLowerCase() !== process.env.USDC_ADDRESS.toLowerCase()) {
        console.log('\n❌ PROBLEM: PaymentProcessor pointing to wrong USDC address!');
      }
    } catch (e) {
      console.log('\n⚠️  Could not read PaymentProcessor config');
    }
  }
}

checkPayTx();
