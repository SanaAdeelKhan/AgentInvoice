import { AgentInvoice } from 'sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 AgentInvoice Demo\n');

  // Initialize SDK
  const sdk = new AgentInvoice(
    process.env.RPC_URL,
    process.env.INVOICE_REGISTRY,
    process.env.PAYMENT_PROCESSOR
  );

  console.log('✅ SDK initialized');
  console.log(`📡 Connected to: ${process.env.RPC_URL}`);
  console.log(`📋 Registry: ${process.env.INVOICE_REGISTRY}\n`);

  // Get provider info
  const provider = sdk.getProvider();
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`📦 Current Block: ${blockNumber}\n`);

  // Example: List invoices
  console.log('📋 Checking for invoices...');
  const payerAddress = process.env.PAYER_ADDRESS || process.env.DEPLOYER_ADDRESS;
  
  if (payerAddress) {
    const invoices = await sdk.getInvoicesByPayer(payerAddress);
    console.log(`Found ${invoices.length} invoice(s) for ${payerAddress}`);
    
    if (invoices.length > 0) {
      console.log('\n📄 Invoice IDs:');
      invoices.forEach((id, i) => {
        console.log(`  ${i + 1}. ${id}`);
      });
    }
  }

  console.log('\n✨ Demo complete!');
  console.log('\n💡 Next steps:');
  console.log('  1. Create an invoice: npm run create');
  console.log('  2. Check status: npm run status <invoice-id>');
  console.log('  3. Use CLI: cd ../cli && node dist/index.js list --payer YOUR_ADDRESS');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
