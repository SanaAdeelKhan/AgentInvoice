require('dotenv').config();
const { initiateSmartContractPlatformClient } = require('@circle-fin/smart-contract-platform');
const fs = require('fs');

async function deploy() {
  console.log('🚀 Deploying AgentInvoice Contracts with Circle Smart Contract Platform\n');

  const client = initiateSmartContractPlatformClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  console.log('📡 Connected to Circle');
  console.log('🔑 Wallet ID:', process.env.PRIMARY_WALLET_ID);
  console.log('');

  // Load compiled contract
  const registryArtifact = JSON.parse(
    fs.readFileSync('../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json', 'utf8')
  );

  console.log('✅ Contract loaded: InvoiceRegistry\n');

  // Deploy InvoiceRegistry
  console.log('🚀 Deploying InvoiceRegistry...');
  
  try {
    const response = await client.deployContract({
      name: 'AgentInvoice Registry',
      description: 'Invoice management contract for AI agent billing',
      walletId: process.env.PRIMARY_WALLET_ID,
      blockchain: 'ARC-TESTNET',
      abiJson: JSON.stringify(registryArtifact.abi),
      bytecode: registryArtifact.bytecode.object,
      constructorParameters: [process.env.PRIMARY_WALLET_ADDRESS], // deployer as temp policy manager
      feeLevel: 'MEDIUM'
    });

    console.log('✅ Deployment initiated!');
    console.log('📋 Contract ID:', response.data.id);
    console.log('⏳ Waiting for deployment...\n');

    // Poll for deployment status
    let status;
    do {
      await new Promise(resolve => setTimeout(resolve, 3000));
      status = await client.getContract({ id: response.data.id });
      console.log('   Status:', status.data.deployState);
    } while (status.data.deployState === 'PENDING' || status.data.deployState === 'DEPLOYING');

    if (status.data.deployState === 'DEPLOYED') {
      console.log('\n🎉 InvoiceRegistry DEPLOYED!');
      console.log('📍 Address:', status.data.address);
      console.log('🔗 TX Hash:', status.data.deployTxHash);
      console.log('\n📝 SAVE THIS ADDRESS FOR NEXT STEPS!');
    } else {
      console.error('\n❌ Deployment failed:', status.data.deployState);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

deploy().catch(console.error);
