import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AgentInvoice } from 'sdk';
import { ethers } from 'ethers';
import { loadConfig } from '../utils/config';

export const createCommand = new Command('create')
  .description('Create a new invoice')
  .requiredOption('-p, --payer <address>', 'Payer address')
  .requiredOption('-e, --payee <address>', 'Payee address')
  .requiredOption('-a, --amount <number>', 'Amount in USDC')
  .option('-d, --description <text>', 'Invoice description', '')
  .action(async (options) => {
    const config = loadConfig();
    if (!config || !config.PRIVATE_KEY) {
      console.error(chalk.red('❌ PRIVATE_KEY missing in config. Run: agent-invoice setup'));
      process.exit(1);
    }

    const spinner = ora('Creating invoice...').start();

    try {
      const sdk = new AgentInvoice(config.RPC_URL, config.INVOICE_REGISTRY, config.PAYMENT_PROCESSOR);
      const provider = new ethers.JsonRpcProvider(config.RPC_URL);
      const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);

      const invoiceId = await sdk.createInvoice(signer, {
        payer: options.payer,
        payee: options.payee,
        amount: options.amount.toString(),
        description: options.description
      });

      spinner.succeed('Invoice created!');
      console.log('ID:', chalk.cyan(invoiceId));
      console.log('Use "agent-invoice status <id>" to check details.');
    } catch (err: any) {
      spinner.fail('Failed to create invoice');
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });
