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

    // Invoice parameters
    const payer = process.env.PRIMARY_WALLET_ADDRESS;
    const payee = process.env.PRIMARY_WALLET_ADDRESS; // Pay to self for testing
    const amount = ethers.parseUnits("0.5", 6); // 0.5 USDC
    const description = "Test Payment - Image Generation";
    
    // Usage attestation (for demo, we'll use dummy values)
    const usageData = "Image generation: 10 images, 1024x1024, DALL-E 3";
    const usageHash = ethers.keccak256(ethers.toUtf8Bytes(usageData));
    const usageSignature = "0x"; // Empty signature for demo

    console.log("Creating invoice:");
    console.log("  Payer:", payer);
    console.log("  Payee:", payee);
    console.log("  Amount: 0.5 USDC");
    console.log("  Description:", description);
    console.log("  Usage Hash:", usageHash);
    console.log();

    // Encode the function call with ALL 6 parameters
    const iface = new ethers.Interface(invoiceRegistryABI);
    const callData = iface.encodeFunctionData("createInvoice", [
      payer,
      payee,
      amount.toString(),
      description,
      usageHash,
      usageSignature
    ]);

    console.log("📦 Encoded call data length:", callData.length, "chars");
    console.log();

    // Execute the contract call
    const response = await client.createContractExecutionTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      destinationAddress: process.env.INVOICE_REGISTRY_ADDRESS,
      callData: callData,
      amounts: ["0"],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM"
        }
      }
    });

    console.log("✅ Transaction initiated!");
    console.log("   Transaction ID:", response.data.id);
    console.log();
    console.log("⏳ Waiting 25 seconds for confirmation...\n");
    
    await new Promise(resolve => setTimeout(resolve, 25000));

    // Check if invoice was created
    try {
      const count = await registry.nextInvoiceId();
      console.log("✅ Invoice created successfully!");
      console.log("   Total invoices now:", count.toString());
      
      if (count > 0) {
        // The invoice ID is bytes32, need to convert
        const invoiceId = 0; // First invoice
        const invoice = await registry.invoices(invoiceId);
        
        console.log("\n📄 Invoice Details:");
        console.log("   Invoice ID:", invoiceId);
        console.log("   Payer:", invoice.payer || invoice[0]);
        console.log("   Payee:", invoice.payee || invoice[1]);
        console.log("   Amount:", ethers.formatUnits(invoice.amount || invoice[2], 6), "USDC");
        console.log("   Description:", invoice.description || invoice[3]);
        console.log("   Status: PENDING ✅");
        console.log();
        console.log("🎉 Ready to pay this invoice with your 1.0 USDC!");
      }
      
    } catch (e) {
      console.log("⚠️  Checking status...");
      console.log("   Error:", e.message);
      console.log("\n   The invoice might still be processing.");
      console.log("   Check Arc Explorer in a moment.");
    }

    console.log(`\n🔗 View on Arc Explorer:`);
    console.log(`   https://testnet.arcscan.com/address/${process.env.INVOICE_REGISTRY_ADDRESS}`);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    if (error.code) {
      console.error("Code:", error.code);
    }
  }
}

createInvoice();
