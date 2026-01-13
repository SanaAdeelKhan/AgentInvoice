// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/InvoiceRegistry.sol";
import "../src/PolicyManager.sol";

contract InvoiceRegistryTest is Test {
    InvoiceRegistry public registry;
    PolicyManager public policyManager;
    
    address public payer = address(0x1);
    address public payee = address(0x2);
    address public processor = address(0x3);
    
    function setUp() public {
        // Deploy PolicyManager with temporary address
        policyManager = new PolicyManager(address(1));
        
        // Deploy InvoiceRegistry
        registry = new InvoiceRegistry(address(policyManager));
        
        // Redeploy PolicyManager with correct registry
        policyManager = new PolicyManager(address(registry));
        
        // Set payment processor
        registry.setPaymentProcessor(processor);
    }
    
    function testCreateInvoice() public {
        uint256 amount = 100e18;
        string memory desc = "API usage - Test";
        bytes32 usageHash = keccak256("usage data");
        bytes memory sig = "0x1234";
        
        bytes32 invoiceId = registry.createInvoice(
            payer,
            payee,
            amount,
            desc,
            usageHash,
            sig
        );
        
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(invoiceId);
        
        assertEq(invoice.payer, payer);
        assertEq(invoice.payee, payee);
        assertEq(invoice.amount, amount);
        assertEq(invoice.description, desc);
        assertTrue(invoice.status == InvoiceRegistry.InvoiceStatus.PENDING);
        assertEq(invoice.usageHash, usageHash);
    }
    
    function testCannotCreateInvoiceWithZeroAmount() public {
        vm.expectRevert("Amount must be > 0");
        registry.createInvoice(
            payer,
            payee,
            0,
            "test",
            bytes32(0),
            ""
        );
    }
    
    function testCannotCreateInvoiceWithInvalidPayee() public {
        vm.expectRevert("Invalid payee");
        registry.createInvoice(
            payer,
            address(0),
            100e18,
            "test",
            bytes32(0),
            ""
        );
    }
    
    function testMarkPaid() public {
        bytes32 invoiceId = registry.createInvoice(
            payer,
            payee,
            100e18,
            "test",
            bytes32(0),
            ""
        );
        
        // Only processor can mark paid
        vm.prank(processor);
        registry.markPaid(invoiceId);
        
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(invoiceId);
        assertTrue(invoice.status == InvoiceRegistry.InvoiceStatus.PAID);
        assertGt(invoice.paidAt, 0);
    }
    
    function testCannotMarkPaidAsNonProcessor() public {
        bytes32 invoiceId = registry.createInvoice(
            payer,
            payee,
            100e18,
            "test",
            bytes32(0),
            ""
        );
        
        vm.expectRevert("Only payment processor");
        registry.markPaid(invoiceId);
    }
    
    function testHoldInvoice() public {
        bytes32 invoiceId = registry.createInvoice(
            payer,
            payee,
            100e18,
            "test",
            bytes32(0),
            ""
        );
        
        // Only policy manager can hold
        vm.prank(address(policyManager));
        registry.holdInvoice(invoiceId, "Exceeds threshold");
        
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(invoiceId);
        assertTrue(invoice.status == InvoiceRegistry.InvoiceStatus.HELD);
        assertEq(invoice.holdReason, "Exceeds threshold");
    }
    
    function testCancelInvoice() public {
        bytes32 invoiceId = registry.createInvoice(
            payer,
            payee,
            100e18,
            "test",
            bytes32(0),
            ""
        );
        
        // Payer can cancel
        vm.prank(payer);
        registry.cancelInvoice(invoiceId);
        
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(invoiceId);
        assertTrue(invoice.status == InvoiceRegistry.InvoiceStatus.CANCELLED);
    }
    
    function testPayeeCanCancelInvoice() public {
        bytes32 invoiceId = registry.createInvoice(
            payer,
            payee,
            100e18,
            "test",
            bytes32(0),
            ""
        );
        
        // Payee can cancel
        vm.prank(payee);
        registry.cancelInvoice(invoiceId);
        
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(invoiceId);
        assertTrue(invoice.status == InvoiceRegistry.InvoiceStatus.CANCELLED);
    }
    
    function testGetInvoicesByPayer() public {
        bytes32 id1 = registry.createInvoice(payer, payee, 100e18, "test1", bytes32(0), "");
        bytes32 id2 = registry.createInvoice(payer, payee, 200e18, "test2", bytes32(0), "");
        
        bytes32[] memory invoices = registry.getInvoicesByPayer(payer);
        
        assertEq(invoices.length, 2);
        assertEq(invoices[0], id1);
        assertEq(invoices[1], id2);
    }
    
    function testGetInvoicesByPayee() public {
        bytes32 id1 = registry.createInvoice(payer, payee, 100e18, "test1", bytes32(0), "");
        bytes32 id2 = registry.createInvoice(payer, payee, 200e18, "test2", bytes32(0), "");
        
        bytes32[] memory invoices = registry.getInvoicesByPayee(payee);
        
        assertEq(invoices.length, 2);
        assertEq(invoices[0], id1);
        assertEq(invoices[1], id2);
    }
}
