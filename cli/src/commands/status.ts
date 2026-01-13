import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AgentInvoice } from 'sdk';
import { loadConfig } from '../utils/config';

export const statusCommand = new Command('status')
  .description('Check invoice status')
  .argument('<invoice-id>', 'Invoice ID to check')
  .action(async (invoiceId: string) => {
    const config = loadConfig();
    
    if (!config) {
      console.error(chalk.red('❌ Configuration not found. Run: agent-invoice setup'));
      process.exit(1);
    }

    const spinner = ora('Fetching invoice...').start();

    try {
      const sdk = new AgentInvoice(
        config.RPC_URL,
        config.INVOICE_REGISTRY,
        config.PAYMENT_PROCESSOR
      );

      const invoice = await sdk.getInvoice(invoiceId);
      spinner.succeed('Invoice found!');

      console.log(chalk.blue('\n📄 Invoice Details:\n'));
      console.log(chalk.gray('ID:          ') + invoice.id);
      console.log(chalk.gray('Payer:       ') + invoice.payer);
      console.log(chalk.gray('Payee:       ') + invoice.payee);
      console.log(chalk.gray('Amount:      ') + chalk.green(invoice.amount + ' USDC'));
      console.log(chalk.gray('Description: ') + invoice.description);
      console.log(chalk.gray('Created:     ') + new Date(invoice.createdAt * 1000).toLocaleString());
      
      if (invoice.paidAt > 0) {
        console.log(chalk.gray('Paid:        ') + new Date(invoice.paidAt * 1000).toLocaleString());
      }
      
      console.log();
    } catch (error: any) {
      spinner.fail('Failed to fetch invoice');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });
