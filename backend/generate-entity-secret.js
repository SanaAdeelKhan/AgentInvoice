const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log('\n🔐 Entity Secret Generated:\n');
console.log(secret);
console.log('\n⚠️  SAVE THIS SECURELY! You will need it for Circle API.\n');
