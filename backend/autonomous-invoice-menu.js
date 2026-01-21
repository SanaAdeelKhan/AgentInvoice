require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const readline = require('readline');

const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

const SERVICES = {
    '1': { name: 'AI Image Generation', price: 0.05, unit: 'image' },
    '2': { name: 'AI Text Generation', price: 0.01, unit: '1000 tokens' },
    '3': { name: 'AI Code Generation', price: 0.02, unit: 'request' },
    '4': { name: 'AI Data Analysis', price: 0.03, unit: 'analysis' },
    '5': { name: 'AI Voice Synthesis', price: 0.04, unit: 'minute' }
};

async function createAutonomousInvoice(serviceKey, quantity) {
    const service = SERVICES[serviceKey];
    const AGENT_ID = `ai-agent-${Date.now()}`;
    const TOTAL_AMOUNT = service.price * quantity;
    
    console.log('');
    console.log('='.repeat(80));
    console.log('🤖 CREATING AUTONOMOUS INVOICE');
    console.log('='.repeat(80));
    console.log(`Service: ${service.name}`);
    console.log(`Quantity: ${quantity} ${service.unit}(s)`);
    console.log(`Price: $${service.price} per ${service.unit}`);
    console.log(`Total: $${TOTAL_AMOUNT} USDC`);
    console.log('='.repeat(80));
    console.log('');

    try {
        // Fund escrow
        const fundAmount = ethers.parseUnits((TOTAL_AMOUNT * 2).toFixed(6), 6).toString();
        console.log('💵 Funding escrow...');
        
        const approveEscrowTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.USDC_ADDRESS,
            abiFunctionSignature: 'approve(address,uint256)',
            abiParameters: [process.env.AGENT_ESCROW_ADDRESS, fundAmount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        console.log(`✅ Approve: ${approveEscrowTx.data.id}`);
        await new Promise(resolve => setTimeout(resolve, 12000));
        
        const depositTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.AGENT_ESCROW_ADDRESS,
            abiFunctionSignature: 'deposit(string,uint256)',
            abiParameters: [AGENT_ID, fundAmount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        console.log(`✅ Deposit: ${depositTx.data.id}`);
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Create invoice
        const invoiceAmount = ethers.parseUnits(TOTAL_AMOUNT.toFixed(6), 6).toString();
        const description = `${service.name} - ${quantity} ${service.unit}(s) (AUTONOMOUS - Auto-funded & Auto-paid)`;
        const usageData = JSON.stringify({
            service: service.name,
            quantity,
            agentId: AGENT_ID,
            autonomous: true,
            timestamp: Date.now()
        });
        const usageHash = ethers.keccak256(ethers.toUtf8Bytes(usageData));
        
        console.log('📝 Creating invoice...');
        const createInvoiceTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
            abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
            abiParameters: [
                process.env.PRIMARY_WALLET_ADDRESS,
                process.env.PRIMARY_WALLET_ADDRESS,
                invoiceAmount,
                description,
                usageHash,
                '0x'
            ],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        console.log(`✅ Invoice: ${createInvoiceTx.data.id}`);
        await new Promise(resolve => setTimeout(resolve, 12000));
        
        // Auto-pay
        console.log('💰 Auto-paying from escrow...');
        const payFromEscrowTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.AGENT_ESCROW_ADDRESS,
            abiFunctionSignature: 'payInvoice(string,bytes32,uint256)',
            abiParameters: [AGENT_ID, usageHash, invoiceAmount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        console.log(`✅ Payment: ${payFromEscrowTx.data.id}`);
        
        console.log('');
        console.log('='.repeat(80));
        console.log('🎉 AUTONOMOUS INVOICE CREATED & PAID!');
        console.log('='.repeat(80));
        console.log(`Service: ${service.name}`);
        console.log(`Amount: ${TOTAL_AMOUNT} USDC`);
        console.log(`Status: ✅ PAID`);
        console.log('');
        console.log('🔗 Transactions:');
        console.log(`   Escrow: https://testnet.arcscan.app/tx/${depositTx.data.id}`);
        console.log(`   Invoice: https://testnet.arcscan.app/tx/${createInvoiceTx.data.id}`);
        console.log(`   Payment: https://testnet.arcscan.app/tx/${payFromEscrowTx.data.id}`);
        console.log('');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('🤖 AUTONOMOUS INVOICE GENERATOR');
    console.log('='.repeat(80));
    console.log('');
    console.log('Available Services:');
    Object.entries(SERVICES).forEach(([key, service]) => {
        console.log(`  ${key}. ${service.name} - $${service.price} per ${service.unit}`);
    });
    console.log('');

    rl.question('Select service (1-5): ', (serviceKey) => {
        if (!SERVICES[serviceKey]) {
            console.log('Invalid selection!');
            rl.close();
            return;
        }

        rl.question('Enter quantity: ', async (quantity) => {
            rl.close();
            await createAutonomousInvoice(serviceKey, parseInt(quantity));
        });
    });
}

main();
