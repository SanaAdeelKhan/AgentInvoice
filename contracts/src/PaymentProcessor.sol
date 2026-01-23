// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InvoiceRegistry.sol";
import "./PolicyManager.sol";

/**
 * @title PaymentProcessor
 * @notice Handles USDC payments for invoices on Arc
 * @dev Integrates with Circle Gateway for cross-chain USDC
 */
contract PaymentProcessor {
    InvoiceRegistry public invoiceRegistry;
    PolicyManager public policyManager;
    IERC20 public usdc;
    address public admin;

    event PaymentProcessed(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed payee,
        uint256 amount
    );

    event GatewayPaymentProcessed(
        bytes32 indexed invoiceId,
        bytes attestation
    );

    event AdminTransferred(
        address indexed oldAdmin,
        address indexed newAdmin
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    /**
     * @notice Initialize payment processor
     * @param _invoiceRegistry Address of invoice registry
     * @param _policyManager Address of policy manager
     * @param _usdc Address of USDC token on Arc
     */
    constructor(
        address _invoiceRegistry,
        address _policyManager,
        address _usdc
    ) {
        require(_invoiceRegistry != address(0), "Invalid registry");
        require(_policyManager != address(0), "Invalid policy manager");
        require(_usdc != address(0), "Invalid USDC");

        invoiceRegistry = InvoiceRegistry(_invoiceRegistry);
        policyManager = PolicyManager(_policyManager);
        usdc = IERC20(_usdc);
        admin = msg.sender;
    }

    /**
     * @notice Pay invoice via direct USDC transfer on Arc
     * @param _invoiceId ID of invoice to pay
     * @dev Caller must have approved this contract to spend USDC
     */
    function payInvoiceDirect(bytes32 _invoiceId) external {
        // Get invoice details
        (
            bytes32 id,
            address payer,
            address payee,
            uint256 amount,
            InvoiceRegistry.InvoiceStatus status,
            , // description
            , // usageHash
            , // usageSignature
            , // createdAt
            , // paidAt
              // holdReason
        ) = invoiceRegistry.getInvoice(_invoiceId);

        require(id != bytes32(0), "Invoice does not exist");
        require(
            status == InvoiceRegistry.InvoiceStatus.PENDING,
            "Invoice not pending"
        );

        // Check policy
        (bool shouldHold, string memory reason) = policyManager.checkInvoice(
            payer,
            payee,
            amount
        );

        if (shouldHold) {
            invoiceRegistry.holdInvoice(_invoiceId, reason);
            return;
        }

        // Transfer USDC from payer to payee
        require(
            usdc.transferFrom(msg.sender, payee, amount),
            "USDC transfer failed"
        );

        // Mark invoice as paid
        invoiceRegistry.markPaid(_invoiceId);

        emit PaymentProcessed(_invoiceId, payer, payee, amount);
    }

    /**
     * @notice Pay invoice using Circle Gateway
     * @param _invoiceId ID of invoice to pay
     * @param attestation Circle attestation data
     * @param attestationSignature Circle attestation signature
     * @dev Used for cross-chain USDC payments via Circle Gateway
     */
    function payInvoiceViaGateway(
        bytes32 _invoiceId,
        bytes calldata attestation,
        bytes calldata attestationSignature
    ) external {
        // Get invoice details
        (
            bytes32 id,
            address payer,
            address payee,
            uint256 amount,
            InvoiceRegistry.InvoiceStatus status,
            , // description
            , // usageHash
            , // usageSignature
            , // createdAt
            , // paidAt
              // holdReason
        ) = invoiceRegistry.getInvoice(_invoiceId);

        require(id != bytes32(0), "Invoice does not exist");
        require(
            status == InvoiceRegistry.InvoiceStatus.PENDING,
            "Invoice not pending"
        );

        // Check policy
        (bool shouldHold, string memory reason) = policyManager.checkInvoice(
            payer,
            payee,
            amount
        );

        if (shouldHold) {
            invoiceRegistry.holdInvoice(_invoiceId, reason);
            return;
        }

        // Mint USDC via Circle Gateway
        gatewayMint(attestation, attestationSignature);

        // Transfer USDC to payee
        require(usdc.transfer(payee, amount), "USDC transfer failed");

        // Mark invoice as paid
        invoiceRegistry.markPaid(_invoiceId);

        emit PaymentProcessed(_invoiceId, payer, payee, amount);
        emit GatewayPaymentProcessed(_invoiceId, attestation);
    }

    /**
     * @notice Mint USDC via Circle Gateway
     * @dev This is a placeholder - actual implementation depends on Gateway API
     */
    function gatewayMint(
        bytes calldata attestation,
        bytes calldata attestationSignature
    ) internal {
        // TODO: Implement Circle Gateway minting
        require(attestation.length > 0, "Invalid attestation");
        require(attestationSignature.length > 0, "Invalid signature");
    }

    /**
     * @notice Recover USDC sent to this contract
     * @param _to Recipient address
     * @param _amount Amount to recover
     */
    function recoverUSDC(address _to, uint256 _amount) external onlyAdmin {
        require(_to != address(0), "Invalid recipient");
        require(usdc.transfer(_to, _amount), "Transfer failed");
    }

    /**
     * @notice Transfer admin role
     * @param _newAdmin New admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin");
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminTransferred(oldAdmin, _newAdmin);
    }

    /**
     * @notice Get USDC balance of this contract
     */
    function getUSDCBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
