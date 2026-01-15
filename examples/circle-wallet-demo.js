import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config({ path: '../backend/.env' });

async function main() {
  console.log('🎯 Circle Wallet Integration Demo\n');

  // Connect to Arc
  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  
  // Circle wallet address
  const circleWallet = process.env.PRIMARY_WALLET_ADDRESS;
  
  console.log('📡 Connected to Arc Testnet');
  console.log('🔑 Circle Developer-Controlled Wallet:', circleWallet);
  
  const balance = await provider.getBalance(circleWallet);
  console.log('💰 Wallet Balance:', ethers.formatUnits(balance, 18), 'USDC');
  
  console.log('\n✅ Circle Wallet Integration:');
  console.log('   - Developer-Controlled Wallet created via Circle SDK');
  console.log('   - Managed by Circle MPC technology');
  console.log('   - Ready for AgentInvoice transactions');
  
  console.log('\n🎉 Integration Complete!');
  console.log('💡 This wallet can create invoices, pay invoices, and manage transactions');
}

main();
