require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');

async function deploy() {
  console.log('🚀 Deploying AgentInvoice with Circle Wallets\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  const deployerAddress = process.env.PRIMARY_WALLET_ADDRESS;

  console.log('📡 Arc Testnet');
  console.log('🔑 Deployer:', deployerAddress);
  
  const balance = await provider.getBalance(deployerAddress);
  console.log('💰 Balance:', ethers.formatUnits(balance, 18), 'USDC\n');

  // Load compiled contracts from Foundry
  const registryArtifact = JSON.parse(
    fs.readFileSync('../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json', 'utf8')
  );
  const policyArtifact = JSON.parse(
    fs.readFileSync('../contracts/out/PolicyManager.sol/PolicyManager.json', 'utf8')
  );
  const processorArtifact = JSON.parse(
    fs.readFileSync('../contracts/out/PaymentProcessor.sol/PaymentProcessor.json', 'utf8')
  );

  console.log('✅ Contracts loaded\n');

  // Deploy InvoiceRegistry
  console.log('🚀 Deploying InvoiceRegistry...');
  const registryFactory = new ethers.ContractFactory(
    registryArtifact.abi,
    registryArtifact.bytecode.object,
    provider
  );

  const registryData = registryFactory.interface.encodeDeploy([deployerAddress]);
  const registryBytecode = registryFactory.bytecode + registryData.slice(2);

  const txResponse = await client.createContractExecutionTransaction({
    walletId: process.env.PRIMARY_WALLET_ID,
    contractAddress: '0x0000000000000000000000000000000000000000',
    callData: registryBytecode,
    abiFunctionSignature: 'constructor(address)',
    abiParameters: [deployerAddress],
    feeLevel: 'MEDIUM'
  });

  console.log('✅ Transaction ID:', txResponse.data.id);
  console.log('⏳ Waiting for confirmation...\n');

  // Wait for transaction
  let status;
  do {
    await new Promise(resolve => setTimeout(resolve, 3000));
    status = await client.getTransaction({ id: txResponse.data.id });
    console.log('   Status:', status.data.state);
  } while (['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status.data.state));

  if (status.data.state === 'CONFIRMED') {
    const receipt = await provider.getTransactionReceipt(status.data.txHash);
    console.log('🎉 InvoiceRegistry deployed at:', receipt.contractAddress);
    console.log('📝 Save this address!\n');
  } else {
    console.error('❌ Deployment failed:', status.data.state);
    process.exit(1);
  }
}

deploy().catch(console.error);
