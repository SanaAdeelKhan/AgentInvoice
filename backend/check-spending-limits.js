require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const ESCROW_ADDRESS = process.env.AGENT_ESCROW_ADDRESS;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

async function checkLimits() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  const ESCROW_ABI = [
    'function getSpendingInfo(address _customer, address _provider) external view returns (uint256 limit, uint256 spent)'
  ];
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
  
  console.log('🔍 Checking Spending Limits\n');
  console.log('Escrow:', ESCROW_ADDRESS);
  console.log('Customer (You):', WALLET_ADDRESS);
  console.log('Provider (Also You):', WALLET_ADDRESS);
  console.log('\n' + '='.repeat(80));
  
  try {
    const info = await escrow.getSpendingInfo(WALLET_ADDRESS, WALLET_ADDRESS);
    
    console.log('\n💳 Spending Limit:', ethers.formatUnits(info.limit, 6), 'USDC');
    console.log('💰 Already Spent:', ethers.formatUnits(info.spent, 6), 'USDC');
    console.log('💵 Remaining:', ethers.formatUnits(info.limit - info.spent, 6), 'USDC');
    
    console.log('\n' + '='.repeat(80));
    
    if (info.limit === 0n) {
      console.log('\n❌ NO SPENDING LIMIT SET!');
      console.log('   This is why autonomous payments fail!');
      console.log('   The contract requires a spending limit to be set.');
      console.log('\n📝 To fix: Set a spending limit for autonomous payments');
    } else {
      console.log('\n✅ Spending limit is configured!');
    }
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

checkLimits();
