require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const REGISTRY_ADDRESS = process.env.INVOICE_REGISTRY_ADDRESS;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

const REGISTRY_ABI = [
  'function getInvoicesByPayer(address _payer) external view returns (bytes32[])',
  'function getInvoice(bytes32 _invoiceId) external view returns (bytes32 id, address payer, address payee, uint256 amount, uint8 status, string description, bytes32 usageHash, bytes usageSignature, uint256 createdAt, uint256 paidAt, string holdReason)'
];

async function checkInvoices() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
  
  console.log('📊 Checking Real Invoices on Blockchain\n');
  console.log('Registry:', REGISTRY_ADDRESS);
  console.log('Wallet:', WALLET_ADDRESS);
  console.log('\n' + '='.repeat(80));
  
  try {
    const invoiceIds = await registry.getInvoicesByPayer(WALLET_ADDRESS);
    
    console.log('\n✅ Total Invoices for this wallet:', invoiceIds.length);
    
    if (invoiceIds.length === 0) {
      console.log('\n⚠️  No invoices found for this wallet address.');
      console.log('   This might mean:');
      console.log('   1. Invoices were created with a different payer address');
      console.log('   2. No invoices have been created yet');
      return;
    }
    
    console.log('\n📋 Invoice Details:\n');
    
    for (let i = 0; i < Math.min(invoiceIds.length, 10); i++) {
      const invoiceId = invoiceIds[i];
      const invoice = await registry.getInvoice(invoiceId);
      
      const statusNames = ['PENDING', 'PAID', 'HELD', 'CANCELLED'];
      const createdDate = new Date(Number(invoice.createdAt) * 1000);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Invoice #${i + 1}`);
      console.log('  ID:', invoiceId);
      console.log('  Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
      console.log('  Status:', statusNames[invoice.status] || 'UNKNOWN');
      console.log('  Description:', invoice.description.substring(0, 80));
      console.log('  Created:', createdDate.toLocaleString());
      
      if (invoice.status === 1) { // PAID
        const paidDate = new Date(Number(invoice.paidAt) * 1000);
        console.log('  Paid:', paidDate.toLocaleString());
      }
      console.log('');
    }
    
    console.log('='.repeat(80));
    console.log('🔗 View Registry: https://testnet.arcscan.app/address/' + REGISTRY_ADDRESS);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkInvoices();
