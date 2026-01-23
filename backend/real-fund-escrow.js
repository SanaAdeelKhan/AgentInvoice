require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const ESCROW_ADDRESS = process.env.AGENT_ESCROW_ADDRESS;
const WALLET_ID = process.env.PRIMARY_WALLET_ID;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');

async function checkUSDCBalance() {
  console.log('💰 Checking USDC Balance...\n');
  
  const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, provider);
  
  const balance = await usdc.balanceOf(WALLET_ADDRESS);
  const formatted = ethers.formatUnits(balance, 6);
  
  console.log(`   Wallet: ${WALLET_ADDRESS}`);
  console.log(`   USDC Balance: ${formatted} USDC\n`);
  
  if (parseFloat(formatted) < 0.5) {
    console.log('❌ ERROR: Insufficient USDC balance!');
    console.log('   You need at least 0.5 USDC to fund the escrow.');
    process.exit(1);
  }
  
  return balance;
}

async function waitForTransaction(txId, description) {
  console.log(`⏳ Waiting for ${description}...`);
  console.log(`   Transaction ID: ${txId}`);
  
  let attempts = 0;
  const maxAttempts = 60;
  
  while (attempts < maxAttempts) {
    try {
      const response = await circle.getTransaction({ id: txId });
      const status = response.data;
      
      console.log(`   Status: ${status.state}`);
      
      if (status.state === 'COMPLETE') {
        console.log('✅ Transaction COMPLETE!');
        if (status.txHash) {
          console.log(`   Tx Hash: ${status.txHash}`);
          console.log(`   View: https://testnet.arcscan.app/tx/${status.txHash}`);
        }
        return status;
      }
      
      if (status.state === 'FAILED') {
        console.log('❌ Transaction FAILED!');
        console.log('   Reason:', status.errorReason || 'Unknown');
        throw new Error('Transaction failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
    } catch (error) {
      console.log('   Error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }
  
  throw new Error('Transaction timeout');
}

async function approveUSDC(amount) {
  console.log('\n📝 STEP 1: Approving USDC for AgentEscrow...\n');
  
  const response = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: USDC_ADDRESS,
    abiFunctionSignature: 'approve(address,uint256)',
    abiParameters: [ESCROW_ADDRESS, amount.toString()],
    fee: {
      type: 'level',
      config: { feeLevel: 'MEDIUM' }
    }
  });
  
  const txId = response.data.id;
  const result = await waitForTransaction(txId, 'USDC approval');
  
  return result;
}

async function depositToEscrow(agentId, amount) {
  console.log('\n💰 STEP 2: Depositing to AgentEscrow...\n');
  console.log(`   Agent ID: ${agentId}`);
  console.log(`   Amount: ${ethers.formatUnits(amount, 6)} USDC\n`);
  
  const response = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: ESCROW_ADDRESS,
    abiFunctionSignature: 'deposit(string,uint256)',
    abiParameters: [agentId, amount.toString()],
    fee: {
      type: 'level',
      config: { feeLevel: 'MEDIUM' }
    }
  });
  
  const txId = response.data.id;
  const result = await waitForTransaction(txId, 'Escrow deposit');
  
  return result;
}

async function main() {
  console.log('🚀 REAL AGENTESCROW FUNDING\n');
  console.log('='.repeat(60));
  
  const agentId = 'ai-agent-demo-001';
  const amountUSDC = '0.5';
  const amount = ethers.parseUnits(amountUSDC, 6);
  
  console.log(`\n📋 Funding Details:`);
  console.log(`   Agent ID: ${agentId}`);
  console.log(`   Amount: ${amountUSDC} USDC`);
  console.log(`   Escrow: ${ESCROW_ADDRESS}\n`);
  console.log('='.repeat(60));
  
  try {
    await checkUSDCBalance();
    await approveUSDC(amount);
    await depositToEscrow(agentId, amount);
    
    console.log('\n🎉 FUNDING COMPLETE!\n');
    console.log('🔗 Verify: https://testnet.arcscan.app/address/' + ESCROW_ADDRESS);
    console.log('\nYou should now see 2 transactions on AgentEscrow!');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

main();
