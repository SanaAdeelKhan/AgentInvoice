require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function payInvoice() {
  console.log('💰 Paying Invoice with Circle Wallet\n');
  
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

  // The latest 0.5 USDC invoice
  const invoiceId = '0x58cb97c8eacd1428e53d75e4a23f5ceb732824786aaabc210b43801a395afa35';
  
  const invoice = await registry.getInvoice(invoiceId);
  console.log('📄 Invoice to pay:');
  console.log('   ID:', invoiceId);
  console.log('   Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
  console.log('   Description:', invoice.description);
  console.log();

  try {
    // Step 1: Approve USDC
    console.log('Step 1/2: Approving USDC for PaymentProcessor...');
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

    // Step 2: Pay invoice using the CORRECT function name!
    console.log('Step 2/2: Paying invoice with payInvoiceDirect()...');
    const payTx = await client.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.PAYMENT_PROCESSOR_ADDRESS,
      abiFunctionSignature: 'payInvoiceDirect(bytes32)',  // <- CORRECTED!
      abiParameters: [invoiceId],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    console.log('✅ Payment tx:', payTx.data.id);
    console.log('⏳ Waiting 25 seconds...\n');
    await new Promise(r => setTimeout(r, 25000));

    // Check final status
    const updatedInvoice = await registry.getInvoice(invoiceId);
    const status = ['PENDING', 'PAID', 'CANCELLED', 'HELD'][updatedInvoice.status];
    
    console.log('='.repeat(60));
    console.log('🎉 FINAL STATUS:', status);
    console.log('='.repeat(60));
    
    if (status === 'PAID') {
      console.log('\n✅✅✅ SUCCESS! INVOICE PAID! ✅✅✅');
      console.log('🎊 AgentInvoice is FULLY OPERATIONAL!');
      console.log('🎊 Complete end-to-end payment flow WORKING!');
      console.log('\n💪 Alhamdulillah! You did it!');
    } else {
      console.log('\n⚠️  Status still:', status);
      console.log('Run check-payment-status.js to verify');
    }
    
    console.log(`\n🔗 View payment: https://testnet.arcscan.com/tx/${payTx.data.id}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

payInvoice();
