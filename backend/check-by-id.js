require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkById() {
  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    artifact.abi,
    provider
  );

  const txHash = "0x4cb81916e8dff231f3e84f443f88b13695a471d9461d6692107df6b75b5675d8";
  const receipt = await provider.getTransactionReceipt(txHash);
  
  console.log('📊 Transaction Receipt:\n');
  console.log('Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Gas used:', receipt.gasUsed.toString());
  console.log('Logs:', receipt.logs.length);
  console.log();
  
  if (receipt.logs.length > 0) {
    console.log('📋 Events emitted:\n');
    receipt.logs.forEach((log, i) => {
      try {
        const parsed = registry.interface.parseLog(log);
        console.log(`Event ${i}: ${parsed.name}`);
        console.log('  Args:', parsed.args);
      } catch (e) {
        console.log(`Log ${i}: (couldn't parse)`);
      }
    });
  } else {
    console.log('⚠️  No events emitted - transaction likely reverted');
  }
  
  // Try to get invoices by payer
  console.log('\n🔍 Checking invoices by payer:\n');
  try {
    const invoiceIds = await registry.getInvoicesByPayer(process.env.PRIMARY_WALLET_ADDRESS);
    console.log('Invoice IDs:', invoiceIds);
    
    if (invoiceIds.length > 0) {
      console.log('\n✅ Found', invoiceIds.length, 'invoice(s)!');
      for (let id of invoiceIds) {
        const invoice = await registry.getInvoice(id);
        console.log('\nInvoice ID:', id);
        console.log('  Payer:', invoice.payer);
        console.log('  Payee:', invoice.payee);
        console.log('  Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
        console.log('  Description:', invoice.description);
        console.log('  Status:', ['PENDING', 'PAID', 'CANCELLED', 'HELD'][invoice.status]);
      }
    } else {
      console.log('❌ No invoices found for this payer');
    }
  } catch (e) {
    console.log('Error checking invoices:', e.message);
  }
}

checkById();
