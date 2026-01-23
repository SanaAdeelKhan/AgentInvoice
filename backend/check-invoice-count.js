require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const REGISTRY_ADDRESS = process.env.INVOICE_REGISTRY_ADDRESS;

const REGISTRY_ABI = [
  'function invoiceCount() view returns (uint256)',
  'function invoices(uint256) view returns (address customer, address provider, uint256 amount, string description, uint8 status, uint256 createdAt, uint256 paidAt)'
];

async function checkInvoices() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
  
  console.log('📊 Checking InvoiceRegistry...\n');
  console.log('Registry:', REGISTRY_ADDRESS);
  
  try {
    const count = await registry.invoiceCount();
    console.log('\n✅ Total Invoices:', count.toString());
    
    if (count > 0) {
      console.log('\n📋 Last 5 Invoices:');
      const start = count > 5n ? count - 5n : 0n;
      
      for (let i = start; i < count; i++) {
        const invoice = await registry.invoices(i);
        const createdDate = new Date(Number(invoice.createdAt) * 1000);
        console.log(`\n━━━ Invoice #${i} ━━━`);
        console.log('  Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
        console.log('  Description:', invoice.description.substring(0, 60) + (invoice.description.length > 60 ? '...' : ''));
        console.log('  Status:', ['PENDING', 'PAID', 'CANCELLED'][invoice.status]);
        console.log('  Created:', createdDate.toLocaleString());
      }
    }
    
    console.log('\n🔗 View all: https://testnet.arcscan.app/address/' + REGISTRY_ADDRESS);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkInvoices();
