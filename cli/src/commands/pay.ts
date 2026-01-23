import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AgentInvoice } from 'sdk';
import { ethers } from 'ethers';
import { loadConfig } from '../utils/config';

export const payCommand = new Command('pay')
  .description('Pay an invoice')
  .requiredOption('-i, --invoice-id <id>', 'Invoice ID')
  .action(async (options) => {
    const config = loadConfig();
    if (!config || !config.PRIVATE_KEY) {
      console.error(chalk.red('❌ PRIVATE_KEY missing in config. Run: agent-invoice setup'));
      process.exit(1);
    }

    const spinner = ora('Paying invoice...').start();

    try {
      const sdk = new AgentInvoice(config.RPC_URL, config.INVOICE_REGISTRY, config.PAYMENT_PROCESSOR);
      const provider = new ethers.JsonRpcProvider(config.RPC_URL);
      const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);

      await sdk.payInvoiceDirect(options.invoiceId, signer);

      spinner.succeed('Invoice paid!');
      console.log(chalk.green('✅ Paid invoice:'), options.invoiceId);
    } catch (err: any) {
      spinner.fail('Failed to pay invoice');
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });
