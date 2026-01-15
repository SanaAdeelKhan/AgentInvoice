require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const ethers = require('ethers');

async function deploy() {
  console.log('🚀 Deploying AgentInvoice Contracts with Circle Wallets\n');

  // Initialize Circle client
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  // Connect to Arc Testnet
  const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
  
  console.log('📡 Connected to Arc Testnet');
  console.log('🔑 Using Circle Wallet:', process.env.PRIMARY_WALLET_ADDRESS);
  
  // Get wallet balance
  const balance = await provider.getBalance(process.env.PRIMARY_WALLET_ADDRESS);
  console.log('💰 Balance:', ethers.formatUnits(balance, 18), 'USDC\n');

  if (balance === 0n) {
    console.error('❌ Error: Wallet has no balance!');
    console.log('💡 Get USDC from: https://faucet.circle.com');
    process.exit(1);
  }

  console.log('✅ Ready to deploy!');
  console.log('⏳ Deployment will start once we add contract compilation...\n');
}

deploy().catch(console.error);
