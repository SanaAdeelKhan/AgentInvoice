require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const ESCROW_V2 = process.env.AGENT_ESCROW_V2_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;
const WALLET_ID = process.env.PRIMARY_WALLET_ID;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

async function fundV2Escrow() {
  console.log('💰 Funding V2 AgentEscrow\n');
  console.log('Escrow V2:', ESCROW_V2);
  console.log('Amount: 1.0 USDC\n');
  console.log('='.repeat(80));
  
  const amount = ethers.parseUnits('1', 6); // 1 USDC
  
  // Step 1: Approve
  console.log('\n1️⃣ Approving USDC...');
  const approveTx = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: USDC_ADDRESS,
    abiFunctionSignature: 'approve(address,uint256)',
    abiParameters: [ESCROW_V2, amount.toString()],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  console.log('   TX:', approveTx.data.id);
  await new Promise(r => setTimeout(r, 15000));
  
  // Step 2: Deposit
  console.log('\n2️⃣ Depositing to V2 escrow...');
  const depositTx = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: ESCROW_V2,
    abiFunctionSignature: 'depositToEscrow(uint256)',
    abiParameters: [amount.toString()],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  console.log('   TX:', depositTx.data.id);
  await new Promise(r => setTimeout(r, 15000));
  
  // Step 3: Set spending limit
  console.log('\n3️⃣ Setting spending limit...');
  const limitTx = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: ESCROW_V2,
    abiFunctionSignature: 'setSpendingLimit(address,uint256)',
    abiParameters: [WALLET_ADDRESS, ethers.parseUnits('1', 6).toString()],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  console.log('   TX:', limitTx.data.id);
  
  console.log('\n✅ All setup transactions submitted!');
  console.log('⏳ Wait 30 seconds, then test autonomous payment!\n');
}

fundV2Escrow();
