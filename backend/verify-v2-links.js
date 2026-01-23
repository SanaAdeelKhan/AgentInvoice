require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const REGISTRY_V2 = '0xd56fbd9277263db3cbe50d4d590d4199a109ec3e';

const ABI = [
  'function paymentProcessor() view returns (address)',
  'function agentEscrow() view returns (address)',
  'function policyManager() view returns (address)'
];

async function verify() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(REGISTRY_V2, ABI, provider);
  
  console.log('🔍 Verifying V2 Contract Links...\n');
  
  const payment = await registry.paymentProcessor();
  const escrow = await registry.agentEscrow();
  const policy = await registry.policyManager();
  
  console.log('✅ PaymentProcessor:', payment);
  console.log('✅ AgentEscrow:', escrow);
  console.log('✅ PolicyManager:', policy);
  
  const allLinked = 
    payment.toLowerCase() === '0x0da221d7844b992e543cf3030c8116cc02f3e911' &&
    escrow.toLowerCase() === '0x4a7d7c86fe61ca6f409c9dc5ce7f3441af7f0b3d' &&
    policy.toLowerCase() === '0xe300509c58189372cfdd51ee8b2d49d5035be6b3';
  
  if (allLinked) {
    console.log('\n🎉 ALL CONTRACTS LINKED SUCCESSFULLY!');
    console.log('✅ V2 deployment complete!');
    console.log('✅ Ready to test autonomous payments!\n');
  } else {
    console.log('\n⚠️  Some links not updated yet. Wait a bit longer...\n');
  }
}

verify();
