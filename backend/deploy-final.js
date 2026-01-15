require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');

async function deployContract(client, walletId, contractName, bytecode) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  
  try {
    const response = await client.createTransaction({
      walletId: walletId,
      blockchain: 'ARC-TESTNET',
      to: null,
      data: bytecode,
      gasLimit: '5000000',
      fee: {
        type: 'level',
        config: { feeLevel: 'MEDIUM' }
      }
    });

    console.log('✅ Transaction created:', response.data.id);
    console.log('⏳ Waiting...');

    let status;
    let attempts = 0;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await client.getTransaction({ id: response.data.id });
      attempts++;
      console.log(`   [${attempts}] ${status.data.state}`);
      
      if (attempts > 60) throw new Error('Timeout');
    } while (['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status.data.state));

    if (status.data.state === 'CONFIRMED') {
      const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
      const receipt = await provider.getTransactionReceipt(status.data.txHash);
      
      console.log(`\n🎉 ${contractName} DEPLOYED!`);
      console.log(`📍 ${receipt.contractAddress}`);
      
      return receipt.contractAddress;
    } else {
      throw new Error(`Failed: ${status.data.state}`);
    }
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function deploy() {
  console.log('🔥 DEPLOYING with Circle\n');
  console.log('📅', new Date().toISOString());

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  const deployerAddress = process.env.PRIMARY_WALLET_ADDRESS;
  const walletId = process.env.PRIMARY_WALLET_ID;

  console.log('🔑', deployerAddress);
  
  const balance = await provider.getBalance(deployerAddress);
  console.log('💰', ethers.formatUnits(balance, 18), 'USDC\n');

  try {
    const registryArtifact = JSON.parse(
      fs.readFileSync('../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json', 'utf8')
    );

    const registryFactory = new ethers.ContractFactory(
      registryArtifact.abi,
      registryArtifact.bytecode.object,
      provider
    );
    
    const deployTx = await registryFactory.getDeployTransaction(deployerAddress);
    
    const registryAddress = await deployContract(
      client,
      walletId,
      'InvoiceRegistry',
      deployTx.data
    );

    console.log('\n🎊 SUCCESS!');
    console.log(`REGISTRY=${registryAddress}`);

  } catch (error) {
    console.error('\n💥 Failed');
    process.exit(1);
  }
}

deploy();
