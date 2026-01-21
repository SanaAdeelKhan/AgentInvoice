require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Circle client
const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

// Load contract ABI
const registryAbiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
const registryArtifact = JSON.parse(fs.readFileSync(registryAbiPath, 'utf8'));

// Simple in-memory escrow tracking (for demo purposes)
// In production, this would query the blockchain
const escrowBalances = new Map();

// Pricing configuration
const PRICING = {
  'image-generation': {
    basePrice: 0.05,
    description: 'AI Image Generation'
  },
  'text-generation': {
    basePrice: 0.01,
    description: 'AI Text Generation'
  },
  'code-generation': {
    basePrice: 0.02,
    description: 'AI Code Generation'
  },
  'data-analysis': {
    basePrice: 0.03,
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
// CHECK ESCROW BALANCE (Simplified)
// ==========================================
app.get('/api/escrow/:agentId/balance', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Get balance from in-memory tracker
    const balance = escrowBalances.get(agentId) || 0;

    console.log(`💰 Balance check for agent ${agentId}: ${balance} USDC`);

    res.json({
      success: true,
      agentId: agentId,
      balance: balance.toFixed(6),
      currency: 'USDC',
      note: 'Demo mode: Using in-memory balance tracking',
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
// FUND ESCROW (Simplified)
// ==========================================
app.post('/api/escrow/:agentId/fund', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { amount } = req.body;

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
    
    // Update in-memory balance
    const currentBalance = escrowBalances.get(agentId) || 0;
    escrowBalances.set(agentId, currentBalance + parseFloat(amount));
    
    console.log(`✅ Escrow funded successfully!`);
    console.log(`   New balance: ${escrowBalances.get(agentId)} USDC`);

    res.json({
      success: true,
      message: 'Escrow funded successfully',
      funding: {
        agentId: agentId,
        amount: amount,
        currency: 'USDC',
        newBalance: escrowBalances.get(agentId),
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
// AUTONOMOUS SERVICE USE (Simplified)
// ==========================================
app.post('/api/services/autonomous/:serviceType/use', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { agentId, quantity, metadata } = req.body;

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
    const usageSignature = '0x';

    console.log('');
    console.log('🤖 AUTONOMOUS PAYMENT FLOW');
    console.log('='.repeat(60));
    console.log(`📝 Agent: ${agentId}`);
    console.log(`📝 Service: ${serviceType}`);
    console.log(`📝 Quantity: ${quantity}`);
    console.log(`📝 Amount: ${totalAmount} USDC`);
    console.log('='.repeat(60));

    // Check escrow balance
    console.log('Step 1: Checking escrow balance...');
    const currentBalance = escrowBalances.get(agentId) || 0;
    console.log(`   Current balance: ${currentBalance} USDC`);

    if (currentBalance < totalAmount) {
      console.log(`❌ Insufficient balance! Need ${totalAmount} USDC, have ${currentBalance} USDC`);
      return res.status(400).json({
        success: false,
        error: 'Insufficient escrow balance',
        required: totalAmount,
        available: currentBalance,
        currency: 'USDC',
        message: `Please fund escrow first: POST /api/escrow/${agentId}/fund`
      });
    }

    // Create invoice
    console.log('Step 2: Creating invoice on blockchain...');
    const createInvoiceTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
      abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
      abiParameters: [
        process.env.PRIMARY_WALLET_ADDRESS, // Using wallet as payer for demo
        process.env.PRIMARY_WALLET_ADDRESS,
        amountInUSDC,
        description,
        usageHash,
        usageSignature
      ],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`   Invoice TX: ${createInvoiceTx.data.id}`);
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Simulate payment from escrow
    console.log('Step 3: Auto-paying from escrow...');
    const paymentTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.AGENT_ESCROW_ADDRESS,
      abiFunctionSignature: 'payInvoice(string,bytes32,uint256)',
      abiParameters: [agentId, usageHash, amountInUSDC],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`   Payment TX: ${paymentTx.data.id}`);
    
    // Update balance
    const newBalance = currentBalance - totalAmount;
    escrowBalances.set(agentId, newBalance);
    
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
        previousBalance: currentBalance,
        newBalance: newBalance
      },
      transactions: {
        invoiceCreation: createInvoiceTx.data.id,
        autonomousPayment: paymentTx.data.id
      },
      invoice: {
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
// WITHDRAW FROM ESCROW
// ==========================================
app.post('/api/escrow/:agentId/withdraw', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const currentBalance = escrowBalances.get(agentId) || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        available: currentBalance
      });
    }

    const amountInUSDC = ethers.parseUnits(amount.toString(), 6).toString();

    console.log(`💸 Withdrawing from escrow for agent ${agentId}: ${amount} USDC`);

    const withdrawTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.AGENT_ESCROW_ADDRESS,
      abiFunctionSignature: 'withdraw(string,uint256)',
      abiParameters: [agentId, amountInUSDC],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    // Update balance
    escrowBalances.set(agentId, currentBalance - amount);

    console.log(`✅ Withdrawal transaction: ${withdrawTx.data.id}`);

    res.json({
      success: true,
      message: 'Withdrawal initiated',
      withdrawal: {
        agentId: agentId,
        amount: amount,
        currency: 'USDC',
        newBalance: escrowBalances.get(agentId),
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
  console.log('⚡ AgentInvoice AUTONOMOUS API Server (Simplified)');
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
  console.log('💡 Note: Using in-memory balance tracking for demo');
  console.log('='.repeat(70));
  console.log('');
});
