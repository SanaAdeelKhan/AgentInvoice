require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function linkContracts() {
  console.log('🔗 Linking Contracts - CORRECT METHOD!\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
  const policyAddress = '0x11dfb74caad23c1c8884646969d33a990b339886';
  const processorAddress = '0x3e412244e13701516a3a364278e4f43ba036b864';
  const walletId = process.env.PRIMARY_WALLET_ID;

  try {
    // Step 1: setPaymentProcessor
    console.log('🔗 Step 1: Setting PaymentProcessor...');
    
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

    console.log('✅ TX Created:', tx1.data.id);
    console.log('⏳ Waiting...');

    // Poll for status
    let status1;
    let attempts = 0;
    do {
      await new Promise(r => setTimeout(r, 5000));
      status1 = await client.getTransaction({ id: tx1.data.id });
      attempts++;
      
      const state = status1.data?.state || 'UNKNOWN';
      console.log(`   [${attempts}] ${state}`);
      
      if (attempts > 40) throw new Error('Timeout');
    } while (!status1.data?.state || ['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status1.data.state));

    if (status1.data.state === 'CONFIRMED') {
      console.log('🎉 PaymentProcessor linked!\n');
    } else {
      throw new Error('Failed: ' + status1.data.state);
    }

    // Step 2: updatePolicyManager
    console.log('🔗 Step 2: Updating PolicyManager...');
    
    const tx2 = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'updatePolicyManager(address)',
      abiParameters: [policyAddress],
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      }
    });

    console.log('✅ TX Created:', tx2.data.id);
    console.log('⏳ Waiting...');

    let status2;
    attempts = 0;
    do {
      await new Promise(r => setTimeout(r, 5000));
      status2 = await client.getTransaction({ id: tx2.data.id });
      attempts++;
      
      const state = status2.data?.state || 'UNKNOWN';
      console.log(`   [${attempts}] ${state}`);
      
      if (attempts > 40) throw new Error('Timeout');
    } while (!status2.data?.state || ['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status2.data.state));

    if (status2.data.state === 'CONFIRMED') {
      console.log('🎉 PolicyManager updated!\n');
    } else {
      throw new Error('Failed: ' + status2.data.state);
    }

    console.log('🎊🎊🎊 SUCCESS! ALL CONTRACTS LINKED! 🎊🎊🎊');
    console.log('\n✅ AgentInvoice is FULLY OPERATIONAL!');
    console.log('🏆 Ready for VICTORY! Alhamdulillah!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

linkContracts();
