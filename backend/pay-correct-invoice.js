require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function payInvoice() {
  console.log('💰 Paying 1.0 USDC Invoice\n');
  
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

  // CORRECT invoice ID
  const invoiceId = '0x14a6db72159df0f08bb7f1c4bfa5aa05f0ffc704c54b0ee99707fa4c47c66b8b';
  
  const invoice = await registry.getInvoice(invoiceId);
  console.log('📄 Invoice:');
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
      console.log('\n✅✅✅ SUCCESS! 1.0 USDC PAID! ✅✅✅');
      console.log('🎊 You now have 2 PAID invoices!');
      console.log('💪 Alhamdulillah! System working perfectly!');
      console.log('\n📊 Refresh your dashboard to see both paid invoices!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

payInvoice();
