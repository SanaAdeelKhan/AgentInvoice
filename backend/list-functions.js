const fs = require('fs');
const path = require('path');

const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

console.log('📋 All InvoiceRegistry functions:\n');

artifact.abi
  .filter(item => item.type === 'function' && !item.name.startsWith('_'))
  .forEach(fn => {
    const params = fn.inputs.map(i => `${i.type} ${i.name}`).join(', ');
    const visibility = fn.stateMutability === 'view' || fn.stateMutability === 'pure' ? '(view)' : '';
    console.log(`${fn.name}(${params}) ${visibility}`);
  });

console.log('\n\n🔍 Looking for "create" or "issue" functions:\n');

artifact.abi
  .filter(item => 
    item.type === 'function' && 
    (item.name.toLowerCase().includes('create') || 
     item.name.toLowerCase().includes('issue') ||
     item.name.toLowerCase().includes('new'))
  )
  .forEach(fn => {
    console.log(`\n✅ ${fn.name}`);
    console.log('   Parameters:', fn.inputs.length);
    fn.inputs.forEach((input, i) => {
      console.log(`     ${i + 1}. ${input.name} (${input.type})`);
    });
  });
