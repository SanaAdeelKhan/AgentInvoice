require("dotenv").config({ path: "../.env" });
const { initiateDeveloperControlledWalletsClient } = require("@circle-fin/developer-controlled-wallets");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function createInvoice() {
  try {
    console.log("📝 Creating Invoice on NEW Deployment...\n");

    const abiPath = path.join(__dirname, "../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const invoiceRegistryABI = artifact.abi;
    
    console.log("✅ Loaded ABI\n");

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

    const payer = process.env.PRIMARY_WALLET_ADDRESS;
    const payee = process.env.PRIMARY_WALLET_ADDRESS;
    const amount = ethers.parseUnits("0.5", 6);
    const description = "Test Payment - Image Generation";
    const usageData = "Image generation: 10 images, 1024x1024";
    const usageHash = ethers.keccak256(ethers.toUtf8Bytes(usageData));
    const usageSignature = "0x";

    console.log("Creating invoice with 0.5 USDC...\n");

    // Use the correct Circle SDK method: createTransaction
    const response = await client.createTransaction({
      walletId: process.env.PRIMARY_WALLET_ID,
      blockchain: "ARC-TESTNET",
      contractAddress: process.env.INVOICE_REGISTRY_ADDRESS,
      abiFunctionSignature: "createInvoice(address,address,uint256,string,bytes32,bytes)",
      abiParameters: [
        payer,
        payee, 
        amount.toString(),
        description,
        usageHash,
        usageSignature
      ],
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

    try {
      const count = await registry.nextInvoiceId();
      console.log("✅ SUCCESS! Invoice created!");
      console.log("   Total invoices now:", count.toString());
      
      if (count > 0) {
        const invoiceId = 0;
        const invoice = await registry.invoices(invoiceId);
        
        console.log("\n📄 Invoice #0:");
        console.log("   Payer:", invoice.payer || invoice[0]);
        console.log("   Payee:", invoice.payee || invoice[1]);
        console.log("   Amount:", ethers.formatUnits(invoice.amount || invoice[2], 6), "USDC");
        console.log("   Description:", invoice.description || invoice[3]);
        console.log("   Status: PENDING ✅");
        console.log();
        console.log("🎉 Now you can pay this invoice!");
      }
      
    } catch (e) {
      console.log("⚠️  Invoice might still be processing");
      console.log("   Check in a moment");
    }

    console.log(`\n🔗 Arc Explorer: https://testnet.arcscan.com/address/${process.env.INVOICE_REGISTRY_ADDRESS}`);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response?.data) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

createInvoice();
