// utils/crypto.ts
import { ChaCha20Poly1305 } from '@stablelib/chacha20poly1305';
import { randomBytes } from '@stablelib/random';

export function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
export function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export async function deriveKey(masterPassword: string, saltBase64Url: string): Promise<string> {
  const salt = base64UrlToBytes(saltBase64Url);
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 300000,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  );
  const derivedKey = bytesToBase64(new Uint8Array(derivedBits))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return derivedKey;
}

export function encryptData(symmetricKey: string, plainText: string): string {
  const key = base64UrlToBytes(symmetricKey);
  const algo = new ChaCha20Poly1305(key);
  const nonce = randomBytes(12);
  const plaintextBytes = new TextEncoder().encode(plainText);
  const encrypted = algo.seal(nonce, plaintextBytes);
  const result = new Uint8Array(nonce.length + encrypted.length);
  result.set(nonce, 0);
  result.set(encrypted, nonce.length);
  return bytesToBase64(result);
}

export function decryptData(symmetricKey: string, encryptedData: string): string {
  const key = base64UrlToBytes(symmetricKey);
  const algo = new ChaCha20Poly1305(key);
  const encryptedBytes = base64ToBytes(encryptedData);
  const nonce = encryptedBytes.slice(0, 12);
  const ciphertextAndMac = encryptedBytes.slice(12);
  const decrypted = algo.open(nonce, ciphertextAndMac);
  if (!decrypted) throw new Error('Decryption failed');
  return new TextDecoder().decode(decrypted);
}

export function generateItemKey(): string {
  const key = window.crypto.getRandomValues(new Uint8Array(32));
  // Standard base64
  const base64 = btoa(String.fromCharCode(...key));
  // Convert to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
