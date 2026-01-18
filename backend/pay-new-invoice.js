require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function payNewInvoice() {
  console.log('💰 Paying NEW 1.0 USDC Invoice\n');
  
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  
  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
  const registry = new ethers.Contract(
    process.env.INVOICE_REGISTRY_ADDRESS,
    artifact.abi,
    provider
  );

  // The new invoice ID (from your dashboard)
  const invoiceId = '0x14a6db72159df0f08b9c4c832c8a8a4b498e2b55b57a7ab6f283c9a90e6cf45d';
  
  const invoice = await registry.getInvoice(invoiceId);
  console.log('📄 Invoice to pay:');
  console.log('   ID:', invoiceId);
  console.log('   Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
  console.log('   Description:', invoice.description);
  console.log();

  try {
    // Step 1: Approve USDC
    console.log('Step 1/2: Approving 1.0 USDC...');
    const approveTx = await client.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.USDC_ADDRESS,
      abiFunctionSignature: 'approve(address,uint256)',
      abiParameters: [process.env.PAYMENT_PROCESSOR_ADDRESS, invoice.amount.toString()],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    console.log('✅ Approve tx:', approveTx.data.id);
    console.log('⏳ Waiting 15 seconds...\n');
    await new Promise(r => setTimeout(r, 15000));

    // Step 2: Pay invoice
    console.log('Step 2/2: Paying invoice...');
    const payTx = await client.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.PAYMENT_PROCESSOR_ADDRESS,
      abiFunctionSignature: 'payInvoiceDirect(bytes32)',
      abiParameters: [invoiceId],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    console.log('✅ Payment tx:', payTx.data.id);
    console.log('⏳ Waiting 25 seconds...\n');
    await new Promise(r => setTimeout(r, 25000));

    // Check status
    const updatedInvoice = await registry.getInvoice(invoiceId);
    const status = ['PENDING', 'PAID', 'CANCELLED', 'HELD'][updatedInvoice.status];
    
    console.log('='.repeat(60));
    console.log('🎉 FINAL STATUS:', status);
    console.log('='.repeat(60));
    
    if (status === 'PAID') {
      console.log('\n✅✅✅ SUCCESS! 1.0 USDC INVOICE PAID! ✅✅✅');
      console.log('🎊 Now you have 2 PAID invoices!');
      console.log('💪 Complete payment system working perfectly!');
    } else {
      console.log('\n⚠️  Status:', status);
      console.log('Check in a moment...');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

payNewInvoice();
