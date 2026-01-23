require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const REGISTRY_V2 = process.env.INVOICE_REGISTRY_V2_ADDRESS;
const WALLET_ADDRESS = process.env.PRIMARY_WALLET_ADDRESS;

const REGISTRY_ABI = [
  'function getInvoicesByPayer(address _payer) external view returns (bytes32[])'
];

async function checkResult() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(REGISTRY_V2, REGISTRY_ABI, provider);
  
  console.log('🔍 Checking V2 Invoice Registry...\n');
  console.log('Registry V2:', REGISTRY_V2);
  console.log('Wallet:', WALLET_ADDRESS);
  console.log('\n' + '='.repeat(80));
  
  const invoices = await registry.getInvoicesByPayer(WALLET_ADDRESS);
  
  console.log('\n📊 Total Invoices in V2:', invoices.length);
  
  if (invoices.length > 0) {
    console.log('\n🎉 SUCCESS! Invoices created in V2 registry!');
    console.log('✅ The autonomous payment system is working!');
    console.log('\n📋 Latest invoice IDs:');
    for (let i = Math.max(0, invoices.length - 3); i < invoices.length; i++) {
      console.log(`   ${i + 1}. ${invoices[i]}`);
    }
  } else {
    console.log('\n⏳ No invoices yet. Transaction may still be processing...');
    console.log('   Check again in a minute.');
  }
  
  console.log('\n🔗 View Registry: https://testnet.arcscan.app/address/' + REGISTRY_V2);
  console.log('🔗 View Escrow: https://testnet.arcscan.app/address/' + process.env.AGENT_ESCROW_V2_ADDRESS);
}

checkResult();
