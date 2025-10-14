// crypto.flutter-alignment.test.ts
// Test to verify crypto functions are aligned with Flutter implementation

import { deriveKey, encryptData, decryptData, generateItemKey } from '../crypto';

describe('Crypto Flutter Alignment', () => {
  const testPassword = 'testPassword123';
  const testSalt = 'dGVzdFNhbHQ'; // base64url encoded test salt
  const testPlaintext = 'Hello, World! This is a test message.';

  test('deriveKey should match Flutter PBKDF2 implementation', async () => {
    const derivedKey = await deriveKey(testPassword, testSalt);
    
    // Should be Base64URL (no padding)
    expect(derivedKey).not.toContain('=');
    expect(derivedKey).not.toContain('+');
    expect(derivedKey).not.toContain('/');
    expect(derivedKey).toMatch(/^[A-Za-z0-9_-]+$/);
    
    // Should be 32 bytes (256 bits) encoded as Base64URL
    // Base64URL encoding of 32 bytes = 43 characters (no padding)
    expect(derivedKey.length).toBe(43);
    
    console.log('Derived key:', derivedKey);
  });

  test('generateItemKey should match Flutter format', () => {
    const itemKey = generateItemKey();
    
    // Should be Base64URL (no padding)
    expect(itemKey).not.toContain('=');
    expect(itemKey).not.toContain('+');
    expect(itemKey).not.toContain('/');
    expect(itemKey).toMatch(/^[A-Za-z0-9_-]+$/);
    
    // Should be 32 bytes (256 bits) encoded as Base64URL
    expect(itemKey.length).toBe(43);
    
    console.log('Generated item key:', itemKey);
  });

  test('encryptData should produce Flutter-compatible format', () => {
    const itemKey = generateItemKey();
    const encrypted = encryptData(itemKey, testPlaintext);
    
    // Should be standard Base64 (not Base64URL)
    expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/);
    
    // Should contain padding if needed
    expect(encrypted.length % 4).toBe(0);
    
    console.log('Encrypted data:', encrypted);
    console.log('Encrypted length:', encrypted.length);
  });

  test('decryptData should decrypt Flutter-encrypted data', () => {
    const itemKey = generateItemKey();
    const encrypted = encryptData(itemKey, testPlaintext);
    const decrypted = decryptData(itemKey, encrypted);
    
    expect(decrypted).toBe(testPlaintext);
    console.log('Original:', testPlaintext);
    console.log('Decrypted:', decrypted);
  });

  test('round-trip encryption/decryption should work', () => {
    const itemKey = generateItemKey();
    const testData = JSON.stringify({
      title: 'Test Credential',
      username: 'test@example.com',
      password: 'testPassword123',
      url: 'https://example.com',
      itemType: 'credential'
    });
    
    const encrypted = encryptData(itemKey, testData);
    const decrypted = decryptData(itemKey, encrypted);
    const parsed = JSON.parse(decrypted);
    
    expect(parsed.title).toBe('Test Credential');
    expect(parsed.username).toBe('test@example.com');
    expect(parsed.password).toBe('testPassword123');
    expect(parsed.url).toBe('https://example.com');
    expect(parsed.itemType).toBe('credential');
    
    console.log('Round-trip test successful');
  });

  test('multiple encryption/decryption cycles should be consistent', () => {
    const itemKey = generateItemKey();
    const testData = 'Consistency test data';
    
    // Encrypt and decrypt multiple times
    let encrypted = encryptData(itemKey, testData);
    let decrypted = decryptData(itemKey, encrypted);
    expect(decrypted).toBe(testData);
    
    encrypted = encryptData(itemKey, testData);
    decrypted = decryptData(itemKey, encrypted);
    expect(decrypted).toBe(testData);
    
    encrypted = encryptData(itemKey, testData);
    decrypted = decryptData(itemKey, encrypted);
    expect(decrypted).toBe(testData);
    
    console.log('Multiple cycles test successful');
  });
});
