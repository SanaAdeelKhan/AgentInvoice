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

async function createAutonomousInvoice() {
  console.log('🤖 CREATING AUTONOMOUS INVOICE\n');
  console.log('This will:');
  console.log('  1. Call AgentEscrow.executeAutoPayment()');
  console.log('  2. Pay automatically from your 1.0 USDC escrow');
  console.log('  3. Create invoice marked as AUTONOMOUS\n');
  console.log('='.repeat(80));
  
  const amount = ethers.parseUnits('0.1', 6); // 0.1 USDC
  const provider = WALLET_ADDRESS; // Provider receiving payment
  const metadata = 'Autonomous AI Service Payment - ' + new Date().toISOString();
  
  console.log('\n💰 Invoice Details:');
  console.log('   Amount: 0.1 USDC');
  console.log('   Provider:', provider);
  console.log('   Mode: AUTONOMOUS (no human approval!)\n');
  console.log('='.repeat(80));
  
  console.log('\n🤖 Executing autonomous payment...\n');
  
  try {
    const tx = await circle.createContractExecutionTransaction({
      walletId: WALLET_ID,
      contractAddress: ESCROW_ADDRESS,
      abiFunctionSignature: 'executeAutoPayment(address,uint256,string)',
      abiParameters: [provider, amount.toString(), metadata],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });
    
    console.log('Transaction ID:', tx.data.id);
    console.log('Waiting for execution...\n');
    
    // Wait for completion
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 3000));
      
      const status = await circle.getTransaction({ id: tx.data.id });
      
      if (status.data.state) {
        console.log('   Status:', status.data.state);
      }
      
      if (status.data.state === 'COMPLETE') {
        console.log('\n✅ AUTONOMOUS PAYMENT COMPLETE!\n');
        console.log('🎉 Invoice created and paid automatically!');
        console.log('🔗 View: https://testnet.arcscan.app/tx/' + status.data.txHash);
        console.log('\n💰 New escrow balance: 0.9 USDC (1.0 - 0.1)\n');
        return;
      }
      
      if (status.data.state === 'FAILED') {
        console.log('\n❌ Failed:', status.data.errorReason);
        return;
      }
    }
    
    console.log('\n⚠️  Still processing...');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  }
}

createAutonomousInvoice().catch(console.error);
