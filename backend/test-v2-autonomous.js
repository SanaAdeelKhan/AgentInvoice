require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const ESCROW_V2 = process.env.AGENT_ESCROW_V2_ADDRESS;
const WALLET_ID = process.env.PRIMARY_WALLET_ID;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

async function testV2Autonomous() {
  console.log('🧪 Testing V2 Autonomous Payment\n');
  console.log('Using AgentEscrow V2:', ESCROW_V2);
  console.log('\n='.repeat(80));
  
  const amount = ethers.parseUnits('0.05', 6);
  const description = 'V2 Autonomous Test - ' + new Date().toISOString();
  const usageHash = ethers.keccak256(ethers.toUtf8Bytes(description));
  const usageSignature = '0x00';
  
  console.log('\n💰 Payment Details:');
  console.log('   Amount: 0.05 USDC');
  console.log('   Customer:', WALLET_ADDRESS);
  
  console.log('\n🤖 Calling executeAutoPayment on V2 contract...\n');
  
  try {
    const tx = await circle.createContractExecutionTransaction({
      walletId: WALLET_ID,
      contractAddress: ESCROW_V2,
      abiFunctionSignature: 'executeAutoPayment(address,uint256,string,bytes32,bytes)',
      abiParameters: [
        WALLET_ADDRESS,
        amount.toString(),
        description,
        usageHash,
        usageSignature
      ],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    console.log('✅ Transaction submitted!');
    console.log('   TX ID:', tx.data.id);
    console.log('\n⏳ Waiting 60 seconds for confirmation...\n');
    
    await new Promise(r => setTimeout(r, 60000));
    
    const status = await circle.getTransaction({ id: tx.data.id });
    
    if (status.data.state === 'COMPLETE') {
      console.log('🎉🎉🎉 SUCCESS! V2 AUTONOMOUS PAYMENT WORKS! 🎉🎉🎉\n');
      console.log('✅ Invoice created AND paid in ONE transaction!');
      console.log('✅ No human approval needed!');
      console.log('✅ TRUE AUTONOMY ACHIEVED!\n');
      console.log('🔗 View: https://testnet.arcscan.app/tx/' + status.data.txHash);
    } else if (status.data.state === 'FAILED') {
      console.log('❌ Transaction FAILED');
      console.log('   Error:', status.data.errorDetails);
    } else {
      console.log('⏳ Still processing...');
      console.log('   State:', status.data.state);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testV2Autonomous();
