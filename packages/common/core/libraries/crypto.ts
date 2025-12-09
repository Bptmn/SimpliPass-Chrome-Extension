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
  
  const salt = base64UrlToBytes(saltBase64Url);
  
  const enc = new TextEncoder();
  const crypto = getCrypto();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: 300000,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  );
  
  const derivedKey = bytesToBase64(new Uint8Array(derivedBits))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]+$/, '');
  
  return derivedKey;
}

export function encryptData(symmetricKey: string, plainText: string): string {
  
  const key = base64UrlToBytes(symmetricKey);
  
  const algo = new ChaCha20Poly1305(key);
  const nonce = randomBytes(12); // 12-byte nonce per message
  
  const plaintextBytes = new TextEncoder().encode(plainText);
  
  const encrypted = algo.seal(nonce, plaintextBytes);
  
  // Flutter format: nonce + ciphertext + mac
  // @stablelib returns ciphertext + mac combined, so we need to split them
  const MAC_LENGTH = 16;
  const ciphertext = encrypted.slice(0, encrypted.length - MAC_LENGTH);
  const mac = encrypted.slice(encrypted.length - MAC_LENGTH);
  
  // Flutter format: nonce + ciphertext + mac (exactly like Flutter)
  const result = new Uint8Array(nonce.length + ciphertext.length + mac.length);
  result.set(nonce, 0);
  result.set(ciphertext, nonce.length);
  result.set(mac, nonce.length + ciphertext.length);
  
  // Flutter uses standard Base64 (not Base64URL)
  const base64Result = bytesToBase64(result);
  
  return base64Result;
}

export function decryptData(symmetricKey: string, encryptedData: string): string {

  const key = base64UrlToBytes(symmetricKey);

  const algo = new ChaCha20Poly1305(key);
  // Flutter uses standard Base64 (not Base64URL)
  const encryptedBytes = base64ToBytes(encryptedData);

  const nonce = encryptedBytes.slice(0, 12);

  // Flutter format: nonce(12) | ciphertext | mac(16)
  const MAC_LENGTH = 16; // MAC is always 16 bytes for ChaCha20-Poly1305
  const ciphertext = encryptedBytes.slice(12, encryptedBytes.length - MAC_LENGTH);
  const mac = encryptedBytes.slice(encryptedBytes.length - MAC_LENGTH);
  
  // Flutter format: SecretBox(ciphertext, nonce: nonce, mac: Mac(mac))
  // @stablelib expects combined ciphertext+mac, so we combine them
  const ciphertextAndMac = new Uint8Array(ciphertext.length + mac.length);
  ciphertextAndMac.set(ciphertext, 0);
  ciphertextAndMac.set(mac, ciphertext.length);
  
  // Pass combined ciphertext+MAC to @stablelib (matches Flutter SecretBox format)
  const decrypted = algo.open(nonce, ciphertextAndMac);

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
  // Flutter format: base64Url.encode(key) - Base64URL (no padding)
  const base64 = btoa(String.fromCharCode(...key));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '');
}

// Legacy decryption function for backward compatibility
export function decryptDataLegacy(symmetricKey: string, encryptedData: string): string {
  try {
    console.log('[Crypto] Starting legacy decryption...');
    
    // Step 1: Decode the base64URL encrypted data
    const encryptedBytes = base64UrlToBytes(encryptedData);
    console.log('[Crypto] Decoded encrypted data length:', encryptedBytes.length);
    
    // Step 2: Extract components (legacy format: nonce(12) | ciphertext | mac(16))
    const nonce = encryptedBytes.slice(0, 12);
    const ciphertextAndMac = encryptedBytes.slice(12);
    const ciphertext = ciphertextAndMac.slice(0, -16);
    const mac = ciphertextAndMac.slice(-16);
    
    console.log('[Crypto] Legacy format - nonce:', nonce.length, 'ciphertext:', ciphertext.length, 'mac:', mac.length);
    
    // Step 3: For legacy format, we need to combine ciphertext + mac for @stablelib
    // The legacy format stores them separately, but @stablelib expects them combined
    const combinedCiphertext = new Uint8Array(ciphertext.length + mac.length);
    combinedCiphertext.set(ciphertext, 0);
    combinedCiphertext.set(mac, ciphertext.length);
    
    console.log('[Crypto] Combined ciphertext length for @stablelib:', combinedCiphertext.length);
    
    // Step 4: Decode the symmetric key (base64URL)
    const keyBytes = base64UrlToBytes(symmetricKey);
    console.log('[Crypto] Decoded key length:', keyBytes.length);
    
    // Step 5: Decrypt using @stablelib (expects combined ciphertext+mac)
    const algo = new ChaCha20Poly1305(keyBytes);
    const decryptedBytes = algo.open(nonce as Uint8Array, combinedCiphertext as Uint8Array);
    
    // Step 6: Convert back to string
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    console.log('[Crypto] Legacy decryption successful');
    
    return decryptedText;
  } catch (error) {
    console.error('[Crypto] Legacy decryption failed:', error);
    throw new Error(`Legacy decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
