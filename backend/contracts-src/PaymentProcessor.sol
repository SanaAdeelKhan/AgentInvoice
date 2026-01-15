// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvoiceRegistry.sol";
import "./PolicyManager.sol";

/**
 * @title PaymentProcessor
 * @notice Handles invoice payments via direct USDC transfer or Cross-Chain Transfer Protocol
 * @dev Integrates with Circle Gateway for cross-chain payments
 */

/// @notice Minimal ERC20 interface for USDC transfers
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/// @notice Interface for Circle Gateway Minter
interface IGatewayMinter {
    function gatewayMint(
        bytes calldata attestation,
        bytes calldata attestationSignature
    ) external;
}

contract PaymentProcessor {
    /// @notice Reference to invoice registry
    InvoiceRegistry public registry;
    
    /// @notice Reference to policy manager
    PolicyManager public policyManager;
    
    /// @notice USDC token contract
    IERC20 public usdc;
    
    /// @notice Circle Gateway Minter contract
    IGatewayMinter public gatewayMinter;
    
    /// @notice Admin address
    address public admin;
    
    /// @notice Emitted when invoice is paid via direct transfer
    event InvoicePaymentProcessed(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        PaymentMethod method
    );
    
    /// @notice Emitted when invoice is held by policy
    event InvoiceHeld(
        bytes32 indexed invoiceId,
        string reason
    );
    
    /// @notice Payment method enum
    enum PaymentMethod {
        DIRECT,     // Direct USDC transfer on Arc
        GATEWAY     // Cross-chain via Gateway
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    /**
     * @notice Initialize payment processor
     * @param _registry Address of invoice registry
     * @param _policyManager Address of policy manager
     * @param _usdc Address of USDC token
     * @param _gatewayMinter Address of Gateway Minter
     */
    constructor(
        address _registry,
        address _policyManager,
        address _usdc,
        address _gatewayMinter
    ) {
        require(_registry != address(0), "Invalid registry");
        require(_policyManager != address(0), "Invalid policy manager");
        require(_usdc != address(0), "Invalid USDC");
        require(_gatewayMinter != address(0), "Invalid gateway minter");
        
        registry = InvoiceRegistry(_registry);
        policyManager = PolicyManager(_policyManager);
        usdc = IERC20(_usdc);
        gatewayMinter = IGatewayMinter(_gatewayMinter);
        admin = msg.sender;
    }
    
    /**
     * @notice Pay invoice via direct USDC transfer on Arc
     * @param _invoiceId ID of invoice to pay
     * @dev Caller must have approved this contract to spend USDC
     */
    function payInvoiceDirect(bytes32 _invoiceId) external {
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(_invoiceId);
        
        require(
            invoice.status == InvoiceRegistry.InvoiceStatus.PENDING,
            "Invoice not pending"
        );
        
        // Check policy
        (bool shouldHold, string memory reason) = policyManager.checkInvoice(
            invoice.payer,
            invoice.payee,
            invoice.amount
        );
        
        if (shouldHold) {
            registry.holdInvoice(_invoiceId, reason);
            emit InvoiceHeld(_invoiceId, reason);
            return;
        }
        
        // Transfer USDC from caller to payee
        require(
            usdc.transferFrom(msg.sender, invoice.payee, invoice.amount),
            "USDC transfer failed"
        );
        
        // Mark invoice as paid
        registry.markPaid(_invoiceId);
        
        emit InvoicePaymentProcessed(
            _invoiceId,
            msg.sender,
            invoice.payee,
            invoice.amount,
            PaymentMethod.DIRECT
        );
    }
    
    /**
     * @notice Pay invoice via Circle Gateway (cross-chain)
     * @param _invoiceId ID of invoice to pay
     * @param attestation Gateway attestation bytes
     * @param attestationSignature Gateway attestation signature
     * @dev Uses Gateway to mint USDC on Arc from cross-chain burn
     */
    function payInvoiceViaGateway(
        bytes32 _invoiceId,
        bytes calldata attestation,
        bytes calldata attestationSignature
    ) external {
        InvoiceRegistry.Invoice memory invoice = registry.getInvoice(_invoiceId);
        
        require(
            invoice.status == InvoiceRegistry.InvoiceStatus.PENDING,
            "Invoice not pending"
        );
        
        // Check policy
        (bool shouldHold, string memory reason) = policyManager.checkInvoice(
            invoice.payer,
            invoice.payee,
            invoice.amount
        );
        
        if (shouldHold) {
            registry.holdInvoice(_invoiceId, reason);
            emit InvoiceHeld(_invoiceId, reason);
            return;
        }
        
        // Record balance before Gateway mint
        uint256 balanceBefore = usdc.balanceOf(address(this));
        
        // Mint USDC via Gateway
        gatewayMinter.gatewayMint(attestation, attestationSignature);
        
        // Verify USDC was received
        uint256 balanceAfter = usdc.balanceOf(address(this));
        require(
            balanceAfter >= balanceBefore + invoice.amount,
            "Gateway mint failed or insufficient amount"
        );
        
        // Transfer USDC to payee
        require(
            usdc.transfer(invoice.payee, invoice.amount),
            "USDC transfer to payee failed"
        );
        
        // Mark invoice as paid
        registry.markPaid(_invoiceId);
        
        emit InvoicePaymentProcessed(
            _invoiceId,
            invoice.payer,
            invoice.payee,
            invoice.amount,
            PaymentMethod.GATEWAY
        );
    }
    
    /**
     * @notice Emergency function to recover stuck USDC
     * @param _to Address to send USDC to
     * @param _amount Amount to recover
     * @dev Only admin can call this
     */
    function recoverUSDC(address _to, uint256 _amount) external onlyAdmin {
        require(_to != address(0), "Invalid address");
        require(usdc.transfer(_to, _amount), "Transfer failed");
    }
    
    /**
     * @notice Update admin address
     * @param _newAdmin New admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
    
    /**
     * @notice Get USDC balance of this contract
     * @return Balance of USDC held by this contract
     */
    function getUSDCBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
