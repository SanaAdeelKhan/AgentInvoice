require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const PAYMENT_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS;

async function checkPaymentProcessor() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('🔍 Checking PaymentProcessor...\n');
  console.log('Address:', PAYMENT_ADDRESS);
  
  // Check if contract has code
  const code = await provider.getCode(PAYMENT_ADDRESS);
  console.log('\nContract code length:', code.length);
  console.log('Has code:', code !== '0x' ? '✅ YES' : '❌ NO - Contract not deployed!');
  
  // Check balance
  const balance = await provider.getBalance(PAYMENT_ADDRESS);
  console.log('ETH Balance:', ethers.formatEther(balance), 'ARC');
  
  console.log('\n🔗 View on explorer:');
  console.log('   https://testnet.arcscan.app/address/' + PAYMENT_ADDRESS);
}

checkPaymentProcessor();
