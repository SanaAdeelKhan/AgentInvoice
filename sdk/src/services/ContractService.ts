import { ethers } from 'ethers';
import { Invoice, InvoiceStatus } from '../types';

// Simplified Contract ABIs
const INVOICE_REGISTRY_ABI = [
  "function createInvoice(address _payer, address _payee, uint256 _amount, string _description, bytes32 _usageHash, bytes _usageSignature) returns (bytes32)",
  "function getInvoice(bytes32 _invoiceId) view returns (tuple(bytes32 id, address payer, address payee, uint256 amount, uint8 status, string description, bytes32 usageHash, bytes usageSignature, uint256 createdAt, uint256 paidAt, string holdReason))",
  "function getInvoicesByPayer(address _payer) view returns (bytes32[])",
  "function getInvoicesByPayee(address _payee) view returns (bytes32[])",
  "event InvoiceCreated(bytes32 indexed id, address indexed payer, address indexed payee, uint256 amount, string description)",
  "event InvoicePaid(bytes32 indexed id, uint256 amount, uint256 timestamp)",
  "event InvoiceHeld(bytes32 indexed id, string reason)"
];

const PAYMENT_PROCESSOR_ABI = [
  "function payInvoiceDirect(bytes32 _invoiceId)",
  "function payInvoiceViaGateway(bytes32 _invoiceId, bytes attestation, bytes attestationSignature)"
];

export class ContractService {
  private provider: ethers.Provider;
  private registryContract: ethers.Contract;
  private processorContract: ethers.Contract;

  constructor(
    provider: ethers.Provider,
    registryAddress: string,
    processorAddress: string
  ) {
    this.provider = provider;
    this.registryContract = new ethers.Contract(
      registryAddress,
      INVOICE_REGISTRY_ABI,
      provider
    );
    this.processorContract = new ethers.Contract(
      processorAddress,
      PAYMENT_PROCESSOR_ABI,
      provider
    );
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    signer: ethers.Signer,
    payer: string,
    payee: string,
    amount: bigint,
    description: string,
    usageHash: string,
    usageSignature: string
  ): Promise<string> {
    const registry = this.registryContract.connect(signer) as any;
    
    const tx = await registry.createInvoice(
      payer,
      payee,
      amount,
      description,
      usageHash,
      usageSignature
    );

    const receipt = await tx.wait();

    // Extract invoice ID from event
    const event = receipt.logs.find(
      (log: any) => {
        try {
          const parsed = this.registryContract.interface.parseLog(log);
          return parsed?.name === 'InvoiceCreated';
        } catch {
          return false;
        }
      }
    );

    if (event) {
      const parsed = this.registryContract.interface.parseLog(event);
      return parsed?.args?.id || '';
    }

    throw new Error('Invoice creation failed - no event emitted');
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const contract = this.registryContract as any;
    const result = await contract.getInvoice(invoiceId);

    return {
      id: result.id,
      payer: result.payer,
      payee: result.payee,
      amount: result.amount.toString(),
      status: result.status as InvoiceStatus,
      description: result.description,
      usageHash: result.usageHash,
      usageSignature: result.usageSignature,
      createdAt: Number(result.createdAt),
      paidAt: Number(result.paidAt),
      holdReason: result.holdReason
    };
  }

  /**
   * Pay invoice directly on Arc
   */
  async payInvoiceDirect(
    invoiceId: string,
    signer: ethers.Signer
  ): Promise<string> {
    const processor = this.processorContract.connect(signer) as any;
    const tx = await processor.payInvoiceDirect(invoiceId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Pay invoice via Gateway (cross-chain)
   */
  async payInvoiceViaGateway(
    invoiceId: string,
    attestation: string,
    attestationSignature: string,
    signer: ethers.Signer
  ): Promise<string> {
    const processor = this.processorContract.connect(signer) as any;
    const tx = await processor.payInvoiceViaGateway(
      invoiceId,
      attestation,
      attestationSignature
    );
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get all invoices for a payer
   */
  async getInvoicesByPayer(payer: string): Promise<string[]> {
    const contract = this.registryContract as any;
    return await contract.getInvoicesByPayer(payer);
  }

  /**
   * Get all invoices for a payee
   */
  async getInvoicesByPayee(payee: string): Promise<string[]> {
    const contract = this.registryContract as any;
    return await contract.getInvoicesByPayee(payee);
  }

  /**
   * Listen for invoice created events
   */
  onInvoiceCreated(
    callback: (id: string, payer: string, payee: string, amount: string) => void
  ): void {
    this.registryContract.on('InvoiceCreated', (id, payer, payee, amount) => {
      callback(id, payer, payee, amount.toString());
    });
  }

  /**
   * Listen for invoice paid events
   */
  onInvoicePaid(
    callback: (id: string, amount: string, timestamp: number) => void
  ): void {
    this.registryContract.on('InvoicePaid', (id, amount, timestamp) => {
      callback(id, amount.toString(), Number(timestamp));
    });
  }

  /**
   * Stop listening to all events
   */
  removeAllListeners(): void {
    this.registryContract.removeAllListeners();
    this.processorContract.removeAllListeners();
  }
}