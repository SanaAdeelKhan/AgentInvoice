require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkInvoices() {
  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  
  // Use ONLY getInvoice function, not the invoices mapping
  const registryABI = [
    "function getInvoicesByPayer(address _payer) view returns (bytes32[])",
    "function getInvoice(bytes32 _invoiceId) view returns (tuple(bytes32 id, address payer, address payee, uint256 amount, string description, uint8 status, uint256 createdAt, uint256 paidAt, bytes32 usageHash, bytes usageSignature))"
  ];
  
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    registryABI,
    provider
  );

  const walletAddress = '0x264d02e95d182427db11a111d7b3d256d16f3f87';
  const invoiceIds = await registry.getInvoicesByPayer(walletAddress);
  
  console.log(`\n✅ Found ${invoiceIds.length} invoices\n`);
  
  for (let i = 0; i < invoiceIds.length; i++) {
    const id = invoiceIds[i];
    console.log(`Invoice #${i}:`);
    console.log(`  ID: ${id}`);
    
    try {
      const invoice = await registry.getInvoice(id);
      
      console.log(`  Payer: ${invoice.payer}`);
      console.log(`  Payee: ${invoice.payee}`);
      console.log(`  Amount: ${ethers.utils.formatUnits(invoice.amount, 6)} USDC`);
      console.log(`  Description: ${invoice.description}`);
      console.log(`  Status: ${['PENDING', 'PAID', 'CANCELLED', 'HELD'][invoice.status]}`);
      console.log(`  Created: ${new Date(invoice.createdAt.toNumber() * 1000).toLocaleString()}`);
      if (invoice.paidAt.toNumber() > 0) {
        console.log(`  Paid: ${new Date(invoice.paidAt.toNumber() * 1000).toLocaleString()}`);
      }
      console.log();
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
}

checkInvoices();
