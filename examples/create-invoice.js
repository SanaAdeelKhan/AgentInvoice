import { AgentInvoice, Helpers } from 'sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('📝 Creating Invoice Example\n');

  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in .env');
    console.log('💡 Copy .env.example to .env and add your private key');
    process.exit(1);
  }

  // Initialize SDK
  const sdk = new AgentInvoice(
    process.env.RPC_URL,
    process.env.INVOICE_REGISTRY,
    process.env.PAYMENT_PROCESSOR
  );

  // Create signer
  const provider = sdk.getProvider();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const signerAddress = await signer.getAddress();

  console.log(`👤 Signer: ${signerAddress}`);

  // Invoice details
  const invoiceParams = {
    payer: process.env.PAYER_ADDRESS || signerAddress,
    payee: process.env.PAYEE_ADDRESS || signerAddress,
    amount: '10.5', // 10.5 USDC
    description: 'API usage for AI agent - December 2025',
    usageData: {
      service: 'GPT-4 API',
      requests: 1500,
      tokens: 450000,
      period: 'December 2025'
    }
  };

  console.log('\n📋 Invoice Details:');
  console.log(`  Payer: ${invoiceParams.payer}`);
  console.log(`  Payee: ${invoiceParams.payee}`);
  console.log(`  Amount: ${invoiceParams.amount} USDC`);
  console.log(`  Description: ${invoiceParams.description}`);

  try {
    console.log('\n⏳ Creating invoice...');
    const invoiceId = await sdk.createInvoice(signer, invoiceParams);
    
    console.log('\n✅ Invoice created!');
    console.log(`📄 Invoice ID: ${invoiceId}`);
    console.log(`🔗 View on Explorer: https://testnet.arcscan.app/tx/${invoiceId}`);
    
    console.log('\n💡 Next: Check status with:');
    console.log(`   npm run status ${invoiceId}`);
  } catch (error) {
    console.error('\n❌ Error creating invoice:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Solution: Get test USDC from https://faucet.circle.com');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
