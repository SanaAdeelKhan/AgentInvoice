require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const ESCROW_ADDRESS = process.env.AGENT_ESCROW_ADDRESS;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;

async function checkEscrow() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  
  const ESCROW_ABI = [
    'function getEscrowInfo(address _customer) external view returns (uint256 balance, uint256 depositCount, uint256 withdrawCount)'
  ];
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
  
  console.log('🔍 Checking AgentEscrow Status\n');
  console.log('Escrow Contract:', ESCROW_ADDRESS);
  console.log('Your Wallet:', WALLET_ADDRESS);
  console.log('\n' + '='.repeat(80));
  
  try {
    // Check USDC balance in escrow contract
    const escrowUsdcBalance = await usdc.balanceOf(ESCROW_ADDRESS);
    console.log('\n💰 USDC in Escrow Contract:', ethers.formatUnits(escrowUsdcBalance, 6), 'USDC');
    
    // Check your escrow account balance
    const escrowInfo = await escrow.getEscrowInfo(WALLET_ADDRESS);
    console.log('💼 Your Escrow Account Balance:', ethers.formatUnits(escrowInfo.balance, 6), 'USDC');
    console.log('📊 Deposits:', escrowInfo.depositCount.toString());
    console.log('📊 Withdrawals:', escrowInfo.withdrawCount.toString());
    
    console.log('\n' + '='.repeat(80));
    
    if (escrowInfo.balance === 0n) {
      console.log('\n⚠️  YOUR ESCROW IS EMPTY!');
      console.log('   This is why autonomous payments are not working automatically.');
      console.log('   You need to fund the escrow first:');
      console.log('   → node real-fund-escrow.js');
    } else {
      console.log('\n✅ Escrow is funded and ready for autonomous payments!');
    }
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

checkEscrow();
