require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const ESCROW_ADDRESS = process.env.AGENT_ESCROW_ADDRESS;
const WALLET_ID = process.env.PRIMARY_WALLET_ID;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

async function waitForTx(txId, desc) {
  console.log(`⏳ Waiting for ${desc}...`);
  
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const status = await circle.getTransaction({ id: txId });
    
    if (status.data.state) console.log('   Status:', status.data.state);
    
    if (status.data.state === 'COMPLETE') {
      console.log('✅ Complete!\n');
      return true;
    }
    
    if (status.data.state === 'FAILED') {
      console.log('❌ Failed:', status.data.errorReason, '\n');
      return false;
    }
  }
  return false;
}

async function main() {
  console.log('🤖 COMPLETE AUTONOMOUS PAYMENT SETUP\n');
  console.log('='.repeat(80));
  
  const provider = WALLET_ADDRESS; // Provider (ourselves for demo)
  const customer = WALLET_ADDRESS; // Customer (ourselves for demo)
  const amount = ethers.parseUnits('0.1', 6);
  const limit = ethers.parseUnits('1.0', 6); // 1 USDC spending limit
  
  console.log('\n📋 Setup:');
  console.log('   Customer:', customer);
  console.log('   Provider:', provider);
  console.log('   Amount: 0.1 USDC');
  console.log('   Spending Limit: 1.0 USDC\n');
  console.log('='.repeat(80));
  
  // Step 1: Set spending limit
  console.log('\n🔧 STEP 1: Setting spending limit...\n');
  try {
    const tx1 = await circle.createContractExecutionTransaction({
      walletId: WALLET_ID,
      contractAddress: ESCROW_ADDRESS,
      abiFunctionSignature: 'setSpendingLimit(address,uint256)',
      abiParameters: [provider, limit.toString()],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    const success1 = await waitForTx(tx1.data.id, 'setSpendingLimit');
    if (!success1) {
      console.log('⚠️  Could not set spending limit. Continuing anyway...\n');
    }
  } catch (error) {
    console.log('⚠️  Error setting limit:', error.message, '\n');
  }
  
  // Step 2: Create usage hash and signature (simplified for demo)
  console.log('📝 STEP 2: Creating usage proof...\n');
  const description = 'Autonomous AI Service - ' + new Date().toISOString();
  const usageData = ethers.solidityPacked(
    ['address', 'address', 'uint256', 'string'],
    [customer, provider, amount, description]
  );
  const usageHash = ethers.keccak256(usageData);
  const usageSignature = '0x' + '00'.repeat(65); // Dummy signature for demo
  
  console.log('   Usage Hash:', usageHash.slice(0, 20) + '...');
  console.log('   (Using demo signature)\n');
  
  // Step 3: Execute autonomous payment
  console.log('🤖 STEP 3: Executing autonomous payment...\n');
  try {
    const tx2 = await circle.createContractExecutionTransaction({
      walletId: WALLET_ID,
      contractAddress: ESCROW_ADDRESS,
      abiFunctionSignature: 'executeAutoPayment(address,uint256,string,bytes32,bytes)',
      abiParameters: [
        customer,
        amount.toString(),
        description,
        usageHash,
        usageSignature
      ],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    const success2 = await waitForTx(tx2.data.id, 'executeAutoPayment');
    
    if (success2) {
      console.log('='.repeat(80));
      console.log('\n🎉 SUCCESS! Autonomous payment executed!\n');
      console.log('✅ Invoice created and paid from escrow');
      console.log('✅ No human approval required');
      console.log('✅ Complete autonomous operation\n');
      console.log('Check new balance:');
      console.log('   node verify-escrow-deposit.js\n');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

main().catch(console.error);
