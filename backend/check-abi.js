const fs = require("fs");
const path = require("path");

const abiPath = path.join(__dirname, "../contracts/out/InvoiceRegistry.sol/InvoiceRegistry.json");
const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));

console.log("🔍 Looking for createInvoice function...\n");

const createInvoiceFn = artifact.abi.find(item => 
  item.type === "function" && item.name === "createInvoice"
);

if (createInvoiceFn) {
  console.log("✅ Found createInvoice function:");
  console.log(JSON.stringify(createInvoiceFn, null, 2));
  console.log("\nParameters:");
  createInvoiceFn.inputs.forEach((input, i) => {
    console.log(`  ${i + 1}. ${input.name} (${input.type})`);
  });
} else {
  console.log("❌ createInvoice function not found!");
  console.log("\nAvailable functions:");
  artifact.abi
    .filter(item => item.type === "function")
    .forEach(fn => {
      console.log(`  - ${fn.name}(${fn.inputs.map(i => i.type).join(", ")})`);
    });
}
