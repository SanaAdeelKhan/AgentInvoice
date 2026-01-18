require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkStatus() {
  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    artifact.abi,
    provider
  );

  const invoiceId = '0x58cb97c8eacd1428e53d75e4a23f5ceb732824786aaabc210b43801a395afa35';
  
  console.log('🔍 Checking invoice status...\n');
  
  const invoice = await registry.getInvoice(invoiceId);
  const status = ['PENDING', 'PAID', 'CANCELLED', 'HELD'][invoice.status];
  
  console.log('📄 Invoice:', invoiceId);
  console.log('💰 Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
  console.log('📊 Status:', status);
  
  if (status === 'PAID') {
    console.log('\n🎉🎉🎉 SUCCESS! INVOICE IS PAID! 🎉🎉🎉');
    console.log('✅ Complete end-to-end payment flow working!');
    console.log('✅ AgentInvoice is FULLY OPERATIONAL!');
  } else {
    console.log('\n⏳ Still processing... run this script again in 10 seconds');
  }
}

checkStatus();
