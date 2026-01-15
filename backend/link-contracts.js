require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');

async function linkContracts() {
  console.log('🔗 Linking AgentInvoice Contracts\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
  const policyAddress = '0x11dfb74caad23c1c8884646969d33a990b339886';
  const processorAddress = '0x3e412244e13701516a3a364278e4f43ba036b864';
  
  const walletId = process.env.PRIMARY_WALLET_ID;

  const registryABI = [
    'function setPaymentProcessor(address _paymentProcessor)',
    'function updatePolicyManager(address _newPolicyManager)'
  ];

  const iface = new ethers.Interface(registryABI);

  try {
    // 1. Set PaymentProcessor
    console.log('🔗 Step 1: Setting PaymentProcessor...');
    const setProcessorData = iface.encodeFunctionData('setPaymentProcessor', [processorAddress]);
    
    const tx1 = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'setPaymentProcessor(address)',
      abiParameters: [processorAddress],
      feeLevel: 'MEDIUM'
    });

    console.log('✅ Transaction created:', tx1.data.id);
    console.log('⏳ Waiting...');

    let status1;
    do {
      await new Promise(r => setTimeout(r, 3000));
      status1 = await client.getTransaction({ id: tx1.data.id });
      console.log('   Status:', status1.data.state);
    } while (['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status1.data.state));

    if (status1.data.state === 'CONFIRMED') {
      console.log('🎉 PaymentProcessor linked!\n');
    } else {
      throw new Error('Failed: ' + status1.data.state);
    }

    // 2. Update PolicyManager
    console.log('🔗 Step 2: Updating PolicyManager...');
    
    const tx2 = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'updatePolicyManager(address)',
      abiParameters: [policyAddress],
      feeLevel: 'MEDIUM'
    });

    console.log('✅ Transaction created:', tx2.data.id);
    console.log('⏳ Waiting...');

    let status2;
    do {
      await new Promise(r => setTimeout(r, 3000));
      status2 = await client.getTransaction({ id: tx2.data.id });
      console.log('   Status:', status2.data.state);
    } while (['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status2.data.state));

    if (status2.data.state === 'CONFIRMED') {
      console.log('🎉 PolicyManager updated!\n');
    } else {
      throw new Error('Failed: ' + status2.data.state);
    }

    console.log('🎊 CONTRACTS LINKED!');
    console.log('✅ AgentInvoice fully operational!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

linkContracts();
