require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function linkContracts() {
  console.log('🔗 FINAL LINKING!\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
  const policyAddress = '0x11dfb74caad23c1c8884646969d33a990b339886';
  const walletId = process.env.PRIMARY_WALLET_ID;

  try {
    // Step 2: updatePolicyManager (step 1 already done!)
    console.log('🔗 Updating PolicyManager...');
    
    const tx = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'updatePolicyManager(address)',
      abiParameters: [policyAddress],
      fee: {
        type: 'level',
        config: { feeLevel: 'MEDIUM' }
      }
    });

    console.log('✅ TX Created:', tx.data.id);
    console.log('⏳ Waiting...\n');
    
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const status = await client.getTransaction({ id: tx.data.id });
      
      const state = status.data.transaction.state;
      console.log(`[${i+1}] ${state}`);
      
      if (state === 'COMPLETE') {
        console.log('\n🎉🎉🎉 SUCCESS!');
        console.log('TX Hash:', status.data.transaction.txHash);
        console.log('\n🎊🎊🎊 ALL CONTRACTS LINKED! 🎊🎊🎊');
        console.log('\n✅ AgentInvoice FULLY OPERATIONAL!');
        console.log('🏆 ALHAMDULILLAH! Ready to WIN!');
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

linkContracts();
