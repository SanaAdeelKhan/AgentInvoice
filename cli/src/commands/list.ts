import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AgentInvoice } from 'sdk';
import { loadConfig } from '../utils/config';

export const listCommand = new Command('list')
  .description('List invoices for an address')
  .option('-p, --payer <address>', 'List invoices as payer')
  .option('-e, --payee <address>', 'List invoices as payee')
  .action(async (options) => {
    const config = loadConfig();
    
    if (!config) {
      console.error(chalk.red('❌ Configuration not found. Run: agent-invoice setup'));
      process.exit(1);
    }

    if (!options.payer && !options.payee) {
      console.error(chalk.red('❌ Specify --payer or --payee'));
      process.exit(1);
    }

    const spinner = ora('Fetching invoices...').start();

    try {
      const sdk = new AgentInvoice(
        config.RPC_URL,
        config.INVOICE_REGISTRY,
        config.PAYMENT_PROCESSOR
      );

      let invoiceIds: string[];
      
      if (options.payer) {
        invoiceIds = await sdk.getInvoicesByPayer(options.payer);
      } else {
        invoiceIds = await sdk.getInvoicesByPayee(options.payee);
      }

      spinner.succeed(`Found ${invoiceIds.length} invoice(s)`);

      if (invoiceIds.length === 0) {
        console.log(chalk.gray('\nNo invoices found.\n'));
        return;
      }

      console.log(chalk.blue('\n📋 Invoices:\n'));
      
      for (const id of invoiceIds) {
        console.log(chalk.gray('  • ') + id);
      }
      
      console.log(chalk.gray('\nUse "agent-invoice status <id>" to see details.\n'));
    } catch (error: any) {
      spinner.fail('Failed to fetch invoices');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });
