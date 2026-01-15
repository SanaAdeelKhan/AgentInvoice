require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function setup() {
  console.log('🔧 Setting up Circle Wallets for AgentInvoice...\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  try {
    // Step 1: Create Wallet Set
    console.log('Step 1: Creating wallet set...');
    const walletSet = await client.createWalletSet({
      name: 'AgentInvoice Wallets'
    });
    
    const walletSetId = walletSet.data.walletSet.id;
    console.log('✅ Wallet Set created:', walletSetId);
    console.log('   Add this to .env as WALLET_SET_ID\n');

    // Step 2: Create Wallets
    console.log('Step 2: Creating wallets on Arc Testnet...');
    const wallets = await client.createWallets({
      accountType: 'EOA',
      blockchains: ['ARC-TESTNET'],
      count: 2,
      walletSetId: walletSetId
    });

    console.log('✅ Wallets created:\n');
    wallets.data.wallets.forEach((wallet, i) => {
      console.log(`   Wallet ${i + 1}:`);
      console.log(`   Address: ${wallet.address}`);
      console.log(`   ID: ${wallet.id}`);
      console.log('');
    });

    console.log('📝 Update your .env file:');
    console.log(`WALLET_SET_ID=${walletSetId}`);
    console.log(`PRIMARY_WALLET_ID=${wallets.data.wallets[0].id}`);
    console.log(`PRIMARY_WALLET_ADDRESS=${wallets.data.wallets[0].address}`);
    console.log('');
    console.log('🎉 Setup complete!');
    console.log('💰 Fund your wallet at: https://faucet.circle.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

setup();
