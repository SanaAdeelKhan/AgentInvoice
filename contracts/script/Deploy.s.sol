// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/InvoiceRegistry.sol";
import "../src/PolicyManager.sol";
import "../src/PaymentProcessor.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0x3600000000000000000000000000000000000000));
        address gatewayMinter = vm.envOr("GATEWAY_MINTER_CONTRACT", address(0x0022222ABE238Cc2C7Bb1f21003F0a260052475B));
        
        console.log("=== AgentInvoice Deployment ===");
        console.log("Deployer:", deployer);
        console.log("USDC:", usdcAddress);
        console.log("Gateway Minter:", gatewayMinter);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy InvoiceRegistry with deployer as temp policy manager
        console.log("Step 1: Deploying InvoiceRegistry (with deployer as temp policy manager)...");
        InvoiceRegistry registry = new InvoiceRegistry(deployer);
        console.log("InvoiceRegistry deployed at:", address(registry));
        
        // Step 2: Deploy PolicyManager
        console.log("Step 2: Deploying PolicyManager...");
        PolicyManager policyManager = new PolicyManager(address(registry));
        console.log("PolicyManager deployed at:", address(policyManager));
        
        // Step 3: Deploy PaymentProcessor
        console.log("Step 3: Deploying PaymentProcessor...");
        PaymentProcessor processor = new PaymentProcessor(
            address(registry),
            address(policyManager),
            usdcAddress,
            gatewayMinter
        );
        console.log("PaymentProcessor deployed at:", address(processor));
        
        // Step 4: Set PaymentProcessor (deployer can do this because they're the policy manager)
        console.log("Step 4: Setting PaymentProcessor...");
        registry.setPaymentProcessor(address(processor));
        console.log("PaymentProcessor set");
        
        // Step 5: Update policy manager to the real PolicyManager contract
        console.log("Step 5: Updating PolicyManager to real contract...");
        registry.updatePolicyManager(address(policyManager));
        console.log("PolicyManager updated");
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("InvoiceRegistry:", address(registry));
        console.log("PolicyManager:", address(policyManager));
        console.log("PaymentProcessor:", address(processor));
        console.log("");
        console.log("Add these to your .env file:");
        console.log("INVOICE_REGISTRY_ADDRESS=", address(registry));
        console.log("POLICY_MANAGER_ADDRESS=", address(policyManager));
        console.log("PAYMENT_PROCESSOR_ADDRESS=", address(processor));
    }
}