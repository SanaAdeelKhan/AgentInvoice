const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, '../contracts/out/AgentEscrow.sol/AgentEscrow.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

console.log('\n📋 Copy this ABI to Circle Console:\n');
console.log(JSON.stringify(artifact.abi));
console.log('\n✅ ABI ready!');
