require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Different port from original API

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Circle client
const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

// Load contract ABIs
const registryAbiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
const escrowAbiPath = path.join(__dirname, '../contracts/out/AgentEscrow.sol/AgentEscrow.json');
const registryArtifact = JSON.parse(fs.readFileSync(registryAbiPath, 'utf8'));
const escrowArtifact = JSON.parse(fs.readFileSync(escrowAbiPath, 'utf8'));

// Pricing configuration
const PRICING = {
  'image-generation': {
    basePrice: 0.05, // $0.05 per image
    description: 'AI Image Generation'
  },
  'text-generation': {
    basePrice: 0.01, // $0.01 per 1000 tokens
    description: 'AI Text Generation'
  },
  'code-generation': {
    basePrice: 0.02, // $0.02 per request
    description: 'AI Code Generation'
  },
  'data-analysis': {
    basePrice: 0.03, // $0.03 per analysis
    description: 'AI Data Analysis'
  }
};

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AgentInvoice Autonomous API is running',
    mode: 'AUTONOMOUS_PAYMENTS',
    timestamp: new Date().toISOString(),
    contracts: {
      invoiceRegistry: process.env.INVOICE_REGISTRY_ADDRESS,
      paymentProcessor: process.env.PAYMENT_PROCESSOR_ADDRESS,
      agentEscrow: process.env.AGENT_ESCROW_ADDRESS
    }
  });
});

// ==========================================
// CHECK ESCROW BALANCE
// ==========================================
app.get('/api/escrow/:agentId/balance', async (req, res) => {
  try {
    const { agentId } = req.params;

    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    const escrow = new ethers.Contract(
      process.env.AGENT_ESCROW_ADDRESS,
      escrowArtifact.abi,
      provider
    );

    const balance = await escrow.getBalance(agentId);
    const balanceInUSDC = ethers.formatUnits(balance, 6);

    console.log(`💰 Balance check for agent ${agentId}: ${balanceInUSDC} USDC`);

    res.json({
      success: true,
      agentId: agentId,
      balance: balanceInUSDC,
      currency: 'USDC',
      contract: process.env.AGENT_ESCROW_ADDRESS
    });

  } catch (error) {
    console.error('Error checking balance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// FUND ESCROW (For AI Agent Setup)
// ==========================================
app.post('/api/escrow/:agentId/fund', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { amount } = req.body; // Amount in USDC

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const amountInUSDC = ethers.parseUnits(amount.toString(), 6).toString();

    console.log(`💵 Funding escrow for agent ${agentId}:`);
    console.log(`   Amount: ${amount} USDC`);

    // Step 1: Approve USDC
    console.log('  Step 1: Approving USDC...');
    const approveTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.USDC_ADDRESS,
      abiFunctionSignature: 'approve(address,uint256)',
      abiParameters: [process.env.AGENT_ESCROW_ADDRESS, amountInUSDC],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`   Approve TX: ${approveTx.data.id}`);

    // Wait for confirmation
    await new Promise(resolve => setTimeout(resolve, 12000));

    // Step 2: Deposit to escrow
    console.log('  Step 2: Depositing to escrow...');
    const depositTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.AGENT_ESCROW_ADDRESS,
      abiFunctionSignature: 'deposit(string,uint256)',
      abiParameters: [agentId, amountInUSDC],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`   Deposit TX: ${depositTx.data.id}`);
    console.log(`✅ Escrow funded successfully!`);

    res.json({
      success: true,
      message: 'Escrow funded successfully',
      funding: {
        agentId: agentId,
        amount: amount,
        currency: 'USDC',
        approveTransaction: approveTx.data.id,
        depositTransaction: depositTx.data.id,
        explorerUrl: `https://testnet.arcscan.app/address/${process.env.AGENT_ESCROW_ADDRESS}`
      }
    });

  } catch (error) {
    console.error('Error funding escrow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// AUTONOMOUS SERVICE USE (Auto Payment!)
// ==========================================
app.post('/api/services/autonomous/:serviceType/use', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { agentId, quantity, metadata } = req.body;

    // Validate service type
    if (!PRICING[serviceType]) {
      return res.status(400).json({
        success: false,
        error: `Unknown service type: ${serviceType}`
      });
    }

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'agentId is required'
      });
    }

    // Calculate amount
    const priceConfig = PRICING[serviceType];
    const totalAmount = priceConfig.basePrice * quantity;
    const amountInUSDC = ethers.parseUnits(totalAmount.toFixed(6), 6).toString();

    // Build description
    const description = `${priceConfig.description} - ${quantity} units (Auto-paid)`;

    // Create usage attestation
    const usageData = JSON.stringify({
      service: serviceType,
      quantity: quantity,
      agentId: agentId,
      metadata: metadata || {},
      timestamp: Date.now()
    });
    const usageHash = ethers.keccak256(ethers.toUtf8Bytes(usageData));
    const usageSignature = '0x'; // In production, sign with service provider key

    console.log('');
    console.log('🤖 AUTONOMOUS PAYMENT FLOW');
    console.log('='.repeat(60));
    console.log(`📝 Agent: ${agentId}`);
    console.log(`📝 Service: ${serviceType}`);
    console.log(`📝 Quantity: ${quantity}`);
    console.log(`📝 Amount: ${totalAmount} USDC`);
    console.log('='.repeat(60));

    // Check escrow balance first
    console.log('Step 1: Checking escrow balance...');
    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    const escrow = new ethers.Contract(
      process.env.AGENT_ESCROW_ADDRESS,
      escrowArtifact.abi,
      provider
    );

    const balance = await escrow.getBalance(agentId);
    const balanceInUSDC = parseFloat(ethers.formatUnits(balance, 6));

    console.log(`   Current balance: ${balanceInUSDC} USDC`);

    if (balanceInUSDC < totalAmount) {
      console.log(`❌ Insufficient balance! Need ${totalAmount} USDC, have ${balanceInUSDC} USDC`);
      return res.status(400).json({
        success: false,
        error: 'Insufficient escrow balance',
        required: totalAmount,
        available: balanceInUSDC,
        currency: 'USDC',
        message: `Please fund escrow first: POST /api/escrow/${agentId}/fund`
      });
    }

    // Create invoice on blockchain
    console.log('Step 2: Creating invoice on blockchain...');
    const createInvoiceTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
      abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
      abiParameters: [
        agentId, // Using agentId as payer address for now
        process.env.PRIMARY_WALLET_ADDRESS, // Service provider (payee)
        amountInUSDC,
        description,
        usageHash,
        usageSignature
      ],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`   Invoice TX: ${createInvoiceTx.data.id}`);

    // Wait for invoice creation
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Get the invoice ID (in production, parse from transaction receipt)
    // For now, we'll use the transaction hash as reference
    const invoiceRef = createInvoiceTx.data.id;

    // Automatically pay from escrow
    console.log('Step 3: Auto-paying from escrow...');
    const paymentTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.AGENT_ESCROW_ADDRESS,
      abiFunctionSignature: 'payInvoice(string,bytes32,uint256)',
      abiParameters: [agentId, usageHash, amountInUSDC], // Using usageHash as invoice reference
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`   Payment TX: ${paymentTx.data.id}`);
    console.log('');
    console.log('✅ AUTONOMOUS PAYMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log('');

    res.json({
      success: true,
      message: '✅ Service used and payment completed autonomously!',
      mode: 'AUTONOMOUS',
      service: {
        type: serviceType,
        description: priceConfig.description,
        quantity: quantity,
        amount: totalAmount,
        currency: 'USDC'
      },
      agent: {
        id: agentId,
        previousBalance: balanceInUSDC,
        newBalance: balanceInUSDC - totalAmount
      },
      transactions: {
        invoiceCreation: createInvoiceTx.data.id,
        autonomousPayment: paymentTx.data.id
      },
      invoice: {
        reference: invoiceRef,
        status: 'PAID',
        paidAt: new Date().toISOString(),
        usageHash: usageHash
      },
      explorerUrl: `https://testnet.arcscan.app/address/${process.env.AGENT_ESCROW_ADDRESS}`,
      receipt: {
        service: serviceType,
        quantity: quantity,
        totalPaid: totalAmount,
        currency: 'USDC',
        timestamp: new Date().toISOString(),
        agentId: agentId
      }
    });

  } catch (error) {
    console.error('Error in autonomous payment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      mode: 'AUTONOMOUS'
    });
  }
});

// ==========================================
// GET ALL INVOICES FOR AN AGENT
// ==========================================
app.get('/api/invoices/:payerAddress', async (req, res) => {
  try {
    const { payerAddress } = req.params;

    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    const registry = new ethers.Contract(
      process.env.INVOICE_REGISTRY_ADDRESS,
      registryArtifact.abi,
      provider
    );

    const invoiceIds = await registry.getInvoicesByPayer(payerAddress);
    const invoices = [];

    for (const id of invoiceIds) {
      const invoice = await registry.getInvoice(id);
      invoices.push({
        id: id,
        payer: invoice.payer,
        payee: invoice.payee,
        amount: ethers.formatUnits(invoice.amount, 6),
        description: invoice.description,
        status: ['PENDING', 'PAID', 'CANCELLED', 'HELD'][invoice.status],
        createdAt: new Date(Number(invoice.createdAt) * 1000).toISOString(),
        paidAt: invoice.paidAt > 0 ? new Date(Number(invoice.paidAt) * 1000).toISOString() : null,
        usageHash: invoice.usageHash
      });
    }

    res.json({
      success: true,
      count: invoices.length,
      invoices: invoices,
      mode: 'AUTONOMOUS'
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// GET PRICING
// ==========================================
app.get('/api/pricing', (req, res) => {
  res.json({
    success: true,
    mode: 'AUTONOMOUS',
    pricing: PRICING,
    note: 'All payments are processed autonomously from agent escrow'
  });
});

// ==========================================
// WITHDRAW FROM ESCROW (For agent owner)
// ==========================================
app.post('/api/escrow/:agentId/withdraw', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { amount } = req.body; // Amount in USDC

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const amountInUSDC = ethers.parseUnits(amount.toString(), 6).toString();

    console.log(`💸 Withdrawing from escrow for agent ${agentId}:`);
    console.log(`   Amount: ${amount} USDC`);

    const withdrawTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.AGENT_ESCROW_ADDRESS,
      abiFunctionSignature: 'withdraw(string,uint256)',
      abiParameters: [agentId, amountInUSDC],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`✅ Withdrawal transaction: ${withdrawTx.data.id}`);

    res.json({
      success: true,
      message: 'Withdrawal initiated',
      withdrawal: {
        agentId: agentId,
        amount: amount,
        currency: 'USDC',
        transaction: withdrawTx.data.id,
        explorerUrl: `https://testnet.arcscan.app/tx/${withdrawTx.data.id}`
      }
    });

  } catch (error) {
    console.error('Error withdrawing from escrow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(70));
  console.log('⚡ AgentInvoice AUTONOMOUS API Server');
  console.log('='.repeat(70));
  console.log(`🤖 Mode: AUTONOMOUS PAYMENTS WITH ESCROW`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Contracts:');
  console.log(`   Registry: ${process.env.INVOICE_REGISTRY_ADDRESS}`);
  console.log(`   Payment:  ${process.env.PAYMENT_PROCESSOR_ADDRESS}`);
  console.log(`   Escrow:   ${process.env.AGENT_ESCROW_ADDRESS}`);
  console.log('');
  console.log('🎯 Key Endpoints:');
  console.log(`   GET  /api/escrow/:agentId/balance`);
  console.log(`   POST /api/escrow/:agentId/fund`);
  console.log(`   POST /api/services/autonomous/:serviceType/use`);
  console.log(`   POST /api/escrow/:agentId/withdraw`);
  console.log('='.repeat(70));
  console.log('');
});
