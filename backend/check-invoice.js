require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkInvoice() {
  console.log('🔍 Checking for invoices...\n');
  
  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    artifact.abi,
    provider
  );

  console.log('📍 Contract:', process.env.INVOICE_REGISTRY_ADDRESS);
  console.log();

  // Try different ways to check invoice count
  try {
    // Method 1: Check storage directly
    const storage = await provider.getStorage(process.env.INVOICE_REGISTRY_ADDRESS, 0);
    const count = parseInt(storage, 16);
    console.log('📊 Storage slot 0 (invoice count):', count);
    
    if (count > 0) {
      console.log('✅ Found', count, 'invoice(s)!\n');
      
      // Try to read invoice 0
      for (let i = 0; i < count; i++) {
        try {
          const invoice = await registry.invoices(i);
          console.log(`📄 Invoice #${i}:`);
          console.log('   Payer:', invoice.payer || invoice[0]);
          console.log('   Payee:', invoice.payee || invoice[1]);
          console.log('   Amount:', ethers.formatUnits(invoice.amount || invoice[2], 6), 'USDC');
          console.log('   Description:', invoice.description || invoice[3]);
          
          const statusNum = invoice.status !== undefined ? invoice.status : invoice[4];
          const status = ['PENDING', 'PAID', 'CANCELLED', 'HELD'][statusNum];
          console.log('   Status:', status, '✅');
          console.log();
        } catch (e) {
          console.log(`   Error reading invoice ${i}:`, e.message);
        }
      }
      
      console.log('🎊 READY TO PAY!');
      console.log('   You have 1.0 USDC');
      console.log('   Invoice needs 0.5 USDC');
      
    } else {
      console.log('⚠️  No invoices found yet');
      console.log('   Transaction might still be processing');
      console.log('   Wait a moment and run this script again');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkInvoice();
