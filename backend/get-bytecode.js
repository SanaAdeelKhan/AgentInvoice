const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const artifactPath = path.join(__dirname, '../contracts/out/AgentEscrow.sol/AgentEscrow.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Constructor parameters
const usdc = '0x3600000000000000000000000000000000000000';
const invoiceRegistry = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
const policyManager = '0x11dfb74caad23c1c8884646969d33a990b339886';

// Encode constructor
const abiCoder = new ethers.AbiCoder();
const encodedArgs = abiCoder.encode(
  ['address', 'address', 'address'],
  [usdc, invoiceRegistry, policyManager]
);

// Combine
const fullBytecode = artifact.bytecode.object + encodedArgs.slice(2);

console.log('\n📋 Copy this bytecode to Circle Console:\n');
console.log(fullBytecode);
console.log('\n✅ Bytecode copied! Paste into Circle Console deployment form.');
