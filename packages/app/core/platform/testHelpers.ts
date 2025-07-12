/**
 * Test helpers for platform adapter
 * Provides in-memory storage for test environment
 */

// In-memory storage for tests
let testUserSecretKey: string | null = null;
let testUserSecretKeyPersistent: string | null = null;
let testVaultData: any[] = [];
let testRememberedEmail: string | null = null;
let testStorage: Record<string, any> = {};

// User secret key operations for tests
export async function setTestUserSecretKey(key: string): Promise<void> {
  testUserSecretKey = key;
}

export async function getTestUserSecretKey(): Promise<string | null> {
  return testUserSecretKey;
}

export async function clearTestUserSecretKey(): Promise<void> {
  testUserSecretKey = null;
}

// Persistent user secret key operations for tests
export async function setTestUserSecretKeyPersistent(key: string, _expiresAt: number): Promise<void> {
  testUserSecretKeyPersistent = key;
}

export async function getTestUserSecretKeyPersistent(): Promise<string | null> {
  return testUserSecretKeyPersistent;
}

export async function clearTestUserSecretKeyPersistent(): Promise<void> {
  testUserSecretKeyPersistent = null;
}

// Vault operations for tests
export async function setTestVaultData(data: any[]): Promise<void> {
  testVaultData = data;
}

export async function getTestVaultData(): Promise<any[]> {
  return testVaultData;
}

export async function clearTestVaultData(): Promise<void> {
  testVaultData = [];
}

// Remembered email operations for tests
export async function setTestRememberedEmail(email: string | null): Promise<void> {
  testRememberedEmail = email;
}

export async function getTestRememberedEmail(): Promise<string | null> {
  return testRememberedEmail;
}

export async function clearTestRememberedEmail(): Promise<void> {
  testRememberedEmail = null;
}

// General storage operations for tests
export async function setTestStorageItem(key: string, value: any): Promise<void> {
  testStorage[key] = value;
}

export async function getTestStorageItem<T>(key: string): Promise<T | null> {
  return testStorage[key] || null;
}

export async function removeTestStorageItem(key: string): Promise<void> {
  delete testStorage[key];
}

export async function clearTestStorage(): Promise<void> {
  testStorage = {};
}

// Clear all test data
export async function clearAllTestData(): Promise<void> {
  testUserSecretKey = null;
  testUserSecretKeyPersistent = null;
  testVaultData = [];
  testRememberedEmail = null;
  testStorage = {};
} 