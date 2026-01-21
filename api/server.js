require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Circle client
const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

// Load contract ABI
const abiPath = path.join(__dirname, '../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json');
const registryArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

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
  }
};

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AgentInvoice API is running',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// GET ALL INVOICES FOR A PAYER
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
      invoices: invoices
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
// CREATE INVOICE (AUTO - when service used)
// ==========================================
app.post('/api/services/:serviceType/use', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { payerAddress, quantity, metadata } = req.body;

    // Validate service type
    if (!PRICING[serviceType]) {
      return res.status(400).json({
        success: false,
        error: `Unknown service type: ${serviceType}`
      });
    }

    // Calculate amount
    const priceConfig = PRICING[serviceType];
    const totalAmount = priceConfig.basePrice * quantity;
    const amountInUSDC = ethers.parseUnits(totalAmount.toFixed(6), 6).toString();

    // Build description
    const description = `${priceConfig.description} - ${quantity} units`;
    
    // Create usage attestation
    const usageData = JSON.stringify({
      service: serviceType,
      quantity: quantity,
      metadata: metadata || {},
      timestamp: Date.now()
    });
    const usageHash = ethers.keccak256(ethers.toUtf8Bytes(usageData));
    const usageSignature = '0x'; // In production, sign with service provider key

    console.log(`📝 Creating invoice for ${payerAddress}:`);
    console.log(`   Service: ${serviceType}`);
    console.log(`   Quantity: ${quantity}`);
    console.log(`   Amount: ${totalAmount} USDC`);

    // Create invoice on blockchain
    const tx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
      abiFunctionSignature: 'createInvoice(address,address,uint256,string,bytes32,bytes)',
      abiParameters: [
        payerAddress,
        process.env.PRIMARY_WALLET_ADDRESS, // Service provider (payee)
        amountInUSDC,
        description,
        usageHash,
        usageSignature
      ],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`✅ Invoice creation transaction: ${tx.data.id}`);

    // Wait a bit for confirmation
    await new Promise(resolve => setTimeout(resolve, 3000));

    res.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: {
        transactionId: tx.data.id,
        service: serviceType,
        quantity: quantity,
        amount: totalAmount,
        currency: 'USDC',
        description: description,
        payer: payerAddress,
        payee: process.env.PRIMARY_WALLET_ADDRESS,
        usageHash: usageHash,
        explorerUrl: `https://testnet.arcscan.app/address/${process.env.INVOICE_REGISTRY_ADDRESS}`
      }
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// PAY INVOICE
// ==========================================
app.post('/api/invoices/:invoiceId/pay', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    console.log(`💰 Processing payment for invoice: ${invoiceId}`);

    // Get invoice details
    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    const registry = new ethers.Contract(
      process.env.INVOICE_REGISTRY_ADDRESS,
      registryArtifact.abi,
      provider
    );

    const invoice = await registry.getInvoice(invoiceId);

    // Step 1: Approve USDC
    console.log('  Step 1: Approving USDC...');
    const approveTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.USDC_ADDRESS,
      abiFunctionSignature: 'approve(address,uint256)',
      abiParameters: [process.env.PAYMENT_PROCESSOR_ADDRESS, invoice.amount.toString()],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    await new Promise(resolve => setTimeout(resolve, 12000));

    // Step 2: Pay invoice
    console.log('  Step 2: Paying invoice...');
    const payTx = await circleClient.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      contractAddress: process.env.PAYMENT_PROCESSOR_ADDRESS,
      abiFunctionSignature: 'payInvoiceDirect(bytes32)',
      abiParameters: [invoiceId],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
    });

    console.log(`✅ Payment transaction: ${payTx.data.id}`);

    res.json({
      success: true,
      message: 'Payment initiated',
      payment: {
        invoiceId: invoiceId,
        approveTransaction: approveTx.data.id,
        paymentTransaction: payTx.data.id,
        amount: ethers.formatUnits(invoice.amount, 6),
        explorerUrl: `https://testnet.arcscan.app/address/${process.env.PAYMENT_PROCESSOR_ADDRESS}`
      }
    });

  } catch (error) {
    console.error('Error paying invoice:', error);
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
    pricing: PRICING
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('⚡ AgentInvoice API Server');
  console.log('='.repeat(60));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Contract: ${process.env.INVOICE_REGISTRY_ADDRESS}`);
  console.log('='.repeat(60));
  console.log('');
});
