require('dotenv').config({ path: '../.env' });
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const REGISTRY_V2 = '0xd56fbd9277263db3cbe50d4d590d4199a109ec3e';
const PAYMENT_V2 = '0x0da221d7844b992e543cf3030c8116cc02f3e911';
const ESCROW_V2 = '0x4a7d7c86fe61ca6f409c9dc5ce7f3441af7f0b3d';
const POLICY_V2 = '0xe300509c58189372cfdd51ee8b2d49d5035be6b3';
const WALLET_ID = process.env.PRIMARY_WALLET_ID;

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

async function linkContracts() {
  console.log('🔗 Linking V2 Contracts...\n');
  
  // 1. Set PaymentProcessor
  console.log('1️⃣ Setting PaymentProcessor...');
  const tx1 = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: REGISTRY_V2,
    abiFunctionSignature: 'setPaymentProcessor(address)',
    abiParameters: [PAYMENT_V2],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  console.log('   TX:', tx1.data.id);
  await new Promise(r => setTimeout(r, 10000));
  
  // 2. Set AgentEscrow
  console.log('\n2️⃣ Setting AgentEscrow...');
  const tx2 = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: REGISTRY_V2,
    abiFunctionSignature: 'setAgentEscrow(address)',
    abiParameters: [ESCROW_V2],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  console.log('   TX:', tx2.data.id);
  await new Promise(r => setTimeout(r, 10000));
  
  // 3. Update PolicyManager
  console.log('\n3️⃣ Updating PolicyManager...');
  const tx3 = await circle.createContractExecutionTransaction({
    walletId: WALLET_ID,
    contractAddress: REGISTRY_V2,
    abiFunctionSignature: 'updatePolicyManager(address)',
    abiParameters: [POLICY_V2],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  console.log('   TX:', tx3.data.id);
  
  console.log('\n✅ All linking transactions submitted!');
  console.log('⏳ Wait 30 seconds for confirmation...\n');
}

linkContracts();
