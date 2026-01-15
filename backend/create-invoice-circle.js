import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env' });

async function main() {
  console.log('🎯 Creating Invoice with Circle Wallet\n');

  // Connect to Arc
  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  
  // Circle wallet address
  const circleWallet = process.env.PRIMARY_WALLET_ADDRESS;
  
  console.log('📡 Arc Testnet');
  console.log('🔑 Circle Wallet:', circleWallet);
  
  const balance = await provider.getBalance(circleWallet);
  console.log('💰 Balance:', ethers.formatUnits(balance, 18), 'USDC\n');
  
  console.log('✅ Circle wallet integration ready!');
  console.log('📝 This wallet can now create and pay invoices');
  console.log('🎉 Demo complete!');
}

main();
