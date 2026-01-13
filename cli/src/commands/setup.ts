import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { saveConfig, getConfigPath } from '../utils/config';

export const setupCommand = new Command('setup')
  .description('Configure AgentInvoice CLI')
  .action(async () => {
    console.log(chalk.blue('\n🔧 AgentInvoice CLI Setup\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'RPC_URL',
        message: 'Arc Testnet RPC URL:',
        default: 'https://rpc.testnet.arc.network'
      },
      {
        type: 'input',
        name: 'INVOICE_REGISTRY',
        message: 'InvoiceRegistry contract address:',
        default: '0xDBe8c11e3e72062f6A8b3c64EBF8ED262B5D3A1b'
      },
      {
        type: 'input',
        name: 'PAYMENT_PROCESSOR',
        message: 'PaymentProcessor contract address:',
        default: '0x0C01067bd6D69D64409D505B28B9726cD354E49b'
      },
      {
        type: 'input',
        name: 'PRIVATE_KEY',
        message: 'Your private key (optional, for signing):',
        default: ''
      }
    ]);

    saveConfig(answers);

    console.log(chalk.green('\n✅ Configuration saved!'));
    console.log(chalk.gray(`Config location: ${getConfigPath()}\n`));
  });
