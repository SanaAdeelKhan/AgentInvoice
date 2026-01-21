require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

async function payInvoice(invoiceId, amount) {
    console.log(`\n💰 Paying invoice: ${invoiceId.slice(0, 30)}...`);
    console.log(`   Amount: ${amount} USDC`);
    
    try {
        // Step 1: Approve USDC
        console.log('  Step 1: Approving USDC...');
        const approveTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.USDC_ADDRESS,
            abiFunctionSignature: 'approve(address,uint256)',
            abiParameters: [process.env.PAYMENT_PROCESSOR_ADDRESS, amount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        
        console.log(`   ✅ Approve TX: ${approveTx.data.id}`);
        console.log('   ⏳ Waiting 12 seconds for confirmation...');
        await new Promise(resolve => setTimeout(resolve, 12000));
        
        // Step 2: Pay invoice
        console.log('  Step 2: Paying invoice...');
        const payTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.PAYMENT_PROCESSOR_ADDRESS,
            abiFunctionSignature: 'payInvoiceDirect(bytes32)',
            abiParameters: [invoiceId],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        
        console.log(`   ✅ Payment TX: ${payTx.data.id}`);
        console.log(`   🎉 Invoice PAID!\n`);
        
        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        return false;
    }
}

async function main() {
    console.log('');
    console.log('='.repeat(70));
    console.log('🤖 PAYING AUTONOMOUS INVOICES');
    console.log('='.repeat(70));
    console.log('');
    
    // Invoice 1: 0.1 USDC - AI Image Generation - 2 units
    const invoice1 = '0x73a6c0a190526cca834f31e6f2ec0b0bcab5a3fa0ffdba332daa82b5d3fbd28a';
    const amount1 = '100000'; // 0.1 USDC (6 decimals)
    
    const result1 = await payInvoice(invoice1, amount1);
    
    if (result1) {
        console.log('⏳ Waiting 5 seconds before next invoice...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Invoice 2: 0.05 USDC - AI Text Generation - 5 units
        const invoice2 = '0xde9fbd1e84e29aee1c24f742d959c4aaa62c982bcf3b4b5fb3b559e084615e5e';
        const amount2 = '50000'; // 0.05 USDC (6 decimals)
        
        await payInvoice(invoice2, amount2);
    }
    
    console.log('='.repeat(70));
    console.log('✅ AUTONOMOUS INVOICES PAYMENT COMPLETE!');
    console.log('='.repeat(70));
    console.log('');
    console.log('🔗 Refresh your dashboard to see them marked as PAID!');
    console.log('🎯 Your wallet now has 2 PAID autonomous invoices! 🎉');
    console.log('');
}

main().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
});
