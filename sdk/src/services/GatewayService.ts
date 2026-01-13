import { ethers } from 'ethers';
import { BurnIntent, GatewayAttestation } from '../types';

const GATEWAY_API_TESTNET = 'https://gateway-api-testnet.circle.com';

// EIP-712 domain for Gateway burn intents
const GATEWAY_DOMAIN = {
  name: 'CircleGateway',
  version: '1',
  chainId: 1, // Will be set dynamically
  verifyingContract: '0x0000000000000000000000000000000000000000'
};

const BURN_INTENT_TYPES = {
  BurnIntent: [
    { name: 'sourceSigner', type: 'address' },
    { name: 'sourceChain', type: 'uint256' },
    { name: 'destinationChain', type: 'uint256' },
    { name: 'destinationRecipient', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'maxBlockHeight', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

export class GatewayService {
  private apiUrl: string;

  constructor(testnet: boolean = true) {
    this.apiUrl = testnet ? GATEWAY_API_TESTNET : 'https://gateway-api.circle.com';
  }

  /**
   * Get Gateway info (supported chains, contracts)
   */
  async getInfo(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/v1/info`);
    if (!response.ok) {
      throw new Error(`Gateway API error: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Create burn intent for cross-chain transfer
   */
  async createBurnIntent(
    sourceSigner: string,
    sourceChain: number,
    destinationChain: number,
    destinationRecipient: string,
    amount: string
  ): Promise<BurnIntent> {
    // Get current block height for expiration
    const info = await this.getInfo();
    const sourceNetwork = info.domains?.find((d: any) => d.domain === sourceChain);

    if (!sourceNetwork) {
      throw new Error(`Source chain ${sourceChain} not supported by Gateway`);
    }

    // Add buffer to expiration height (e.g., 100 blocks)
    const maxBlockHeight = (
      BigInt(sourceNetwork.burnIntentExpirationHeight || 0) + BigInt(100)
    ).toString();

    // Generate random nonce
    const nonce = ethers.hexlify(ethers.randomBytes(32));

    return {
      sourceSigner,
      sourceChain,
      destinationChain,
      destinationRecipient,
      amount,
      maxBlockHeight,
      nonce
    };
  }

  /**
   * Sign burn intent using EIP-712
   */
  async signBurnIntent(
    burnIntent: BurnIntent,
    signer: ethers.Signer
  ): Promise<string> {
    // Update domain with correct chain
    const domain = {
      ...GATEWAY_DOMAIN,
      chainId: burnIntent.sourceChain
    };

    // Sign typed data
    const signature = await signer.signTypedData(
      domain,
      BURN_INTENT_TYPES,
      burnIntent
    );

    return signature;
  }

  /**
   * Request attestation from Gateway API
   */
  async requestAttestation(
    burnIntent: BurnIntent,
    signature: string
  ): Promise<GatewayAttestation> {
    const response = await fetch(`${this.apiUrl}/v1/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        burnIntents: [burnIntent],
        signatures: [signature]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gateway API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    return {
      attestation: (data as any).attestation,
      attestationSignature: (data as any).attestationSignature
    };
  }

  /**
   * Estimate transfer time based on source chain
   */
  async estimateTransferTime(sourceChain: number): Promise<number> {
    const info = await this.getInfo();
    const network = info.domains?.find((d: any) => d.domain === sourceChain);

    if (!network) {
      return 300; // Default 5 minutes
    }

    // Gateway transfers are ~500ms after balance is established
    // Plus source chain finality time
    const finalityTimes: Record<number, number> = {
      1: 900,       // Ethereum: ~15 min
      137: 180,     // Polygon: ~3 min
      8453: 60,     // Base: ~1 min
      11155111: 60, // Sepolia: ~1 min
      5042002: 1    // Arc: ~1 sec
    };

    return (finalityTimes[sourceChain] || 300) + 1;
  }

  /**
   * Get USDC contract address for a chain
   */
  async getUSDCAddress(chainId: number): Promise<string | null> {
    const info = await this.getInfo();
    const network = info.domains?.find((d: any) => d.domain === chainId);
    return network?.usdcContractAddress || null;
  }
}
