require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

async function checkLastTransaction() {
  console.log('🔍 Checking last Circle transaction status...\n');
  
  // Check the last payment transaction we ran
  const txId = 'ba38aa73-a751-5c6c-8ca1-a2b150460fd0';
  
  try {
    const status = await circle.getTransaction({ id: txId });
    
    console.log('Transaction ID:', txId);
    console.log('State:', status.data.state);
    console.log('Blockchain TxHash:', status.data.txHash || 'Not yet available');
    
    if (status.data.state === 'COMPLETE') {
      console.log('\n✅ Transaction COMPLETED on blockchain!');
      console.log('🔗 View: https://testnet.arcscan.app/tx/' + status.data.txHash);
    } else if (status.data.state === 'FAILED') {
      console.log('\n❌ Transaction FAILED');
      console.log('Reason:', status.data.errorReason);
    } else {
      console.log('\n⏳ Transaction still pending...');
      console.log('Current state:', status.data.state);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkLastTransaction();
