const fs = require('fs');
const path = require('path');

const processorPath = path.join(__dirname, '../contracts/out/PaymentProcessor.sol/PaymentProcessor.json');
const artifact = JSON.parse(fs.readFileSync(processorPath, 'utf8'));

console.log('📋 PaymentProcessor Functions:\n');

artifact.abi
  .filter(item => item.type === 'function')
  .forEach(fn => {
    const params = fn.inputs.map(i => `${i.type} ${i.name}`).join(', ');
    const visibility = fn.stateMutability === 'view' || fn.stateMutability === 'pure' ? '(view)' : '';
    console.log(`${fn.name}(${params}) ${visibility}`);
  });
