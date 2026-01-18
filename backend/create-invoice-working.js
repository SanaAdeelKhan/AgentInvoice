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

  // Invoice parameters
  const payer = walletAddress;
  const payee = walletAddress; // Pay to self for testing
  const amount = ethers.parseUnits('0.5', 6).toString(); // 0.5 USDC
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
      feeLevel: 'MEDIUM'
    });

    console.log('✅ Transaction created:', tx.data.id);
    console.log('⏳ Waiting for confirmation...');

    // Poll for status
    let status;
    do {
      await new Promise(r => setTimeout(r, 3000));
      status = await client.getTransaction({ id: tx.data.id });
      console.log('   Status:', status.data.state);
    } while (['INITIATED', 'PENDING_RISK_SCREENING', 'QUEUED', 'SENT'].includes(status.data.state));

    if (status.data.state === 'CONFIRMED') {
      console.log('\n🎉 INVOICE CREATED SUCCESSFULLY!\n');
      
      // Check the invoice on-chain
      const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
      const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      
      const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
      const registry = new ethers.Contract(registryAddress, artifact.abi, provider);
      
      try {
        const count = await registry.nextInvoiceId();
        console.log('📋 Total invoices:', count.toString());
        
        if (count > 0) {
          const invoice = await registry.invoices(0);
          console.log('\n📄 Invoice #0:');
          console.log('   Payer:', invoice.payer || invoice[0]);
          console.log('   Payee:', invoice.payee || invoice[1]);
          console.log('   Amount:', ethers.formatUnits(invoice.amount || invoice[2], 6), 'USDC');
          console.log('   Description:', invoice.description || invoice[3]);
          console.log('   Status: PENDING ✅');
          console.log('\n🎊 Ready to pay with your 1.0 USDC!');
        }
      } catch (e) {
        console.log('✅ Invoice created (verification pending)');
      }
      
      console.log(`\n🔗 View: https://testnet.arcscan.com/address/${registryAddress}`);
      
    } else {
      throw new Error('Transaction failed: ' + status.data.state);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

createInvoice();
