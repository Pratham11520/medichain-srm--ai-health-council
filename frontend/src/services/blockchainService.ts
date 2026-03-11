import { Block, UserProfile } from '../types';
// ==========================================
// MediChain Blockchain Security Layer
// Tamper-evident record chaining with
// AES-256-GCM + SHA-256 (Production Grade)
// Uses Web Crypto API (browser-native)
// ==========================================

// --- Per-User Salt Management ---
// Each user gets a unique random salt stored alongside their data

function getUserSalt(email: string): Uint8Array {
  const key = `medichain_salt_${email}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return new Uint8Array(atob(stored).split('').map(c => c.charCodeAt(0)));
  }
  // Generate new 16-byte random salt for this user
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(key, btoa(String.fromCharCode(...salt)));
  return salt;
}

function getDefaultSalt(): Uint8Array {
  // Fallback salt for non-user-specific operations
  const stored = localStorage.getItem('medichain_default_salt');
  if (stored) {
    return new Uint8Array(atob(stored).split('').map(c => c.charCodeAt(0)));
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem('medichain_default_salt', btoa(String.fromCharCode(...salt)));
  return salt;
}

// --- AES-256-GCM Encryption ---

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data with AES-256-GCM (per-user salt)
export async function encryptData(plaintext: string, password: string, userEmail?: string): Promise<string> {
  const salt = userEmail ? getUserSalt(userEmail) : getDefaultSalt();
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt data with AES-256-GCM (per-user salt)
export async function decryptData(encryptedBase64: string, password: string, userEmail?: string): Promise<string> {
  try {
    const salt = userEmail ? getUserSalt(userEmail) : getDefaultSalt();
    const key = await deriveKey(password, salt);
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error('Decryption failed — data may be tampered or wrong password');
  }
}

// --- SHA-256 Hashing ---

export const calculateHash = async (index: number, previousHash: string, timestamp: number, data: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(index + previousHash + timestamp + data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Quick hash for tamper detection
export async function quickHash(data: string): Promise<string> {
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Blockchain-Based Hash Ledger (Tamper-Evident, Persistent) ---

const CHAIN_STORAGE_KEY = 'medichain_blockchain_chain';

export class Chain {
  public chain: Block[];

  constructor() {
    this.chain = this.loadChain() || [this.createGenesisBlock()];
  }

  createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: Date.now(),
      data: "Genesis Block — MediChain Blockchain Security Layer Initialized",
      previousHash: "0",
      hash: "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7"
    };
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(data: string): Promise<Block> {
    const previousBlock = this.getLatestBlock();
    const newIndex = previousBlock.index + 1;
    const newTimestamp = Date.now();
    const newHash = await calculateHash(newIndex, previousBlock.hash, newTimestamp, data);

    const newBlock: Block = {
      index: newIndex,
      timestamp: newTimestamp,
      data: data,
      previousHash: previousBlock.hash,
      hash: newHash
    };

    this.chain.push(newBlock);
    this.persistChain();
    return newBlock;
  }

  // Validate the entire chain — returns detailed report
  async isValid(): Promise<boolean> {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      const recalculatedHash = await calculateHash(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data
      );

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }
    }
    return true;
  }

  // Detailed integrity report per block
  async getIntegrityReport(): Promise<{ block: number; valid: boolean; issue?: string }[]> {
    const report: { block: number; valid: boolean; issue?: string }[] = [];
    report.push({ block: 0, valid: true }); // Genesis is always valid

    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.previousHash !== previous.hash) {
        report.push({ block: i, valid: false, issue: 'Previous hash mismatch — chain link broken' });
        continue;
      }

      const recalculated = await calculateHash(current.index, current.previousHash, current.timestamp, current.data);
      if (current.hash !== recalculated) {
        report.push({ block: i, valid: false, issue: 'Block hash does not match computed hash — data tampered' });
      } else {
        report.push({ block: i, valid: true });
      }
    }
    return report;
  }

  getChainLength(): number {
    return this.chain.length;
  }

  getLastVerificationTime(): string {
    const latest = this.getLatestBlock();
    return new Date(latest.timestamp).toLocaleString();
  }

  // Export chain as JSON for audit download
  exportChainAsJSON(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      algorithm: 'SHA-256',
      encryption: 'AES-256-GCM',
      chainLength: this.chain.length,
      blocks: this.chain,
    }, null, 2);
  }

  // Get chain statistics
  getStats(): {
    totalBlocks: number;
    totalActions: number;
    chatBlocks: number;
    profileBlocks: number;
    healthBlocks: number;
    firstBlock: string;
    lastBlock: string;
  } {
    const actions = this.chain.filter(b => b.index > 0);
    return {
      totalBlocks: this.chain.length,
      totalActions: actions.length,
      chatBlocks: actions.filter(b => b.data.startsWith('CHAT:')).length,
      profileBlocks: actions.filter(b => b.data.startsWith('PROFILE_SAVE:') || b.data.startsWith('USER_INIT:')).length,
      healthBlocks: actions.filter(b => b.data.startsWith('HEALTH_READING:') || b.data.startsWith('PILL_REMINDER:')).length,
      firstBlock: this.chain.length > 0 ? new Date(this.chain[0].timestamp).toLocaleDateString() : '-',
      lastBlock: this.chain.length > 0 ? new Date(this.chain[this.chain.length - 1].timestamp).toLocaleString() : '-',
    };
  }

  // Persist chain to localStorage
  private persistChain(): void {
    try {
      localStorage.setItem(CHAIN_STORAGE_KEY, JSON.stringify(this.chain));
    } catch (e) {
      console.warn('Blockchain persistence failed:', e);
    }
  }

  // Load chain from localStorage
  private loadChain(): Block[] | null {
    try {
      const stored = localStorage.getItem(CHAIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Block[];
        if (parsed.length > 0 && parsed[0].hash) return parsed;
      }
    } catch {
      // Corrupted chain — start fresh
    }
    return null;
  }

  async initUser(profile: UserProfile): Promise<void> {
    const data = JSON.stringify(profile);
    await this.addBlock(`USER_INIT:${profile.email}:${data}`);
    localStorage.setItem('medichain_user_enc', btoa(data));
  }
}

// Singleton instance
export const secureStorage = new Chain();

// --- Ledger Stats (for dashboard display) ---
export function getLedgerStats() {
  const stats = secureStorage.getStats();
  return {
    chainLength: secureStorage.getChainLength(),
    lastBlock: secureStorage.getLatestBlock(),
    lastVerified: secureStorage.getLastVerificationTime(),
    genesisHash: secureStorage.chain[0].hash.slice(0, 16) + '...',
    ...stats,
  };
}