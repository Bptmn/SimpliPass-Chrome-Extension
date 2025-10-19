// crypto.adapter.ts
// Crypto adapter interface for abstracting crypto library dependencies

export interface ICryptoAdapter {
  // Key generation and derivation
  generateSymmetricKey(): Promise<string>;
  deriveKeyFromPassword(password: string, salt: string, iterations?: number): Promise<string>;
  
  // Encryption/Decryption
  encryptData(symmetricKey: string, data: string): Promise<string>;
  decryptData(symmetricKey: string, encryptedData: string): Promise<string>;
  
  // Hashing
  hashData(data: string): Promise<string>;
  
  // Utility functions
  base64UrlToBytes(base64url: string): Uint8Array;
  bytesToBase64(bytes: Uint8Array): string;
}

// Default crypto adapter implementation using existing crypto library
export class DefaultCryptoAdapter implements ICryptoAdapter {
  private cryptoLib: any;

  constructor() {
    // Import crypto library dynamically to avoid circular dependencies
    // Use dynamic import instead of require for browser compatibility
    this.cryptoLib = null; // Will be loaded dynamically when needed
  }

  private async loadCryptoLib() {
    if (!this.cryptoLib) {
      this.cryptoLib = await import('../libraries/crypto');
    }
    return this.cryptoLib;
  }

  async generateSymmetricKey(): Promise<string> {
    const cryptoLib = await this.loadCryptoLib();
    return cryptoLib.generateSymmetricKey();
  }

  async deriveKeyFromPassword(password: string, salt: string, iterations: number = 100000): Promise<string> {
    const cryptoLib = await this.loadCryptoLib();
    return cryptoLib.deriveKeyFromPassword(password, salt, iterations);
  }

  async encryptData(symmetricKey: string, data: string): Promise<string> {
    const cryptoLib = await this.loadCryptoLib();
    return cryptoLib.encryptData(symmetricKey, data);
  }

  async decryptData(symmetricKey: string, encryptedData: string): Promise<string> {
    const cryptoLib = await this.loadCryptoLib();
    return cryptoLib.decryptData(symmetricKey, encryptedData);
  }

  async hashData(data: string): Promise<string> {
    const cryptoLib = await this.loadCryptoLib();
    return cryptoLib.hashData(data);
  }

  base64UrlToBytes(base64url: string): Uint8Array {
    // This method needs to be synchronous, so we'll import directly
    const cryptoLib = require('../libraries/crypto');
    return cryptoLib.base64UrlToBytes(base64url);
  }

  bytesToBase64(bytes: Uint8Array): string {
    // This method needs to be synchronous, so we'll import directly
    const cryptoLib = require('../libraries/crypto');
    return cryptoLib.bytesToBase64(bytes);
  }
}

// Export default instance
export const cryptoAdapter = new DefaultCryptoAdapter();
