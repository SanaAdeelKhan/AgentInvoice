import { AgentInvoice } from 'sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const invoiceId = process.argv[2];

  if (!invoiceId) {
    console.error('❌ Usage: npm run status <invoice-id>');
    process.exit(1);
  }

  console.log('🔍 Checking Invoice Status\n');

  const sdk = new AgentInvoice(
    process.env.RPC_URL,
    process.env.INVOICE_REGISTRY,
    process.env.PAYMENT_PROCESSOR
  );

  try {
    console.log(`📄 Invoice ID: ${invoiceId}`);
    const invoice = await sdk.getInvoice(invoiceId);

    const statuses = ['PENDING', 'PAID', 'HELD', 'CANCELLED'];
    const statusColors = ['\x1b[33m', '\x1b[32m', '\x1b[31m', '\x1b[90m'];
    const statusColor = statusColors[invoice.status];

    console.log('\n📋 Invoice Details:');
    console.log(`  Payer: ${invoice.payer}`);
    console.log(`  Payee: ${invoice.payee}`);
    console.log(`  Amount: ${invoice.amount} wei`);
    console.log(`  Status: ${statusColor}${statuses[invoice.status]}\x1b[0m`);
    console.log(`  Description: ${invoice.description}`);
    console.log(`  Created: ${new Date(invoice.createdAt * 1000).toLocaleString()}`);
    
    if (invoice.paidAt > 0) {
      console.log(`  Paid: ${new Date(invoice.paidAt * 1000).toLocaleString()}`);
    }
    
    if (invoice.holdReason) {
      console.log(`  Hold Reason: ${invoice.holdReason}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
