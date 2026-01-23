require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;

const USDC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  
  console.log('💰 Checking USDC Balance...\n');
  console.log('Wallet:', WALLET_ADDRESS);
  console.log('USDC Contract:', USDC_ADDRESS);
  
  try {
    const balance = await usdc.balanceOf(WALLET_ADDRESS);
    const decimals = await usdc.decimals();
    const formatted = ethers.formatUnits(balance, decimals);
    
    console.log('\n✅ Current Balance:', formatted, 'USDC');
    console.log('🔗 View wallet: https://testnet.arcscan.app/address/' + WALLET_ADDRESS);
    
    if (parseFloat(formatted) < 0.1) {
      console.log('\n⚠️  WARNING: Insufficient balance for autonomous payments!');
      console.log('   Need at least 0.1 USDC to test.');
    }
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

checkBalance();
