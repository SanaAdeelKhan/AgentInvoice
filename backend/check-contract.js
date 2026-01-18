require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");

async function checkContract() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL);
    
    console.log("🔍 Checking InvoiceRegistry contract...\n");
    console.log("Address:", process.env.INVOICE_REGISTRY_ADDRESS);
    
    // Check if contract exists
    const code = await provider.getCode(process.env.INVOICE_REGISTRY_ADDRESS);
    console.log("Contract exists:", code !== "0x");
    console.log("Code length:", code.length, "bytes\n");
    
    if (code === "0x") {
      console.log("❌ No contract found at this address!");
      return;
    }
    
    // Try to get storage at slot 0 (should contain invoice count)
    const storage = await provider.getStorage(process.env.INVOICE_REGISTRY_ADDRESS, 0);
    console.log("Storage slot 0:", storage);
    
    // Try different ABI variations
    console.log("\n📋 Trying to read invoice count...\n");
    
    const abiVariations = [
      ["function getInvoiceCount() view returns (uint256)"],
      ["function invoiceCount() view returns (uint256)"],
      ["function totalInvoices() view returns (uint256)"],
    ];
    
    for (const abi of abiVariations) {
      try {
        const contract = new ethers.Contract(process.env.INVOICE_REGISTRY_ADDRESS, abi, provider);
        const count = await contract[Object.keys(contract.interface.functions)[0]]();
        console.log(`✅ Success with ABI: ${abi[0]}`);
        console.log(`   Invoice count: ${count}\n`);
        return;
      } catch (e) {
        console.log(`❌ Failed: ${abi[0]}`);
      }
    }
    
    console.log("\n⚠️  None of the standard functions worked.");
    console.log("The contract might have a different interface.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkContract();
