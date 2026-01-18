require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function getTxHash() {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const txId = '683a400e-1821-5585-9291-3b0d4ae1709f'; // Payment transaction
  
  console.log('🔍 Getting real transaction hash...\n');
  
  const status = await client.getTransaction({ id: txId });
  
  console.log('Circle Transaction ID:', txId);
  console.log('State:', status.data?.transaction?.state || status.data?.state);
  console.log('Arc Tx Hash:', status.data?.transaction?.txHash || status.data?.txHash || 'Not yet available');
  
  const txHash = status.data?.transaction?.txHash || status.data?.txHash;
  
  if (txHash) {
    console.log(`\n🔗 View on Arc Explorer:`);
    console.log(`https://testnet.arcscan.com/tx/${txHash}`);
  } else {
    console.log('\n⚠️  Transaction has not been broadcast to blockchain yet');
  }
  
  console.log('\nFull response:', JSON.stringify(status.data, null, 2));
}

getTxHash();
