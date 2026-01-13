export enum InvoiceStatus {
  PENDING = 0,
  PAID = 1,
  HELD = 2,
  CANCELLED = 3
}

export interface Invoice {
  id: string;
  payer: string;
  payee: string;
  amount: string;
  status: InvoiceStatus;
  description: string;
  usageHash: string;
  usageSignature: string;
  createdAt: number;
  paidAt: number;
  holdReason: string;
}

export interface CreateInvoiceParams {
  payer: string;
  payee: string;
  amount: string;
  description: string;
  usageData?: any;
}
export interface BurnIntent {
  sourceSigner: string;
  sourceChain: number;
  destinationChain: number;
  destinationRecipient: string;
  amount: string;
  maxBlockHeight: string;
  nonce: string;
}

export interface GatewayAttestation {
  attestation: string;
  attestationSignature: string;
}
