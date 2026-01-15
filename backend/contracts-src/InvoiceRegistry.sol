// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InvoiceRegistry
 * @notice Core invoice storage and management contract
 * @dev Stores invoice data with usage attestations for auditing
 */
contract InvoiceRegistry {
    /// @notice Invoice status enum
    enum InvoiceStatus {
        PENDING,    // Invoice created, awaiting payment
        PAID,       // Invoice paid successfully
        HELD,       // Invoice held by policy manager
        CANCELLED   // Invoice cancelled
    }
    
    /// @notice Invoice structure with all relevant data
    struct Invoice {
        bytes32 id;              // Unique invoice identifier
        address payer;           // Agent/wallet paying the invoice
        address payee;           // Business/service receiving payment
        uint256 amount;          // Amount in USDC (18 decimals)
        InvoiceStatus status;    // Current status
        string description;      // Human-readable description
        bytes32 usageHash;       // Hash of usage attestation data
        bytes usageSignature;    // Service provider signature
        uint256 createdAt;       // Creation timestamp
        uint256 paidAt;          // Payment timestamp
        string holdReason;       // Reason if held by policy
    }
    
    /// @notice Mapping of invoice ID to invoice data
    mapping(bytes32 => Invoice) public invoices;
    
    /// @notice Mapping of payer address to their invoice IDs
    mapping(address => bytes32[]) public invoicesByPayer;
    
    /// @notice Mapping of payee address to their invoice IDs
    mapping(address => bytes32[]) public invoicesByPayee;
    
    /// @notice Address of the policy manager contract
    address public policyManager;
    
    /// @notice Address of the payment processor contract
    address public paymentProcessor;
    
    /// @notice Emitted when a new invoice is created
    event InvoiceCreated(
        bytes32 indexed id,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        string description
    );
    
    /// @notice Emitted when an invoice is paid
    event InvoicePaid(
        bytes32 indexed id,
        uint256 amount,
        uint256 timestamp
    );
    
    /// @notice Emitted when an invoice is held by policy
    event InvoiceHeld(
        bytes32 indexed id,
        string reason
    );
    
    /// @notice Emitted when an invoice is cancelled
    event InvoiceCancelled(
        bytes32 indexed id,
        address indexed cancelledBy
    );
    
    /// @notice Emitted when policy manager is updated
    event PolicyManagerUpdated(
        address indexed oldManager,
        address indexed newManager
    );
    
    /// @notice Emitted when payment processor is updated
    event PaymentProcessorUpdated(
        address indexed oldProcessor,
        address indexed newProcessor
    );
    
    /**
     * @notice Initialize the invoice registry
     * @param _policyManager Address of policy manager contract
     */
    constructor(address _policyManager) {
        require(_policyManager != address(0), "Invalid policy manager");
        policyManager = _policyManager;
    }
    
    /**
     * @notice Create a new invoice
     * @param _payer Address of the payer (agent wallet)
     * @param _payee Address of the payee (service provider)
     * @param _amount Amount in USDC (18 decimals)
     * @param _description Human-readable description
     * @param _usageHash Hash of usage attestation data
     * @param _usageSignature Service provider signature
     * @return invoiceId Unique identifier for the created invoice
     */
    function createInvoice(
        address _payer,
        address _payee,
        uint256 _amount,
        string memory _description,
        bytes32 _usageHash,
        bytes memory _usageSignature
    ) external returns (bytes32 invoiceId) {
        require(_amount > 0, "Amount must be > 0");
        require(_payee != address(0), "Invalid payee");
        require(_payer != address(0), "Invalid payer");
        
        // Generate unique invoice ID
        invoiceId = keccak256(
            abi.encodePacked(
                _payer,
                _payee,
                _amount,
                _description,
                block.timestamp,
                block.number,
                invoicesByPayer[_payer].length
            )
        );
        
        // Ensure invoice doesn't already exist
        require(invoices[invoiceId].id == bytes32(0), "Invoice already exists");
        
        // Create invoice
        Invoice storage invoice = invoices[invoiceId];
        invoice.id = invoiceId;
        invoice.payer = _payer;
        invoice.payee = _payee;
        invoice.amount = _amount;
        invoice.status = InvoiceStatus.PENDING;
        invoice.description = _description;
        invoice.usageHash = _usageHash;
        invoice.usageSignature = _usageSignature;
        invoice.createdAt = block.timestamp;
        
        // Track invoice for payer and payee
        invoicesByPayer[_payer].push(invoiceId);
        invoicesByPayee[_payee].push(invoiceId);
        
        emit InvoiceCreated(invoiceId, _payer, _payee, _amount, _description);
        
        return invoiceId;
    }
    
    /**
     * @notice Mark invoice as paid (only PaymentProcessor)
     * @param _invoiceId ID of the invoice to mark as paid
     */
    function markPaid(bytes32 _invoiceId) external {
        require(msg.sender == paymentProcessor, "Only payment processor");
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.id != bytes32(0), "Invoice does not exist");
        require(invoice.status == InvoiceStatus.PENDING, "Invoice not pending");
        
        invoice.status = InvoiceStatus.PAID;
        invoice.paidAt = block.timestamp;
        
        emit InvoicePaid(_invoiceId, invoice.amount, block.timestamp);
    }
    
    /**
     * @notice Hold invoice (only PolicyManager)
     * @param _invoiceId ID of the invoice to hold
     * @param _reason Reason for holding the invoice
     */
    function holdInvoice(bytes32 _invoiceId, string memory _reason) external {
        require(msg.sender == policyManager, "Only policy manager");
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.id != bytes32(0), "Invoice does not exist");
        require(invoice.status == InvoiceStatus.PENDING, "Invoice not pending");
        
        invoice.status = InvoiceStatus.HELD;
        invoice.holdReason = _reason;
        
        emit InvoiceHeld(_invoiceId, _reason);
    }
    
    /**
     * @notice Cancel invoice (payer or payee can cancel pending invoices)
     * @param _invoiceId ID of the invoice to cancel
     */
    function cancelInvoice(bytes32 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.id != bytes32(0), "Invoice does not exist");
        require(invoice.status == InvoiceStatus.PENDING, "Invoice not pending");
        require(
            msg.sender == invoice.payer || msg.sender == invoice.payee,
            "Only payer or payee can cancel"
        );
        
        invoice.status = InvoiceStatus.CANCELLED;
        
        emit InvoiceCancelled(_invoiceId, msg.sender);
    }
    
    /**
     * @notice Get invoice details
     * @param _invoiceId ID of the invoice
     * @return invoice Invoice struct with all data
     */
    function getInvoice(bytes32 _invoiceId) 
        external 
        view 
        returns (Invoice memory invoice) 
    {
        invoice = invoices[_invoiceId];
        require(invoice.id != bytes32(0), "Invoice does not exist");
        return invoice;
    }
    
    /**
     * @notice Get all invoice IDs for a payer
     * @param _payer Address of the payer
     * @return Array of invoice IDs
     */
    function getInvoicesByPayer(address _payer) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return invoicesByPayer[_payer];
    }
    
    /**
     * @notice Get all invoice IDs for a payee
     * @param _payee Address of the payee
     * @return Array of invoice IDs
     */
    function getInvoicesByPayee(address _payee) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return invoicesByPayee[_payee];
    }
    
    /**
     * @notice Update policy manager address (only current policy manager)
     * @param _newPolicyManager Address of new policy manager
     */
    function updatePolicyManager(address _newPolicyManager) external {
        require(msg.sender == policyManager, "Only policy manager");
        require(_newPolicyManager != address(0), "Invalid address");
        
        address oldManager = policyManager;
        policyManager = _newPolicyManager;
        
        emit PolicyManagerUpdated(oldManager, _newPolicyManager);
    }
    
    /**
     * @notice Set payment processor address (only policy manager)
     * @param _paymentProcessor Address of payment processor
     */
    function setPaymentProcessor(address _paymentProcessor) external {
        require(msg.sender == policyManager, "Only policy manager");
        require(_paymentProcessor != address(0), "Invalid address");
        
        address oldProcessor = paymentProcessor;
        paymentProcessor = _paymentProcessor;
        
        emit PaymentProcessorUpdated(oldProcessor, _paymentProcessor);
    }
}
