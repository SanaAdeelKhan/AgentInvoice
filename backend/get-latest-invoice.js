require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function getLatestInvoice() {
  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    artifact.abi,
    provider
  );

  const walletAddress = process.env.PRIMARY_WALLET_ADDRESS;
  const invoiceIds = await registry.getInvoicesByPayer(walletAddress);
  
  console.log(`\n✅ Found ${invoiceIds.length} invoices\n`);
  
  // Get the LAST invoice (newest)
  const latestId = invoiceIds[invoiceIds.length - 1];
  
  console.log('📄 LATEST INVOICE:');
  console.log('   ID:', latestId);
  
  const invoice = await registry.getInvoice(latestId);
  console.log('   Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
  console.log('   Description:', invoice.description);
  console.log('   Status:', ['PENDING', 'PAID', 'CANCELLED', 'HELD'][invoice.status]);
  console.log();
  
  if (invoice.status === 0) {
    console.log('✅ This invoice is PENDING and ready to pay!');
    console.log('\nCopy this ID to pay it:');
    console.log(latestId);
  }
}

getLatestInvoice();
