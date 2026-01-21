require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');

const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

const AGENT_ID = 'ai-agent-autonomous-demo';
const SERVICE_TYPE = 'AI Code Generation';
const QUANTITY = 3;
const PRICE_PER_UNIT = 0.02; // $0.02 per unit
const TOTAL_AMOUNT = QUANTITY * PRICE_PER_UNIT; // 0.06 USDC

async function createTrueAutonomousInvoice() {
    console.log('');
    console.log('='.repeat(80));
    console.log('🤖 TRUE AUTONOMOUS PAYMENT - COMPLETE FLOW');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Agent ID: ${AGENT_ID}`);
    console.log(`Service: ${SERVICE_TYPE}`);
    console.log(`Quantity: ${QUANTITY} units`);
    console.log(`Total Amount: ${TOTAL_AMOUNT} USDC`);
    console.log('');
    console.log('This will execute:');
    console.log('  1. ✅ Fund AgentEscrow with USDC');
    console.log('  2. ✅ Create invoice on blockchain');
    console.log('  3. ✅ Auto-pay from escrow (NO human approval!)');
    console.log('  4. ✅ Mark invoice as PAID');
    console.log('');
    console.log('🔄 Starting autonomous flow...');
    console.log('='.repeat(80));
    console.log('');

    try {
        // STEP 1: FUND ESCROW
        console.log('💵 STEP 1: FUNDING AGENT ESCROW');
        console.log('-'.repeat(80));
        
        const fundAmount = ethers.parseUnits((TOTAL_AMOUNT * 2).toFixed(6), 6).toString(); // Fund 2x to show balance
        console.log(`   Funding amount: ${TOTAL_AMOUNT * 2} USDC`);
        
        // Approve USDC for escrow
        console.log('   → Approving USDC for AgentEscrow...');
        const approveEscrowTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.USDC_ADDRESS,
            abiFunctionSignature: 'approve(address,uint256)',
            abiParameters: [process.env.AGENT_ESCROW_ADDRESS, fundAmount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        
        console.log(`   ✅ Approve TX: ${approveEscrowTx.data.id}`);
        console.log(`   🔗 https://testnet.arcscan.app/tx/${approveEscrowTx.data.id}`);
        console.log('   ⏳ Waiting 12 seconds for confirmation...');
        await new Promise(resolve => setTimeout(resolve, 12000));
        
        // Deposit to escrow
        console.log('   → Depositing to AgentEscrow...');
        const depositTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.AGENT_ESCROW_ADDRESS,
            abiFunctionSignature: 'deposit(string,uint256)',
            abiParameters: [AGENT_ID, fundAmount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        
        console.log(`   ✅ Deposit TX: ${depositTx.data.id}`);
        console.log(`   🔗 https://testnet.arcscan.app/tx/${depositTx.data.id}`);
        console.log(`   ✅ Escrow funded with ${TOTAL_AMOUNT * 2} USDC`);
        console.log('');
        
        // Wait for confirmation
        console.log('   ⏳ Waiting 15 seconds for escrow confirmation...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // STEP 2: CREATE INVOICE
        console.log('📝 STEP 2: CREATING INVOICE ON BLOCKCHAIN');
        console.log('-'.repeat(80));
        
        const invoiceAmount = ethers.parseUnits(TOTAL_AMOUNT.toFixed(6), 6).toString();
        const description = `${SERVICE_TYPE} - ${QUANTITY} units (TRUE AUTONOMOUS - Auto-funded & Auto-paid)`;
        
        const usageData = JSON.stringify({
            service: SERVICE_TYPE,
            quantity: QUANTITY,
            agentId: AGENT_ID,
            autonomous: true,
            timestamp: Date.now()
        });
        const usageHash = ethers.keccak256(ethers.toUtf8Bytes(usageData));
        const usageSignature = '0x';
        
        console.log(`   Description: ${description}`);
        console.log(`   Amount: ${TOTAL_AMOUNT} USDC`);
        console.log('   → Creating invoice...');
        
        const createInvoiceTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
            abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
            abiParameters: [
                process.env.PRIMARY_WALLET_ADDRESS, // Payer
                process.env.PRIMARY_WALLET_ADDRESS, // Payee
                invoiceAmount,
                description,
                usageHash,
                usageSignature
            ],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        
        console.log(`   ✅ Invoice TX: ${createInvoiceTx.data.id}`);
        console.log(`   🔗 https://testnet.arcscan.app/tx/${createInvoiceTx.data.id}`);
        console.log('   ✅ Invoice created on blockchain');
        console.log('');
        
        // Wait for confirmation
        console.log('   ⏳ Waiting 12 seconds for invoice confirmation...');
        await new Promise(resolve => setTimeout(resolve, 12000));
        
        // STEP 3: AUTO-PAY FROM ESCROW
        console.log('💰 STEP 3: AUTO-PAYING FROM ESCROW (NO HUMAN APPROVAL!)');
        console.log('-'.repeat(80));
        console.log('   🤖 This is TRUE autonomous payment!');
        console.log('   → Executing payment from AgentEscrow...');
        
        const payFromEscrowTx = await circleClient.createContractExecutionTransaction({
            walletId: process.env.PRIMARY_WALLET_ID,
            contractAddress: process.env.AGENT_ESCROW_ADDRESS,
            abiFunctionSignature: 'payInvoice(string,bytes32,uint256)',
            abiParameters: [AGENT_ID, usageHash, invoiceAmount],
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
        });
        
        console.log(`   ✅ Payment TX: ${payFromEscrowTx.data.id}`);
        console.log(`   🔗 https://testnet.arcscan.app/tx/${payFromEscrowTx.data.id}`);
        console.log('   ✅ Payment executed from escrow automatically!');
        console.log('');
        
        // STEP 4: COMPLETION
        console.log('='.repeat(80));
        console.log('🎉 TRUE AUTONOMOUS INVOICE COMPLETE!');
        console.log('='.repeat(80));
        console.log('');
        console.log('📊 SUMMARY:');
        console.log('   Agent ID:', AGENT_ID);
        console.log('   Service:', SERVICE_TYPE);
        console.log('   Amount:', TOTAL_AMOUNT, 'USDC');
        console.log('   Status: ✅ PAID (Automatically from escrow!)');
        console.log('');
        console.log('🔗 TRANSACTIONS:');
        console.log(`   1. Escrow Approve: https://testnet.arcscan.app/tx/${approveEscrowTx.data.id}`);
        console.log(`   2. Escrow Deposit: https://testnet.arcscan.app/tx/${depositTx.data.id}`);
        console.log(`   3. Invoice Create: https://testnet.arcscan.app/tx/${createInvoiceTx.data.id}`);
        console.log(`   4. Auto Payment:  https://testnet.arcscan.app/tx/${payFromEscrowTx.data.id}`);
        console.log('');
        console.log('✅ This invoice was:');
        console.log('   ✓ Created automatically');
        console.log('   ✓ Paid automatically from pre-funded escrow');
        console.log('   ✓ NO human approval required');
        console.log('   ✓ Complete audit trail on blockchain');
        console.log('');
        console.log('🎯 THIS IS TRUE AI AGENT AUTONOMY!');
        console.log('');
        console.log('📱 Refresh your dashboard to see the new PAID autonomous invoice!');
        console.log('');
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('');
        console.error('❌ ERROR:', error.message);
        console.error('');
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

// RUN IT!
createTrueAutonomousInvoice().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
