# AgentInvoice CLI

Command-line tool for managing invoices on Arc blockchain.

## Installation
```bash
npm install
npm run build
```

## Configuration

First, configure the CLI:
```bash
node dist/index.js setup
```

## Commands

### Check Invoice Status
```bash
node dist/index.js status <invoice-id>
```

### List Invoices
```bash
# List as payer
node dist/index.js list --payer <address>

# List as payee
node dist/index.js list --payee <address>
```

## Examples
```bash
# List your invoices
node dist/index.js list --payer 0x4acC19Ebe7FE566f0fb0c61BE5492e7C9d81def1

# Check specific invoice
node dist/index.js status 0x1234...
```
