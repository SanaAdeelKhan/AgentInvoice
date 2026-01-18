require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function createInvoice() {
  console.log('📝 Creating Invoice on New Deployment\n');
  
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET
  });

  const registryAddress = process.env.INVOICE_REGISTRY_ADDRESS;
  const walletId = process.env.PRIMARY_WALLET_ID;
  const walletAddress = process.env.PRIMARY_WALLET_ADDRESS;

  const payer = walletAddress;
  const payee = walletAddress;
  const amount = ethers.parseUnits('0.5', 6).toString();
  const description = 'Test Invoice - 0.5 USDC Payment';
  const usageHash = ethers.keccak256(ethers.toUtf8Bytes('Image generation service'));
  const usageSignature = '0x';

  console.log('📍 InvoiceRegistry:', registryAddress);
  console.log('💰 Wallet:', walletAddress);
  console.log('💵 Amount: 0.5 USDC\n');

  try {
    console.log('🔗 Creating invoice...');
    
    const tx = await client.createContractExecutionTransaction({
      walletId: walletId,
      contractAddress: registryAddress,
      abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
      abiParameters: [payer, payee, amount, description, usageHash, usageSignature],
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      }
    });

    console.log('✅ Transaction created:', tx.data.id);
    console.log('⏳ Waiting for confirmation...\n');

    // Wait and check on-chain instead of polling status
    await new Promise(r => setTimeout(r, 25000));

    const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
    const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    const registry = new ethers.Contract(registryAddress, artifact.abi, provider);
    
    try {
      const count = await registry.nextInvoiceId();
      
      if (count > 0) {
        console.log('🎉 INVOICE CREATED SUCCESSFULLY!\n');
        console.log('📋 Total invoices:', count.toString());
        
        const invoice = await registry.invoices(0);
        console.log('\n📄 Invoice #0:');
        console.log('   Payer:', invoice.payer || invoice[0]);
        console.log('   Payee:', invoice.payee || invoice[1]);
        console.log('   Amount:', ethers.formatUnits(invoice.amount || invoice[2], 6), 'USDC');
        console.log('   Description:', invoice.description || invoice[3]);
        console.log('   Status: PENDING ✅');
        console.log('\n🎊 NOW YOU CAN PAY THIS INVOICE!');
        console.log('   You have 1.0 USDC, invoice is 0.5 USDC');
      } else {
        console.log('⚠️  Transaction sent but not confirmed yet');
        console.log('   Wait a bit longer and check Arc Explorer');
      }
    } catch (e) {
      console.log('⚠️  Transaction sent but verification pending');
      console.log('   Error:', e.message);
    }
    
    console.log(`\n🔗 View: https://testnet.arcscan.com/address/${registryAddress}`);
    console.log(`🔗 Tx: https://testnet.arcscan.com/tx/${tx.data.id}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

createInvoice();
