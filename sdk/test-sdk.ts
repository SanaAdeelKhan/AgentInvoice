import { AgentInvoice } from './src';

const sdk = new AgentInvoice(
  'https://rpc.testnet.arc.network',
  '0xDBe8c11e3e72062f6A8b3c64EBF8ED262B5D3A1b', // Your InvoiceRegistry
  '0x0C01067bd6D69D64409D505B28B9726cD354E49b'  // Your PaymentProcessor
);

console.log('SDK initialized successfully!');
console.log('Provider:', sdk.getProvider());
