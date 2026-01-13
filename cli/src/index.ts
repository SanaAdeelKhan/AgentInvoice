#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { setupCommand } from './commands/setup';
import { statusCommand } from './commands/status';
import { listCommand } from './commands/list';

const program = new Command();

program
  .name('agent-invoice')
  .description('CLI tool for AgentInvoice - Auditable billing for AI agents')
  .version('1.0.0');

// Commands
program.addCommand(setupCommand);
program.addCommand(statusCommand);
program.addCommand(listCommand);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Invalid command. See --help for available commands.'));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
