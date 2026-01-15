/**
 * SimpleInvoice - 3-line integration for AI agents
 * 
 * Usage:
 * const invoice = new SimpleInvoice();
 * await invoice.billFor("API usage", 10.5);
 * // Done! Invoice created and recorded on blockchain
 */

import { ethers } from 'ethers';
import { AgentInvoice } from './AgentInvoice';

export class SimpleInvoice {
  private sdk: AgentInvoice;
  private signer: ethers.Wallet;
  private agentAddress: string;
  private serviceProvider: string;

  constructor(config?: {
    agentPrivateKey?: string;
    serviceProvider?: string;
  }) {
    // Default configuration - works out of the box!
    const rpcUrl = config?.rpcUrl || 'https://rpc.testnet.arc.network';
    const registryAddress = '0x34158fedf9f863cfdf7da54b3baf7b2ae700b70c';
    const processorAddress = '0x3e412244e13701516a3a364278e4f43ba036b864';

    // Initialize SDK
    this.sdk = new AgentInvoice(rpcUrl, registryAddress, processorAddress);

    // Setup wallet
    const privateKey = config?.agentPrivateKey || process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('AGENT_PRIVATE_KEY environment variable required');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, provider);
    this.agentAddress = this.signer.address;

    // Default service provider (can be changed)
    this.serviceProvider = config?.serviceProvider || process.env.SERVICE_PROVIDER || this.agentAddress;
  }

  /**
   * Bill for a service - automatically creates and records invoice
   * 
   * @param description - What you're billing for (e.g., "API usage")
   * @param amount - Amount in USDC (e.g., 10.5)
   * @returns Invoice ID on blockchain
   */
  async billFor(description: string, amount: number): Promise<string> {
    // Create invoice with single call
    const invoiceId = await this.sdk.createInvoice(this.signer, {
      payer: this.agentAddress,
      payee: this.serviceProvider,
      amount: amount.toString(),
      description: description,
      usageData: {
        timestamp: new Date().toISOString(),
        service: 'auto-billed'
      }
    });

    console.log(`✅ Invoice created: ${invoiceId}`);
    console.log(`📊 View at: https://testnet.arcscan.app/tx/${invoiceId}`);

    return invoiceId;
  }

  /**
   * Check how much you've billed total
   */
  async getTotalBilled(): Promise<string> {
    const invoices = await this.sdk.getInvoicesByPayee(this.serviceProvider);
    let total = 0n;

    for (const invoiceId of invoices) {
      const invoice = await this.sdk.getInvoice(invoiceId);
      total += BigInt(invoice.amount);
    }

    return ethers.formatUnits(total, 18);
  }

  /**
   * Get billing history
   */
  async getHistory(): Promise<Array<{
    id: string;
    amount: string;
    description: string;
    date: Date;
    status: string;
  }>> {
    const invoiceIds = await this.sdk.getInvoicesByPayee(this.serviceProvider);
    const history = [];

    for (const id of invoiceIds) {
      const invoice = await this.sdk.getInvoice(id);
      history.push({
        id,
        amount: ethers.formatUnits(invoice.amount, 18),
        description: invoice.description,
        date: new Date(Number(invoice.createdAt) * 1000),
        status: ['PENDING', 'PAID', 'HELD', 'CANCELLED'][invoice.status]
      });
    }

    return history;
  }
}
