require("dotenv").config({ path: "../.env" });
const { initiateDeveloperControlledWalletsClient } = require("@circle-fin/developer-controlled-wallets");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function createInvoice() {
  try {
    console.log("📝 Creating Invoice on NEW Deployment...\n");

    // Load the ABI
    const abiPath = path.join(__dirname, "../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const invoiceRegistryABI = artifact.abi;
    
    console.log("✅ Loaded ABI from compiled contracts\n");

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    const registry = new ethers.Contract(
      process.env.INVOICE_REGISTRY_ADDRESS,
      invoiceRegistryABI,
      provider
    );

    console.log("📍 InvoiceRegistry:", process.env.INVOICE_REGISTRY_ADDRESS);
    console.log("💰 Wallet:", process.env.PRIMARY_WALLET_ADDRESS);
    console.log();

    // Check current invoice count
    try {
      const count = await registry.nextInvoiceId();
      console.log("📋 Current invoice count:", count.toString());
    } catch (e) {
      console.log("📋 Invoice count: 0 (new deployment)");
    }
    console.log();

    // Create a 0.5 USDC invoice
    const payee = process.env.PRIMARY_WALLET_ADDRESS; // Pay to self for testing
    const amount = ethers.parseUnits("0.5", 6); // 0.5 USDC
    const description = "Test Payment - Image Generation";

    console.log("Creating invoice:");
    console.log("  Payee:", payee);
    console.log("  Amount: 0.5 USDC");
    console.log("  Description:", description);
    console.log();

    const response = await client.createTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      blockchain: "ARC-TESTNET",
      contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
      abiFunctionSignature: "createInvoice(address,uint256,string)",
      abiParameters: [payee, amount.toString(), description],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } }
    });

    console.log("✅ Transaction initiated!");
    console.log("   Transaction ID:", response.data.id);
    console.log();
    console.log("⏳ Waiting 20 seconds for confirmation...\n");
    
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Check if invoice was created
    try {
      const count = await registry.nextInvoiceId();
      console.log("✅ Invoice created successfully!");
      console.log("   Total invoices now:", count.toString());
      console.log("   New invoice ID:", (Number(count) - 1).toString());
      
      // Try to read the invoice details
      const invoiceId = Number(count) - 1;
      const invoice = await registry.invoices(invoiceId);
      console.log("\n📄 Invoice Details:");
      console.log("   Payer:", invoice.payer || invoice[0]);
      console.log("   Payee:", invoice.payee || invoice[1]);
      console.log("   Amount:", ethers.formatUnits(invoice.amount || invoice[2], 6), "USDC");
      console.log("   Description:", invoice.description || invoice[3]);
      console.log("   Status: PENDING");
      
    } catch (e) {
      console.log("⚠️  Invoice might still be processing");
      console.log("   Check Arc Explorer:");
      console.log(`   https://testnet.arcscan.com/address/${process.env.INVOICE_REGISTRY_ADDRESS}`);
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

createInvoice();
