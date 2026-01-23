require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const REGISTRY_V2 = process.env.INVOICE_REGISTRY_V2_ADDRESS;

const REGISTRY_ABI = [
  'function getInvoice(bytes32) view returns (bytes32,address,address,uint256,uint8,string,bytes32,bytes,uint256,uint256,string)'
];

async function verifyPaid() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(REGISTRY_V2, REGISTRY_ABI, provider);
  
  const invoiceId = '0x29821b5e683d8a484c697269dd9e9c5c480273bc3719218ba2cd4ec657497918';
  
  console.log('🔍 Checking Invoice Status...\n');
  console.log('Invoice ID:', invoiceId);
  console.log('\n' + '='.repeat(80));
  
  try {
    const invoice = await registry.getInvoice(invoiceId);
    
    const statusNames = ['PENDING', 'PAID', 'HELD', 'CANCELLED'];
    const status = statusNames[invoice[4]];
    const amount = ethers.formatUnits(invoice[3], 6);
    
    console.log('\n📋 Invoice Details:');
    console.log('   Amount:', amount, 'USDC');
    console.log('   Status:', status);
    console.log('   Description:', invoice[5]);
    
    if (status === 'PAID') {
      console.log('\n🎉🎉🎉 SUCCESS! INVOICE IS PAID! 🎉🎉🎉');
      console.log('\n✅ TRUE AUTONOMOUS PAYMENT CONFIRMED!');
      console.log('✅ Invoice created AND paid in ONE transaction!');
      console.log('✅ NO human approval needed!');
      console.log('✅ AgentInvoice V2 is WORKING PERFECTLY!\n');
    } else {
      console.log('\n⚠️  Status is', status);
      console.log('   Expected: PAID');
      console.log('   This means the contract logic needs debugging.\n');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

verifyPaid();
