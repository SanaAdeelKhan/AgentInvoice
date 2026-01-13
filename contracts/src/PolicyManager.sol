// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvoiceRegistry.sol";

/**
 * @title PolicyManager
 * @notice Manages safety policies and anomaly detection for invoices
 * @dev Implements spending limits, velocity checks, and whitelist/blacklist
 */
contract PolicyManager {
    /// @notice Reference to invoice registry
    InvoiceRegistry public registry;
    
    /// @notice Maximum amount threshold (in USDC with 18 decimals)
    uint256 public maxAmountThreshold;
    
    /// @notice Maximum invoices per hour per payer
    uint256 public maxPerHourThreshold;
    
    /// @notice Tracking invoice timestamps per payer
    mapping(address => uint256[]) public invoiceTimestamps;
    
    /// @notice Whitelist of trusted payees (bypass amount checks)
    mapping(address => bool) public whitelist;
    
    /// @notice Blacklist of blocked payees
    mapping(address => bool) public blacklist;
    
    /// @notice Admin address
    address public admin;
    
    /// @notice Emitted when a policy violation is detected
    event PolicyViolation(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed payee,
        string reason
    );
    
    /// @notice Emitted when whitelist is updated
    event WhitelistUpdated(
        address indexed account,
        bool status
    );
    
    /// @notice Emitted when blacklist is updated
    event BlacklistUpdated(
        address indexed account,
        bool status
    );
    
    /// @notice Emitted when thresholds are updated
    event ThresholdsUpdated(
        uint256 maxAmount,
        uint256 maxPerHour
    );
    
    /// @notice Emitted when admin is transferred
    event AdminTransferred(
        address indexed oldAdmin,
        address indexed newAdmin
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    /**
     * @notice Initialize the policy manager
     * @param _registry Address of invoice registry contract
     */
    constructor(address _registry) {
        require(_registry != address(0), "Invalid registry");
        registry = InvoiceRegistry(_registry);
        admin = msg.sender;
        
        // Set default thresholds
        maxAmountThreshold = 10000e18; // 10,000 USDC
        maxPerHourThreshold = 10;       // 10 invoices per hour
    }
    
    /**
     * @notice Check if invoice should be held based on policies
     * @param _payer Address of payer
     * @param _payee Address of payee
     * @param _amount Invoice amount
     * @return shouldHold Whether invoice should be held
     * @return reason Reason for holding (if applicable)
     */
    function checkInvoice(
        address _payer,
        address _payee,
        uint256 _amount
    ) external returns (bool shouldHold, string memory reason) {
        // Check blacklist first
        if (blacklist[_payee]) {
            emit PolicyViolation(bytes32(0), _payer, _payee, "Payee is blacklisted");
            return (true, "Payee is blacklisted");
        }
        
        // Check amount threshold (skip if payee is whitelisted)
        if (_amount > maxAmountThreshold && !whitelist[_payee]) {
            emit PolicyViolation(
                bytes32(0),
                _payer,
                _payee,
                "Amount exceeds threshold"
            );
            return (true, "Amount exceeds threshold");
        }
        
        // Check velocity (payments per hour)
        uint256 recentCount = 0;
        uint256 oneHourAgo = block.timestamp - 1 hours;
        
        uint256[] storage timestamps = invoiceTimestamps[_payer];
        
        // Count recent invoices
        for (uint256 i = 0; i < timestamps.length; i++) {
            if (timestamps[i] > oneHourAgo) {
                recentCount++;
            }
        }
        
        if (recentCount >= maxPerHourThreshold) {
            emit PolicyViolation(
                bytes32(0),
                _payer,
                _payee,
                "Too many invoices per hour"
            );
            return (true, "Too many invoices per hour");
        }
        
        // Track this payment timestamp
        timestamps.push(block.timestamp);
        
        // Clean up old timestamps (older than 1 hour)
        _cleanupTimestamps(_payer);
        
        return (false, "");
    }
    
    /**
     * @notice Clean up old timestamps for a payer
     * @param _payer Address of payer
     * @dev Removes timestamps older than 1 hour to prevent array bloat
     */
    function _cleanupTimestamps(address _payer) private {
        uint256 oneHourAgo = block.timestamp - 1 hours;
        uint256[] storage timestamps = invoiceTimestamps[_payer];
        
        uint256 validCount = 0;
        
        // Count valid timestamps
        for (uint256 i = 0; i < timestamps.length; i++) {
            if (timestamps[i] > oneHourAgo) {
                validCount++;
            }
        }
        
        // If we have timestamps to remove
        if (validCount < timestamps.length) {
            uint256[] memory newTimestamps = new uint256[](validCount);
            uint256 newIndex = 0;
            
            for (uint256 i = 0; i < timestamps.length; i++) {
                if (timestamps[i] > oneHourAgo) {
                    newTimestamps[newIndex] = timestamps[i];
                    newIndex++;
                }
            }
            
            // Replace with cleaned array
            delete invoiceTimestamps[_payer];
            for (uint256 i = 0; i < newTimestamps.length; i++) {
                invoiceTimestamps[_payer].push(newTimestamps[i]);
            }
        }
    }
    
    /**
     * @notice Add or remove address from whitelist
     * @param _address Address to update
     * @param _status New whitelist status
     */
    function setWhitelist(address _address, bool _status) external onlyAdmin {
        require(_address != address(0), "Invalid address");
        whitelist[_address] = _status;
        
        emit WhitelistUpdated(_address, _status);
    }
    
    /**
     * @notice Add or remove address from blacklist
     * @param _address Address to update
     * @param _status New blacklist status
     */
    function setBlacklist(address _address, bool _status) external onlyAdmin {
        require(_address != address(0), "Invalid address");
        blacklist[_address] = _status;
        
        emit BlacklistUpdated(_address, _status);
    }
    
    /**
     * @notice Update policy thresholds
     * @param _maxAmount New maximum amount threshold
     * @param _maxPerHour New maximum invoices per hour
     */
    function setThresholds(
        uint256 _maxAmount,
        uint256 _maxPerHour
    ) external onlyAdmin {
        require(_maxAmount > 0, "Amount must be > 0");
        require(_maxPerHour > 0, "Per hour must be > 0");
        
        maxAmountThreshold = _maxAmount;
        maxPerHourThreshold = _maxPerHour;
        
        emit ThresholdsUpdated(_maxAmount, _maxPerHour);
    }
    
    /**
     * @notice Transfer admin rights
     * @param _newAdmin Address of new admin
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        
        address oldAdmin = admin;
        admin = _newAdmin;
        
        emit AdminTransferred(oldAdmin, _newAdmin);
    }
    
    /**
     * @notice Get recent invoice count for payer
     * @param _payer Address of payer
     * @return count Number of invoices in last hour
     */
    function getRecentInvoiceCount(address _payer) external view returns (uint256 count) {
        uint256 oneHourAgo = block.timestamp - 1 hours;
        uint256[] storage timestamps = invoiceTimestamps[_payer];
        
        for (uint256 i = 0; i < timestamps.length; i++) {
            if (timestamps[i] > oneHourAgo) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @notice Check if payee is whitelisted
     * @param _payee Address to check
     * @return Whether address is whitelisted
     */
    function isWhitelisted(address _payee) external view returns (bool) {
        return whitelist[_payee];
    }
    
    /**
     * @notice Check if payee is blacklisted
     * @param _payee Address to check
     * @return Whether address is blacklisted
     */
    function isBlacklisted(address _payee) external view returns (bool) {
        return blacklist[_payee];
    }
}
