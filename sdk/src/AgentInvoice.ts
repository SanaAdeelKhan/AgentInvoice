import { ethers } from 'ethers';
import { Invoice, CreateInvoiceParams, InvoiceStatus } from './types';
import { ContractService } from './services/ContractService';
import { GatewayService } from './services/GatewayService';
import { Helpers } from './utils/helpers';

/**
 * Main AgentInvoice SDK class
 */
export class AgentInvoice {
  private provider: ethers.Provider;
  private contractService: ContractService;
  private gatewayService: GatewayService;

  constructor(
    rpcUrl: string,
    registryAddress: string,
    processorAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractService = new ContractService(
      this.provider,
      registryAddress,
      processorAddress
    );
    this.gatewayService = new GatewayService(true); // testnet
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    signer: ethers.Signer,
    params: CreateInvoiceParams
  ): Promise<string> {
    // Create usage attestation
    const { hash: usageHash } = Helpers.createUsageAttestation(
      params.usageData || {}
    );

    // For now, use empty signature (service provider should sign)
    const usageSignature = '0x';

    // Parse amount to wei
    const amount = Helpers.parseUSDC(params.amount);

    // Create invoice
    return await this.contractService.createInvoice(
      signer,
      params.payer,
      params.payee,
      amount,
      params.description,
      usageHash,
      usageSignature
    );
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    return await this.contractService.getInvoice(invoiceId);
  }

  /**
   * Pay invoice directly on Arc
   */
  async payInvoiceDirect(
    invoiceId: string,
    signer: ethers.Signer
  ): Promise<string> {
    return await this.contractService.payInvoiceDirect(invoiceId, signer);
  }

  /**
   * Pay invoice via Gateway (cross-chain)
   */
  async payInvoiceViaGateway(
    invoiceId: string,
    signer: ethers.Signer,
    sourceChain: number
  ): Promise<string> {
    const invoice = await this.getInvoice(invoiceId);

    // Create burn intent
    const signerAddress = await signer.getAddress();
    const burnIntent = await this.gatewayService.createBurnIntent(
      signerAddress,
      sourceChain,
      5042002, // Arc Testnet
      invoice.payee,
      invoice.amount
    );

    // Sign burn intent
    const signature = await this.gatewayService.signBurnIntent(
      burnIntent,
      signer
    );

    // Get attestation
    const { attestation, attestationSignature } =
      await this.gatewayService.requestAttestation(burnIntent, signature);

    // Pay via Gateway
    return await this.contractService.payInvoiceViaGateway(
      invoiceId,
      attestation,
      attestationSignature,
      signer
    );
  }

  /**
   * Get invoices by payer
   */
  async getInvoicesByPayer(payer: string): Promise<string[]> {
    return await this.contractService.getInvoicesByPayer(payer);
  }

  /**
   * Get invoices by payee
   */
  async getInvoicesByPayee(payee: string): Promise<string[]> {
    return await this.contractService.getInvoicesByPayee(payee);
  }

  /**
   * Listen for invoice created events
   */
  onInvoiceCreated(
    callback: (id: string, payer: string, payee: string, amount: string) => void
  ): void {
    this.contractService.onInvoiceCreated(callback);
  }

  /**
   * Listen for invoice paid events
   */
  onInvoicePaid(
    callback: (id: string, amount: string, timestamp: number) => void
  ): void {
    this.contractService.onInvoicePaid(callback);
  }

  /**
   * Stop all event listeners
   */
  removeAllListeners(): void {
    this.contractService.removeAllListeners();
  }

  /**
   * Get provider (for advanced usage)
   */
  getProvider(): ethers.Provider {
    return this.provider;
  }
}
