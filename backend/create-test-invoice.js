require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');

async function createInvoice() {
  console.log('📝 Creating Test Invoice\n');

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
  const walletId = process.env.PRIMARY_WALLET_ID;
  const walletAddress = process.env.PRIMARY_WALLET_ADDRESS;

  const amount = ethers.parseUnits('0.5', 18);
  const description = 'AI Agent API Usage - January 2026';
  const usageHash = ethers.keccak256(ethers.toUtf8Bytes('usage-data-hash'));
  const usageSignature = '0x0000000000000000000000000000000000000000000000000000000000000000';

  try {
    console.log('Creating invoice...');
    console.log('Amount: 0.5 USDC\n');

    const tx = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
      abiParameters: [
        walletAddress,
        walletAddress,
        amount.toString(),
        description,
        usageHash,
        usageSignature
      ],
      fee: {
        type: 'level',
        config: { feeLevel: 'MEDIUM' }
      }
    });

    console.log('✅ TX Created:', tx.data.id);
    console.log('⏳ Waiting...\n');

    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const status = await client.getTransaction({ id: tx.data.id });
      
      const state = status.data.transaction?.state || 'UNKNOWN';
      console.log('[' + (i+1) + '] ' + state);
      
      if (state === 'COMPLETE') {
        console.log('\n🎉 Invoice Created!');
        console.log('TX:', status.data.transaction.txHash);
        console.log('\n🔄 Refresh dashboard!');
        break;
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

createInvoice();
