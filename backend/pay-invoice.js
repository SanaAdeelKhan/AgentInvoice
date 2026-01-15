require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');

async function payInvoice() {
  console.log('💰 Paying Invoice\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const processorAddress = '0x3e412244e13701516a3a364278e4f43ba036b864';
  const walletId = process.env.PRIMARY_WALLET_ID;
  
  // The 0.5 USDC invoice ID
  const invoiceId = '0x39c4c832c8a8a4b498e2b55b57a7ab6f283c9a90e6cf45d27d452aed2fd428d0';

  try {
    console.log('Paying invoice:', invoiceId);
    console.log('Amount: 0.5 USDC\n');

    const tx = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: processorAddress,
      abiFunctionSignature: 'payInvoice(bytes32)',
      abiParameters: [invoiceId],
      fee: {
        type: 'level',
        config: { feeLevel: 'MEDIUM' }
      }
    });

    console.log('✅ Payment TX Created:', tx.data.id);
    console.log('⏳ Waiting...\n');

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const status = await client.getTransaction({ id: tx.data.id });
      
      const state = status.data.transaction?.state || 'UNKNOWN';
      console.log('[' + (i+1) + '] ' + state);
      
      if (state === 'COMPLETE') {
        console.log('\n🎉 INVOICE PAID!');
        console.log('TX Hash:', status.data.transaction.txHash);
        console.log('\n🔗 View on Explorer:');
        console.log('https://testnet.arcscan.app/tx/' + status.data.transaction.txHash);
        console.log('\n🔄 Refresh dashboard - invoice should show as PAID!');
        break;
      } else if (state === 'FAILED') {
        console.log('\n❌ Payment failed');
        console.log('Details:', JSON.stringify(status.data.transaction, null, 2));
        break;
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

payInvoice();
