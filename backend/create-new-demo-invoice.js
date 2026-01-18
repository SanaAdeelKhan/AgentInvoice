require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');

async function createInvoice() {
  console.log('📝 Creating NEW Demo Invoice\n');
  
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const payer = process.env.PRIMARY_WALLET_ADDRESS;
  const payee = process.env.PRIMARY_WALLET_ADDRESS;
  const amount = ethers.parseUnits('1.0', 6).toString(); // 1.0 USDC
  const description = 'AI Image Generation - Demo Invoice';
  const usageHash = ethers.keccak256(ethers.toUtf8Bytes('Generated 20 images, 1024x1024, DALL-E 3'));
  const usageSignature = '0x';

  console.log('Creating 1.0 USDC invoice...\n');

  const tx = await client.createContractExecutionTransaction({
    walletId: process.env.PRIMARY_WALLET_ID,
    contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
    abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
    abiParameters: [payer, payee, amount, description, usageHash, usageSignature],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });

  console.log('✅ Transaction:', tx.data.id);
  console.log('⏳ Waiting 20 seconds...\n');
  
  await new Promise(r => setTimeout(r, 20000));
  
  console.log('🎉 NEW INVOICE CREATED!');
  console.log('💰 Amount: 1.0 USDC');
  console.log('📄 Description: AI Image Generation - Demo Invoice');
  console.log('\n✅ Refresh your dashboard to see it!');
}

createInvoice();
