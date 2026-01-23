require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');

async function deployContract(client, walletId, contractName, bytecode, constructorArgs = []) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  
  try {
    const response = await client.createTransaction({
      walletId: walletId,
      blockchain: 'ARC-TESTNET',
      to: null, // null = contract deployment
      data: bytecode,
      gasLimit: '5000000',
      fee: {
        type: 'level',
        config: { feeLevel: 'MEDIUM' }
      }
    });

    console.log('✅ Transaction created:', response.data.id);
    console.log('⏳ Waiting for confirmation (this may take 2-3 minutes)...');

    // Poll for status
    let status;
    let attempts = 0;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await client.getTransaction({ id: response.data.id });
      attempts++;
      console.log(`   [${attempts}] Status: ${status.data.state}`);
      
      if (attempts > 60) { // 5 min timeout
        throw new Error('Deployment timeout');
      }
    } while (['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status.data.state));

    if (status.data.state === 'CONFIRMED') {
      const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
      const receipt = await provider.getTransactionReceipt(status.data.txHash);
      
      console.log(`\n🎉 ${contractName} DEPLOYED!`);
      console.log(`📍 Address: ${receipt.contractAddress}`);
      console.log(`🔗 TX: ${status.data.txHash}\n`);
      
      return receipt.contractAddress;
    } else {
      throw new Error(`Deployment failed: ${status.data.state}`);
    }
  } catch (error) {
    console.error(`\n❌ ${contractName} deployment failed:`, error.message);
    throw error;
  }
}

async function deploy() {
  console.log('🔥 FINAL DEPLOYMENT: AgentInvoice with Circle Wallets\n');
  console.log('⚡ This deployment will be timestamped during hackathon!');
  console.log('📅 Deployment Date:', new Date().toISOString());
  console.log('');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  const deployerAddress = process.env.PRIMARY_WALLET_ADDRESS;
  const walletId = process.env.PRIMARY_WALLET_ID;

  console.log('📡 Arc Testnet');
  console.log('🔑 Circle Wallet:', deployerAddress);
  
  const balance = await provider.getBalance(deployerAddress);
  console.log('💰 Balance:', ethers.formatUnits(balance, 18), 'USDC\n');

  if (balance < ethers.parseUnits('0.5', 18)) {
    console.error('❌ Insufficient balance! Need at least 0.5 USDC');
    process.exit(1);
  }

  console.log('⏰ Starting deployment in 5 seconds...');
  console.log('   Press Ctrl+C to cancel\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Load compiled contracts
    const registryArtifact = JSON.parse(
      fs.readFileSync('../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json', 'utf8')
    );

    // Prepare bytecode with constructor
    const registryFactory = new ethers.ContractFactory(
      registryArtifact.abi,
      registryArtifact.bytecode.object,
      provider
    );
    
    const deployTx = await registryFactory.getDeployTransaction(deployerAddress);
    
    // Deploy!
    const registryAddress = await deployContract(
      client,
      walletId,
      'InvoiceRegistry',
      deployTx.data
    );

    console.log('\n🎊 DEPLOYMENT SUCCESSFUL!');
    console.log('\n📝 Save these addresses:');
    console.log(`INVOICE_REGISTRY=${registryAddress}`);
    console.log('\n💡 Deploy PolicyManager and PaymentProcessor next!');

  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
