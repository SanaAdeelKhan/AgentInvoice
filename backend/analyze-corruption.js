require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function analyzeInvoices() {
  console.log('🔍 Analyzing Invoice Data Corruption\n');
  
  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    artifact.abi,
    provider
  );

  const walletAddress = '0x264d02e95d182427db11a111d7b3d256d16f3f87';
  const invoiceIds = await registry.getInvoicesByPayer(walletAddress);
  
  console.log(`Found ${invoiceIds.length} invoices\n`);
  
  for (let i = 0; i < invoiceIds.length; i++) {
    const id = invoiceIds[i];
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Invoice #${i}: ${id}`);
    console.log('='.repeat(70));
    
    try {
      // Try to get raw data
      const invoice = await registry.invoices(id);
      
      console.log('\n📊 Raw Data:');
      console.log('  Payer:', invoice[0]);
      console.log('  Payee:', invoice[1]);
      console.log('  Amount (raw):', invoice[2].toString());
      console.log('  Amount (formatted):', ethers.utils.formatUnits(invoice[2], 6), 'USDC');
      
      // Try to decode description
      console.log('\n📝 Description Field:');
      try {
        console.log('  Description:', invoice[3]);
      } catch (e) {
        console.log('  ❌ Description ERROR:', e.message);
        console.log('  Raw bytes length:', invoice[3].length);
      }
      
      console.log('\n📍 Status:', ['PENDING', 'PAID', 'CANCELLED', 'HELD'][invoice[4]]);
      console.log('  Created At:', new Date(invoice[5].toNumber() * 1000).toLocaleString());
      
      if (invoice[6].toNumber() > 0) {
        console.log('  Paid At:', new Date(invoice[6].toNumber() * 1000).toLocaleString());
      }
      
      console.log('  Usage Hash:', invoice[7]);
      
    } catch (error) {
      console.log('\n❌ FULL ERROR:', error.message);
      
      // Try alternate method
      try {
        const rawInvoice = await provider.call({
          to: process.env.INVOICE_REGISTRY_ADDRESS,
          data: registry.interface.encodeFunctionData('invoices', [id])
        });
        
        console.log('\n🔧 Raw Call Data (hex):', rawInvoice);
        
      } catch (e2) {
        console.log('  Raw call also failed:', e2.message);
      }
    }
  }
  
  console.log('\n\n' + '='.repeat(70));
  console.log('💡 ANALYSIS COMPLETE');
  console.log('='.repeat(70));
}

analyzeInvoices();
