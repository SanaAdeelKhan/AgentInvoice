import { ethers } from 'ethers';

/**
 * Helper utilities for AgentInvoice SDK
 */
export class Helpers {
  /**
   * Format USDC amount (from wei to human-readable)
   */
  static formatUSDC(amount: bigint | string): string {
    return ethers.formatUnits(amount, 18);
  }

  /**
   * Parse USDC amount (from human-readable to wei)
   */
  static parseUSDC(amount: string): bigint {
    return ethers.parseUnits(amount, 18);
  }

  /**
   * Generate a preview invoice ID
   */
  static generateInvoiceId(
    payer: string,
    payee: string,
    amount: string,
    description: string
  ): string {
    const data = `${payer}-${payee}-${amount}-${description}-${Date.now()}`;
    return ethers.id(data).slice(0, 18);
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Create usage attestation hash and data
   */
  static createUsageAttestation(usageData: any): {
    hash: string;
    data: string;
  } {
    const data = JSON.stringify(usageData);
    const hash = ethers.id(data);

    return { hash, data };
  }

  /**
   * Estimate gas cost in USDC
   */
  static async estimateGasCost(
    provider: ethers.Provider,
    gasUsed: bigint
  ): Promise<string> {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;
    const gasCost = gasUsed * gasPrice;

    return this.formatUSDC(gasCost);
  }

  /**
   * Shorten address for display (0x1234...5678)
   */
  static shortenAddress(address: string, chars: number = 4): string {
    if (!this.isValidAddress(address)) return address;
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  }

  /**
   * Wait for transaction confirmation
   */
  static async waitForTransaction(
    provider: ethers.Provider,
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    return await provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get block timestamp
   */
  static async getBlockTimestamp(
    provider: ethers.Provider,
    blockNumber?: number
  ): Promise<number> {
    const block = await provider.getBlock(blockNumber || 'latest');
    return block?.timestamp || 0;
  }
}
