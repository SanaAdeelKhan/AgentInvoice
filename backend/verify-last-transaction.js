require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.testnet.arc.network';
const ESCROW_ADDRESS = process.env.AGENT_ESCROW_ADDRESS;

async function verifyTransaction() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('🔍 Checking AgentEscrow recent activity...\n');
  
  // Get recent block
  const currentBlock = await provider.getBlockNumber();
  console.log('Current block:', currentBlock);
  
  // Check last 100 blocks for our escrow contract
  const filter = {
    address: ESCROW_ADDRESS,
    fromBlock: currentBlock - 100,
    toBlock: 'latest'
  };
  
  const logs = await provider.getLogs(filter);
  console.log('\nRecent events:', logs.length);
  
  if (logs.length > 0) {
    console.log('\n✅ Found recent activity!');
    console.log('Latest event block:', logs[logs.length - 1].blockNumber);
  }
}

verifyTransaction();
