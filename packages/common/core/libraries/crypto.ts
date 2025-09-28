// crypto.ts
// Crypto logic moved from utils/crypto.ts
import { ChaCha20Poly1305 } from '@stablelib/chacha20poly1305';
import { randomBytes } from '@stablelib/random';

// Tolerant Base64 decoder: accepts Base64 and Base64URL; adds padding as needed
function decodeBase64Tolerant(input: string): Uint8Array {
  let s = (input || '').trim();
  // Convert Base64URL to standard Base64
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (s.length % 4 !== 0) s += '=';
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function base64UrlToBytes(base64url: string): Uint8Array {
  return decodeBase64Tolerant(base64url);
}

export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToBytes(base64: string): Uint8Array {
  // Be tolerant to either Base64 or Base64URL inputs
  return decodeBase64Tolerant(base64);
}

function getCrypto(): Crypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  throw new Error('Crypto API not available in this environment');
}

export async function deriveKey(masterPassword: string, saltBase64Url: string): Promise<string> {
  console.log('[Crypto] Starting key derivation process');
  console.log('[Crypto] Master password length:', masterPassword.length);
  console.log('[Crypto] Master password (first 10 chars):', masterPassword.substring(0, 10) + '...');
  console.log('[Crypto] Salt Base64URL length:', saltBase64Url.length);
  console.log('[Crypto] Salt Base64URL (first 20 chars):', saltBase64Url.substring(0, 20) + '...');
  
  const salt = base64UrlToBytes(saltBase64Url);
  console.log('[Crypto] Decoded salt length:', salt.length);
  console.log('[Crypto] Decoded salt (first 10 bytes):', Array.from(salt.slice(0, 10)));
  
  const enc = new TextEncoder();
  const crypto = getCrypto();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  console.log('[Crypto] Password key imported successfully');
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 300000,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  );
  console.log('[Crypto] PBKDF2 derivation completed, bits length:', derivedBits.byteLength);
  
  const derivedKey = bytesToBase64(new Uint8Array(derivedBits))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]+$/, '');
  
  console.log('[Crypto] Derived key length:', derivedKey.length);
  console.log('[Crypto] Derived key (first 20 chars):', derivedKey.substring(0, 20) + '...');
  
  return derivedKey;
}

export function encryptData(symmetricKey: string, plainText: string): string {
  console.log('[Crypto] Starting encryption process');
  console.log('[Crypto] Input key length:', symmetricKey.length);
  console.log('[Crypto] Input key (first 10 chars):', symmetricKey.substring(0, 10) + '...');
  console.log('[Crypto] Input plaintext length:', plainText.length);
  console.log('[Crypto] Input plaintext (first 50 chars):', plainText.substring(0, 50) + (plainText.length > 50 ? '...' : ''));
  
  const key = base64UrlToBytes(symmetricKey);
  console.log('[Crypto] Decoded key length:', key.length);
  console.log('[Crypto] Decoded key (first 10 bytes):', Array.from(key.slice(0, 10)));
  
  const algo = new ChaCha20Poly1305(key);
  const nonce = randomBytes(12); // 12-byte nonce per message
  console.log('[Crypto] Generated nonce length:', nonce.length);
  console.log('[Crypto] Generated nonce:', Array.from(nonce));
  
  const plaintextBytes = new TextEncoder().encode(plainText);
  console.log('[Crypto] Plaintext bytes length:', plaintextBytes.length);
  console.log('[Crypto] Plaintext bytes (first 20 bytes):', Array.from(plaintextBytes.slice(0, 20)));
  
  const encrypted = algo.seal(nonce, plaintextBytes);
  console.log('[Crypto] Encrypted data length:', encrypted.length);
  console.log('[Crypto] Encrypted data (first 20 bytes):', Array.from(encrypted.slice(0, 20)));
  
  // Flutter format: nonce + ciphertext + mac (separate components)
  // @stablelib returns ciphertext + mac combined, so we need to split them
  const MAC_LENGTH = 16;
  const ciphertext = encrypted.slice(0, encrypted.length - MAC_LENGTH);
  const mac = encrypted.slice(encrypted.length - MAC_LENGTH);
  
  const result = new Uint8Array(nonce.length + ciphertext.length + mac.length);
  result.set(nonce, 0);
  result.set(ciphertext, nonce.length);
  result.set(mac, nonce.length + ciphertext.length);
  console.log('[Crypto] Final result length:', result.length);
  console.log('[Crypto] Final result (first 20 bytes):', Array.from(result.slice(0, 20)));
  
  const base64Result = bytesToBase64(result);
  console.log('[Crypto] Base64 result length:', base64Result.length);
  console.log('[Crypto] Base64 result (first 30 chars):', base64Result.substring(0, 30) + '...');
  
  return base64Result;
}

export function decryptData(symmetricKey: string, encryptedData: string): string {
  console.log('[Crypto] Starting decryption process');
  console.log('[Crypto] Input key length:', symmetricKey.length);
  console.log('[Crypto] Input key (first 10 chars):', symmetricKey.substring(0, 10) + '...');
  console.log('[Crypto] Input encrypted data length:', encryptedData.length);
  console.log('[Crypto] Input encrypted data (first 20 chars):', encryptedData.substring(0, 20) + '...');

  const key = base64UrlToBytes(symmetricKey);
  console.log('[Crypto] Decoded key length:', key.length);
  console.log('[Crypto] Decoded key (first 10 bytes):', Array.from(key.slice(0, 10)));

  const algo = new ChaCha20Poly1305(key);
  // Accept Base64 or Base64URL and add padding if necessary
  const encryptedBytes = base64ToBytes(encryptedData);
  console.log('[Crypto] Decoded encrypted data length:', encryptedBytes.length);
  console.log('[Crypto] Decoded encrypted data (first 20 bytes):', Array.from(encryptedBytes.slice(0, 20)));

  const nonce = encryptedBytes.slice(0, 12);
  console.log('[Crypto] Extracted nonce length:', nonce.length);
  console.log('[Crypto] Extracted nonce:', Array.from(nonce));

  // CRITICAL FIX: Separate ciphertext and MAC correctly
  const MAC_LENGTH = 16; // MAC is always 16 bytes for ChaCha20-Poly1305
  const ciphertext = encryptedBytes.slice(12, encryptedBytes.length - MAC_LENGTH);
  const mac = encryptedBytes.slice(encryptedBytes.length - MAC_LENGTH);
  
  console.log('[Crypto] Ciphertext length:', ciphertext.length);
  console.log('[Crypto] Ciphertext (first 20 bytes):', Array.from(ciphertext.slice(0, 20)));
  console.log('[Crypto] MAC length:', mac.length);
  console.log('[Crypto] MAC (all 16 bytes):', Array.from(mac));

  // Flutter format: pass separate ciphertext and mac to match SecretBox(ciphertext, nonce: nonce, mac: Mac(mac))
  // @stablelib expects combined ciphertext+mac, so we combine them
  const ciphertextAndMac = new Uint8Array(ciphertext.length + mac.length);
  ciphertextAndMac.set(ciphertext, 0);
  ciphertextAndMac.set(mac, ciphertext.length);
  
  console.log('[Crypto] Combined ciphertext+MAC length:', ciphertextAndMac.length);
  console.log('[Crypto] Combined ciphertext+MAC (first 20 bytes):', Array.from(ciphertextAndMac.slice(0, 20)));

  // Pass combined ciphertext+MAC to @stablelib (matches Flutter SecretBox format)
  const decrypted = algo.open(nonce, ciphertextAndMac);
  console.log('[Crypto] Decryption result:', decrypted ? 'SUCCESS' : 'FAILED');

  if (!decrypted) {
    console.error('[Crypto] Decryption failed - MAC verification failed');
    console.error('[Crypto] Key used:', symmetricKey);
    console.error('[Crypto] Encrypted data used:', encryptedData);
    console.error('[Crypto] Nonce extracted:', Array.from(nonce));
    console.error('[Crypto] Ciphertext extracted:', Array.from(ciphertext));
    console.error('[Crypto] MAC extracted:', Array.from(mac));
    console.error('[Crypto] Combined ciphertext+MAC:', Array.from(ciphertextAndMac));
    throw new Error('Decryption failed');
  }

  const result = new TextDecoder().decode(decrypted);
  console.log('[Crypto] Final decrypted text length:', result.length);
  console.log('[Crypto] Final decrypted text (first 50 chars):', result.substring(0, 50) + (result.length > 50 ? '...' : ''));
  return result;
}

export function generateItemKey(): string {
  const crypto = getCrypto();
  const key = crypto.getRandomValues(new Uint8Array(32));
  // Standard base64
  const base64 = btoa(String.fromCharCode(...key));
  // Convert to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '');
}