require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployEscrow() {
  console.log('🚀 Deploying AgentEscrow Contract\n');
  
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  // Load compiled bytecode
  const artifactPath = path.join(__dirname, '../contracts/out/AgentEscrow.sol/AgentEscrow.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Constructor parameters
  const usdc = process.env.USDC_ADDRESS;
  const invoiceRegistry = process.env.INVOICE_REGISTRY_ADDRESS;
  const policyManager = process.env.POLICY_MANAGER_ADDRESS;

  // Encode constructor
  const iface = new ethers.Interface(artifact.abi);
  const constructorArgs = iface.encodeDeploy([usdc, invoiceRegistry, policyManager]);
  
  // Combine bytecode + constructor
  const deployData = artifact.bytecode.object + constructorArgs.slice(2);

  console.log('📋 Deployment Details:');
  console.log('   USDC:', usdc);
  console.log('   InvoiceRegistry:', invoiceRegistry);
  console.log('   PolicyManager:', policyManager);
  console.log();

  try {
    const response = await client.deployContract({
      walletId: process.env.PRIMARY_WALLET_ID,
      blockchain: 'ARC-TESTNET',
      bytecode: deployData,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      }
    });

    console.log('✅ Deployment initiated!');
    console.log('   Transaction ID:', response.data.id);
    console.log();
    console.log('⏳ Waiting 30 seconds for deployment...\n');
    
    await new Promise(r => setTimeout(r, 30000));

    // Get deployed address
    const tx = await client.getTransaction({ id: response.data.id });
    
    if (tx.data?.transaction?.contractAddress) {
      const escrowAddress = tx.data.transaction.contractAddress;
      
      console.log('🎉 AgentEscrow DEPLOYED!');
      console.log('   Address:', escrowAddress);
      console.log();
      console.log('📝 Add to .env:');
      console.log(`AGENT_ESCROW_ADDRESS=${escrowAddress}`);
      console.log();
      console.log('🔗 View on Circle Console');
      
      // Append to .env
      fs.appendFileSync(path.join(__dirname, '../.env'), `\nAGENT_ESCROW_ADDRESS=${escrowAddress}\n`);
      console.log('✅ Added to .env file!');
      
    } else {
      console.log('⏳ Deployment pending, check Circle Console');
      console.log('Transaction:', JSON.stringify(tx.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

deployEscrow();
