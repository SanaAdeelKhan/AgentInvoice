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

async function waitForTransaction(txId, description) {
  console.log(`⏳ Waiting for ${description}...`);
  
  let attempts = 0;
  while (attempts < 60) {
    try {
      const response = await circle.getTransaction({ id: txId });
      const status = response.data;
      
      if (status && status.state) {
        console.log(`   Status: ${status.state}`);
        
        if (status.state === 'COMPLETE') {
          console.log('✅ COMPLETE!');
          if (status.txHash) {
            console.log(`   Tx: https://testnet.arcscan.app/tx/${status.txHash}`);
          }
          return status;
        }
        
        if (status.state === 'FAILED') {
          console.log('❌ FAILED:', status.errorReason || 'Unknown');
          throw new Error('Transaction failed');
        }
      }
      
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    } catch (error) {
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    }
  }
  throw new Error('Timeout');
}

async function main() {
  console.log('🚀 FUNDING AGENTESCROW (CORRECT METHOD)\n');
  console.log('='.repeat(60));
  
  const amount = ethers.parseUnits('0.5', 6); // 0.5 USDC
  
  console.log('\nFunding Details:');
  console.log(`   Amount: 0.5 USDC`);
  console.log(`   Escrow: ${ESCROW_ADDRESS}\n`);
  console.log('='.repeat(60));
  
  // Step 1: Approve USDC
  console.log('\n📝 STEP 1: Approving USDC...\n');
  const approveTx = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: USDC_ADDRESS,
    abiFunctionSignature: 'approve(address,uint256)',
    abiParameters: [ESCROW_ADDRESS, amount.toString()],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  
  await waitForTransaction(approveTx.data.id, 'USDC approval');
  console.log('');
  
  // Step 2: Deposit to escrow (using YOUR contract's actual function!)
  console.log('💰 STEP 2: Depositing to AgentEscrow...\n');
  const depositTx = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: ESCROW_ADDRESS,
    abiFunctionSignature: 'depositToEscrow(uint256)',
    abiParameters: [amount.toString()],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  
  await waitForTransaction(depositTx.data.id, 'Escrow deposit');
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🎉 SUCCESS! AgentEscrow funded with 0.5 USDC!\n');
  console.log('🔗 View on Arc Explorer:');
  console.log(`   ${ESCROW_ADDRESS}`);
  console.log(`   https://testnet.arcscan.app/address/${ESCROW_ADDRESS}\n`);
  console.log('You should now see 2 transactions:');
  console.log('   1. USDC approval');
  console.log('   2. depositToEscrow\n');
}

main().catch(err => {
  console.log('\n❌ ERROR:', err.message);
  process.exit(1);
});
