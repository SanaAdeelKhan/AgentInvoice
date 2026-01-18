require("dotenv").config({ path: "../.env" });
const { initiateDeveloperControlledWalletsClient } = require("@circle-fin/developer-controlled-wallets");
const { ethers } = require("ethers");

async function payInvoice() {
  try {
    console.log("💰 Paying Invoice with Circle Wallet...\n");

    // Initialize Circle client
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    // Contract ABIs (minimal)
    const registryABI = [
      "function invoices(uint256) view returns (address payer, address payee, uint256 amount, string description, uint8 status, uint256 createdAt, uint256 paidAt)",
      "function getInvoiceCount() view returns (uint256)"
    ];

    const usdcABI = [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ];

    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);

    // Contracts
    const registry = new ethers.Contract(process.env.INVOICE_REGISTRY_ADDRESS, registryABI, provider);
    const usdc = new ethers.Contract(process.env.USDC_ADDRESS, usdcABI, provider);

    // Get invoice count
    const count = await registry.getInvoiceCount();
    console.log(`📋 Total invoices: ${count}\n`);

    // Check all invoices
    console.log("Current Invoices:");
    console.log("=================");
    for (let i = 0; i < count; i++) {
      const invoice = await registry.invoices(i);
      const status = ["PENDING", "PAID", "CANCELLED", "HELD"][invoice.status];
      const amount = ethers.formatUnits(invoice.amount, 6);
      console.log(`\nInvoice #${i}:`);
      console.log(`  Description: ${invoice.description}`);
      console.log(`  Amount: ${amount} USDC`);
      console.log(`  Status: ${status}`);
      console.log(`  Payer: ${invoice.payer}`);
    }

    // Check USDC balance
    const balance = await usdc.balanceOf(process.env.PRIMARY_WALLET_ADDRESS);
    console.log(`\n💵 Wallet USDC Balance: ${ethers.formatUnits(balance, 6)} USDC\n`);

    // Choose invoice to pay (Invoice #1 = 0.5 USDC)
    const invoiceId = 1;
    const invoice = await registry.invoices(invoiceId);
    const amount = ethers.formatUnits(invoice.amount, 6);

    console.log(`\n🎯 Paying Invoice #${invoiceId}:`);
    console.log(`   Description: ${invoice.description}`);
    console.log(`   Amount: ${amount} USDC\n`);

    // Confirm we have enough balance
    if (balance < invoice.amount) {
      console.log("❌ Insufficient USDC balance!");
      console.log(`   Need: ${amount} USDC`);
      console.log(`   Have: ${ethers.formatUnits(balance, 6)} USDC`);
      return;
    }

    // Step 1: Approve USDC
    console.log("Step 1/2: Approving USDC for PaymentProcessor...");
    const approveResponse = await client.createTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      blockchain: "ARC-TESTNET",
      contractAddress: process.env.USDC_ADDRESS,
      abiFunctionSignature: "approve(address,uint256)",
      abiParameters: [process.env.PAYMENT_PROCESSOR_ADDRESS, invoice.amount.toString()],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } }
    });

    console.log("✅ Approve transaction initiated:", approveResponse.data.id);
    console.log("⏳ Waiting 15 seconds for confirmation...\n");
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Step 2: Pay Invoice
    console.log("Step 2/2: Paying invoice...");
    const payResponse = await client.createTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      blockchain: "ARC-TESTNET",
      contractAddress: process.env.PAYMENT_PROCESSOR_ADDRESS,
      abiFunctionSignature: "payInvoice(uint256)",
      abiParameters: [invoiceId.toString()],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } }
    });

    console.log("✅ Payment transaction initiated:", payResponse.data.id);
    console.log("⏳ Waiting 20 seconds for confirmation...\n");
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Check final status
    const updatedInvoice = await registry.invoices(invoiceId);
    const newStatus = ["PENDING", "PAID", "CANCELLED", "HELD"][updatedInvoice.status];

    console.log("\n" + "=".repeat(50));
    console.log(`🎉 FINAL STATUS: ${newStatus}`);
    console.log("=".repeat(50));

    if (newStatus === "PAID") {
      console.log("\n✅ SUCCESS! Invoice has been paid!");
      console.log(`   Paid at: ${new Date(Number(updatedInvoice.paidAt) * 1000).toLocaleString()}`);
      console.log(`\n🔗 View on dashboard: dashboard-simple/index.html`);
    } else {
      console.log("\n⚠️  Payment may still be processing. Check again in a moment.");
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }
}

payInvoice();
