require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function checkStatus() {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const txId = '9e57ed37-4310-5d48-b1e7-cd82f7c43dd0'; // Your last transaction

  console.log('🔍 Checking transaction status...\n');
  console.log('Transaction ID:', txId);
  console.log();

  try {
    const status = await client.getTransaction({ id: txId });
    console.log('Full response:', JSON.stringify(status.data, null, 2));
    
    const state = status.data?.transaction?.state || status.data?.state;
    console.log('\n📊 Status:', state);
    
    if (state === 'CONFIRMED') {
      console.log('✅ Transaction confirmed! Run check-invoice.js again');
    } else if (state === 'FAILED') {
      console.log('❌ Transaction failed');
      if (status.data.errorReason) {
        console.log('Reason:', status.data.errorReason);
      }
    } else {
      console.log('⏳ Still processing...');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkStatus();
