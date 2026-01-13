import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.agent-invoice');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.env');

export interface Config {
  RPC_URL: string;
  INVOICE_REGISTRY: string;
  PAYMENT_PROCESSOR: string;
  PRIVATE_KEY?: string;
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config | null {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }

  const result = config({ path: CONFIG_FILE });
  
  if (!result.parsed) {
    return null;
  }

  return {
    RPC_URL: result.parsed.RPC_URL || '',
    INVOICE_REGISTRY: result.parsed.INVOICE_REGISTRY || '',
    PAYMENT_PROCESSOR: result.parsed.PAYMENT_PROCESSOR || '',
    PRIVATE_KEY: result.parsed.PRIVATE_KEY
  };
}

export function saveConfig(cfg: Config): void {
  ensureConfigDir();
  
  const content = `RPC_URL=${cfg.RPC_URL}
INVOICE_REGISTRY=${cfg.INVOICE_REGISTRY}
PAYMENT_PROCESSOR=${cfg.PAYMENT_PROCESSOR}
${cfg.PRIVATE_KEY ? `PRIVATE_KEY=${cfg.PRIVATE_KEY}` : ''}`;

  fs.writeFileSync(CONFIG_FILE, content);
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
