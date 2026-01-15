require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function linkContracts() {
  console.log('🔗 Linking Contracts - DEBUG MODE\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
  const processorAddress = '0x3e412244e13701516a3a364278e4f43ba036b864';
  const walletId = process.env.PRIMARY_WALLET_ID;

  try {
    console.log('Creating transaction...');
    
    const tx1 = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'setPaymentProcessor(address)',
      abiParameters: [processorAddress],
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      }
    });

    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(tx1.data, null, 2));

    const txId = tx1.data.id;
    console.log('\n⏳ Transaction ID:', txId);
    console.log('Checking status every 5 seconds...\n');
    
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const status = await client.getTransaction({ id: txId });
      
      console.log(`[${i+1}] Status Data:`);
      console.log(JSON.stringify(status.data, null, 2));
      console.log('');
      
      if (status.data?.state && status.data.state !== 'INITIATED' && 
          status.data.state !== 'PENDING_RISK_SCREENING' && 
          status.data.state !== 'QUEUED' && 
          status.data.state !== 'SENT') {
        console.log(`\n🎉 Final State: ${status.data.state}`);
        break;
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

linkContracts();
