// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./InvoiceRegistry.sol";
import "./PolicyManager.sol";

/**
 * @title AgentEscrow
 * @notice Escrow system for autonomous AI agent payments
 * @dev Customers deposit funds, AI agents can spend autonomously up to balance
 */
contract AgentEscrow is ReentrancyGuard {
    IERC20 public immutable usdc;
    InvoiceRegistry public immutable invoiceRegistry;
    PolicyManager public immutable policyManager;
    
    // Customer address => Escrow balance
    mapping(address => uint256) public escrowBalances;
    
    // Customer address => Service provider => Spending limit
    mapping(address => mapping(address => uint256)) public spendingLimits;
    
    // Customer address => Service provider => Amount spent
    mapping(address => mapping(address => uint256)) public spentAmounts;

    event EscrowDeposit(address indexed customer, uint256 amount);
    event EscrowWithdrawal(address indexed customer, uint256 amount);
    event SpendingLimitSet(address indexed customer, address indexed provider, uint256 limit);
    event AutoPaymentExecuted(
        address indexed customer,
        address indexed provider,
        bytes32 indexed invoiceId,
        uint256 amount
    );

    constructor(
        address _usdc,
        address _invoiceRegistry,
        address _policyManager
    ) {
        usdc = IERC20(_usdc);
        invoiceRegistry = InvoiceRegistry(_invoiceRegistry);
        policyManager = PolicyManager(_policyManager);
    }

    /**
     * @notice Deposit USDC into escrow for autonomous payments
     * @param _amount Amount of USDC to deposit (6 decimals)
     */
    function depositToEscrow(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        escrowBalances[msg.sender] += _amount;
        
        emit EscrowDeposit(msg.sender, _amount);
    }

    /**
     * @notice Withdraw USDC from escrow
     * @param _amount Amount to withdraw
     */
    function withdrawFromEscrow(uint256 _amount) external nonReentrant {
        require(escrowBalances[msg.sender] >= _amount, "Insufficient balance");
        
        escrowBalances[msg.sender] -= _amount;
        require(usdc.transfer(msg.sender, _amount), "Transfer failed");
        
        emit EscrowWithdrawal(msg.sender, _amount);
    }

    /**
     * @notice Set spending limit for a service provider
     * @param _provider Service provider address
     * @param _limit Maximum amount provider can charge per transaction
     */
    function setSpendingLimit(address _provider, uint256 _limit) external {
        spendingLimits[msg.sender][_provider] = _limit;
        emit SpendingLimitSet(msg.sender, _provider, _limit);
    }

    /**
     * @notice Autonomous payment execution (called by service provider)
     * @dev Creates invoice and pays it immediately from escrow
     * @param _customer Customer address (payer)
     * @param _amount Amount to charge
     * @param _description Service description
     * @param _usageHash Hash of usage data
     * @param _usageSignature Service provider signature
     * @return invoiceId Created invoice ID
     */
    function executeAutoPayment(
        address _customer,
        uint256 _amount,
        string calldata _description,
        bytes32 _usageHash,
        bytes calldata _usageSignature
    ) external nonReentrant returns (bytes32 invoiceId) {
        address provider = msg.sender;
        
        // Check escrow balance
        require(escrowBalances[_customer] >= _amount, "Insufficient escrow balance");
        
        // Check spending limit
        uint256 limit = spendingLimits[_customer][provider];
        require(limit > 0, "No spending limit set");
        require(_amount <= limit, "Exceeds spending limit");
        
        // Check policy before payment
        (bool shouldHold, string memory reason) = policyManager.checkInvoice(
            _customer,
            provider,
            _amount
        );
        
        // Create invoice
        invoiceId = invoiceRegistry.createInvoice(
            _customer,
            provider,
            _amount,
            _description,
            _usageHash,
            _usageSignature
        );
        
        if (shouldHold) {
            // Hold invoice for review
            invoiceRegistry.holdInvoice(invoiceId, reason);
            emit AutoPaymentExecuted(_customer, provider, invoiceId, 0);
        } else {
            // Execute payment from escrow
            escrowBalances[_customer] -= _amount;
            spentAmounts[_customer][provider] += _amount;
            
            require(usdc.transfer(provider, _amount), "Payment transfer failed");
            
            // Mark invoice as paid
            invoiceRegistry.markPaid(invoiceId);
            
            emit AutoPaymentExecuted(_customer, provider, invoiceId, _amount);
        }
        
        return invoiceId;
    }

    /**
     * @notice Get customer's escrow info
     */
    function getEscrowInfo(address _customer) external view returns (
        uint256 balance,
        uint256 totalSpent
    ) {
        balance = escrowBalances[_customer];
        totalSpent = 0;
    }

    /**
     * @notice Get spending info for customer-provider pair
     */
    function getSpendingInfo(address _customer, address _provider) external view returns (
        uint256 limit,
        uint256 spent,
        uint256 remaining
    ) {
        limit = spendingLimits[_customer][_provider];
        spent = spentAmounts[_customer][_provider];
        remaining = limit > spent ? limit - spent : 0;
    }
}
