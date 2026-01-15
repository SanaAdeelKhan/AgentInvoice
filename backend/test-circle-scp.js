require('dotenv').config();
const { initiateSmartContractPlatformClient } = require('@circle-fin/smart-contract-platform');

const client = initiateSmartContractPlatformClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

console.log('Available methods:');
console.log(Object.keys(client));
