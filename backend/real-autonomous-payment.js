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

async function realAutonomousPayment() {
  console.log('🤖 REAL AUTONOMOUS PAYMENT TEST\n');
  console.log('This will call AgentEscrow.executeAutoPayment()');
  console.log('One function = Create invoice + Auto-pay!\n');
  console.log('='.repeat(80));
  
  const amount = ethers.parseUnits('0.05', 6); // 0.05 USDC
  const description = 'TRUE Autonomous Payment - ' + new Date().toISOString();
  const usageHash = ethers.keccak256(ethers.toUtf8Bytes(description));
  const usageSignature = '0x00'; // Demo signature
  
  console.log('\n💰 Payment Details:');
  console.log('   Amount: 0.05 USDC');
  console.log('   Customer:', WALLET_ADDRESS);
  console.log('   Description:', description.substring(0, 50) + '...');
  console.log('\n🤖 Calling executeAutoPayment...\n');
  
  try {
    const tx = await circle.createContractExecutionTransaction({
      walletId: WALLET_ID,
      contractAddress: ESCROW_ADDRESS,
      abiFunctionSignature: 'executeAutoPayment(address,uint256,string,bytes32,bytes)',
      abiParameters: [
        WALLET_ADDRESS,     // customer
        amount.toString(),  // amount
        description,        // description
        usageHash,          // usageHash
        usageSignature      // usageSignature
      ],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    console.log('✅ Transaction submitted!');
    console.log('   TX ID:', tx.data.id);
    console.log('\n⏳ Waiting for confirmation (60 seconds)...\n');
    
    // Wait and check status
    await new Promise(r => setTimeout(r, 60000));
    
    const status = await circle.getTransaction({ id: tx.data.id });
    
    if (status.data.state === 'COMPLETE') {
      console.log('🎉 SUCCESS! AUTONOMOUS PAYMENT COMPLETE!\n');
      console.log('✅ Invoice created AND paid in ONE transaction!');
      console.log('✅ No human approval needed!');
      console.log('✅ This is TRUE autonomy!\n');
      console.log('🔗 View: https://testnet.arcscan.app/tx/' + status.data.txHash);
    } else {
      console.log('Status:', status.data.state);
      if (status.data.errorReason) {
        console.log('Error:', status.data.errorReason);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

realAutonomousPayment();
