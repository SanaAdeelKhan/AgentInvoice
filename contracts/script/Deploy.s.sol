// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/InvoiceRegistry.sol";
import "../src/PolicyManager.sol";
import "../src/PaymentProcessor.sol";
import "../src/AgentEscrow.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0x3600000000000000000000000000000000000000));

        console.log("=== AgentInvoice V2 Deployment (Autonomous Mode) ===");
        console.log("Deployer:", deployer);
        console.log("USDC Address:", usdcAddress);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy InvoiceRegistry (with deployer as initial policy manager)
        console.log("Step 1: Deploying InvoiceRegistry...");
        InvoiceRegistry registry = new InvoiceRegistry(deployer);
        console.log("InvoiceRegistry deployed at:", address(registry));

        // Step 2: Deploy PolicyManager (needs registry address)
        console.log("Step 2: Deploying PolicyManager...");
        PolicyManager policyManager = new PolicyManager(address(registry));
        console.log("PolicyManager deployed at:", address(policyManager));

        // Step 3: Deploy PaymentProcessor
        console.log("Step 3: Deploying PaymentProcessor...");
        PaymentProcessor processor = new PaymentProcessor(
            address(registry),
            address(policyManager),
            usdcAddress
        );
        console.log("PaymentProcessor deployed at:", address(processor));

        // Step 4: Deploy AgentEscrow
        console.log("Step 4: Deploying AgentEscrow...");
        AgentEscrow escrow = new AgentEscrow(
            usdcAddress,
            address(registry),
            address(policyManager)
        );
        console.log("AgentEscrow deployed at:", address(escrow));

        // Step 5: Set PaymentProcessor in registry
        console.log("Step 5: Setting PaymentProcessor...");
        registry.setPaymentProcessor(address(processor));
        console.log("PaymentProcessor set");

        // Step 6: Set AgentEscrow in registry
        console.log("Step 6: Setting AgentEscrow...");
        registry.setAgentEscrow(address(escrow));
        console.log("AgentEscrow set");

        // Step 7: Update policy manager to the real PolicyManager contract
        console.log("Step 7: Updating PolicyManager to real contract...");
        registry.updatePolicyManager(address(policyManager));
        console.log("PolicyManager updated");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("InvoiceRegistry:", address(registry));
        console.log("PolicyManager:", address(policyManager));
        console.log("PaymentProcessor:", address(processor));
        console.log("AgentEscrow:", address(escrow));
        console.log("");
        console.log("Add these to your .env file:");
        console.log("INVOICE_REGISTRY_ADDRESS=", address(registry));
        console.log("POLICY_MANAGER_ADDRESS=", address(policyManager));
        console.log("PAYMENT_PROCESSOR_ADDRESS=", address(processor));
        console.log("AGENT_ESCROW_ADDRESS=", address(escrow));
    }
}
