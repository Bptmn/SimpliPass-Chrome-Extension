/**
 * Centralized test data for SimpliPass tests
 * 
 * This file contains all the valid test data needed across the test suite.
 * When you need to add new test data, add it here and ask the user to provide the values.
 * 
 * IMPORTANT: Replace all placeholder values with real, valid data before running tests.
 */

// Test data for Firebase - using static values for tests

// ============================================================================
// USER AUTHENTICATION DATA
// ============================================================================

export const TEST_USER = {
  /** Valid user email for authentication tests */
  email: 'vaserer612@frisbook.com',
  
  /** Valid user password for authentication tests */
  password: 'vasererPassword1',
  
  /** Valid user salt for key derivation tests */
  salt: 'ITM0NwaWB7MfD87AGauyDvbg5VcuJdGM_i-zv71EdN4=',
  
  /** Valid user ID for database operations */
  userId: '1189a0ce-6021-70e0-d6be-6c62a91e44f7',
  
  /** Valid MFA code for testing */
  mfaCode: '123456',
  
  /** Valid refresh token for session tests - NEEDS REAL VALUE */
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTg5YTBjZS02MDIxLTcwZTAtZDZiZS02YzYyYTkxZTQ0ZjciLCJleHAiOjE3MzU2ODAwMDAsImlhdCI6MTczNTY3NjQwMH0.mock-refresh-token',
  
  /** Valid access token for API tests - NEEDS REAL VALUE */
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTg5YTBjZS02MDIxLTcwZTAtZDZiZS02YzYyYTkxZTQ0ZjciLCJleHAiOjE3MzU2NzY4MDAsImlhdCI6MTczNTY3NjQwMH0.mock-access-token'
};

// ============================================================================
// CRYPTOGRAPHY TEST DATA
// ============================================================================

export const TEST_CRYPTO = {
  /** Valid encryption key (32 bytes in base64url format) */
  validKey: 'ZzRlZ2F5MnBmcXJpNWdrZjZ6OXh1MndveWd6NjRsY3diYTJkaDlsamlwODNwMWtqc3pua2Nya2FxZnIxdTB4bXFjajRrN2drajlibnk3eHdzN253bDFvYmUzYjhjeHpqbGt3bHNwb2w2YjI3ZGhyNDZqNTViaTNtdHphN2Foam4',
  
  /** Valid item key for testing item encryption */
  itemKey: '5FhMyhz9mvojV821hP5NTQ',
  
  /** Sample plaintext data for encryption tests */
  plaintextData: 'sensitive-password-data-here',
  
  /** Valid encrypted data in base64 format */
  encryptedData: 'd/fQUVlbkOSjhB8WDfTNncMbyPrbQcR+cgE4yTLUjtodT0mlJJ0a3wb+palOym2ozBD7lJ9FD9RacpDCeWp5H+F9mS8qzGqr/Dq28CCi+t9FXx8xk654cPh8qWtGkvbrC15rAjAYWTQUlw==',
  
  /** Valid nonce for encryption tests */
  nonce: 'maLMpprnVxc2uFUXaxSLTA'
};

// ============================================================================
// CREDENTIAL TEST DATA
// ============================================================================

export const TEST_CREDENTIAL = {
  /** Valid website URL for credential tests */
  url: 'facebook.com',
  
  /** Valid username for credential tests */
  username: 'vaserer612@frisbook.com',
  
  /** Valid password for credential tests */
  password: '6%]Yv3nTs11VMkVO',

  /** Valid title for credential tests */
  title: 'Facebook Account',
  
  /** Valid notes for credential tests */
  notes: 'Facebook Account',
  
  /** Valid domain for credential tests */
  domain: 'facebook.com'
};

// ============================================================================
// BANK CARD TEST DATA
// ============================================================================

export const TEST_BANK_CARD = {
  /** Valid card number for bank card tests */
  cardNumber: '4111111111111111',
  
  /** Valid cardholder name for bank card tests */
  cardholderName: 'John Doe',
  
  /** Valid expiry month for bank card tests */
  expiryMonth: '12',
  
  /** Valid expiry year for bank card tests */
  expiryYear: '2025',
  
  /** Valid CVV for bank card tests */
  cvv: '123',
  
  /** Valid title for bank card tests */
  title: 'Test Credit Card',
  
  /** Valid notes for bank card tests */
  notes: 'Test bank card notes here'
};

// ============================================================================
// SECURE NOTE TEST DATA
// ============================================================================

export const TEST_SECURE_NOTE = {
  /** Valid title for secure note tests */
  title: 'Test Secure Note',
  
  /** Valid content for secure note tests */
  content: 'This is a test secure note with sensitive information.',
  
  /** Valid notes for secure note tests */
  notes: 'Test secure note additional notes'
};

// ============================================================================
// ENCRYPTED ITEM TEST DATA
// ============================================================================

export const TEST_ENCRYPTED_ITEMS = {
  /** Valid encrypted credential content */
  credentialContent: 'vwplai+HkOBI8xHKU+YJ0KMkBsPQcsCU4yPKyywYOyt73SwClaiPCpmS+wAPLSomZB9u0cRGg9Hm5KacXRkHNiDeti28n238E7JNlSrPnm2Nfuy95kh/L7GKy61dFKtPlj/wk6ca0y2vzJVeDD33PlIOxFK4ShYpUzGyrTbP9XAdlCv3bQzGPurW9MGSOEXg9Pj9d8XA20aVLqYd03Q=',
  
  /** Valid encrypted credential item key */
  credentialItemKey: 'Ni58isOr8Q1wUZrjVTcuGURf/ZmhsTyYH1m7Wgk+IiWaGP4FwakpWFZ4DzBuerMYJ6QDphu873UP6Ura6gc+7unys7y22ww=',
  
  /** Valid encrypted bank card content */
  bankCardContent: 'K6zL8J1oZ4gk/wbDNuFK1JK4cFIw7sN9fIUtYbc1kebByupqRbVhAXseMNEKzk0LkiW2y90lvTuMYA0oImeapIKva4xV31NCl/e5BFcZipPmMvDkRYXdMM187hS64Oz8vJ4bnPOo9gO6iqgDIkXYf52j1aXF08R5oy8qMqNhbkrNhgVxrq88rAoZah808cCGLHT2zO7iGCs0genA0OL3i1npTI+eHqzuMDFMA5YplrWSPEtsMSCvcorJa7NzWvBbJ6b3iUj8bmpEXpLs9fBv7V8EZ2k4MDOnvFYJspUVAZt4aD5vzTUDa1k=',
  
  /** Valid encrypted bank card item key */
  bankCardItemKey: 'WTSXHhxlr5yIQWo5eYQzrkm8xUETQ5TNNu+huO4UjiAAnk6Z9GND+OiAdnulPdhouBmsm/AIjkqgromhXrIXjO3d0nNoq68=',
  
  /** Valid encrypted secure note content */
  secureNoteContent: 'd/fQUVlbkOSjhB8WDfTNncMbyPrbQcR+cgE4yTLUjtodT0mlJJ0a3wb+palOym2ozBD7lJ9FD9RacpDCeWp5H+F9mS8qzGqr/Dq28CCi+t9FXx8xk654cPh8qWtGkvbrC15rAjAYWTQUlw==',
  
  /** Valid encrypted secure note item key */
  secureNoteItemKey: 'h6vAJuyYW7Th5Bo119JANp23r/nPbZ25149cEzBdhftWn+GSZ814Tqo3V51G5weWqmOQqcJB0EQbvWz+xePHbuU4gUyRp58='
};

// ============================================================================
// FIREBASE/FIRESTORE TEST DATA
// ============================================================================

export const TEST_FIRESTORE = {
  /** Valid Firestore document ID */
  documentId: 'test-document-id',
  
  /** Valid Firestore collection name - subcollection of users */
  collectionName: 'my_items',
  
  /** Valid Firestore project ID from config */
  projectId: 'test-project-id',
  
  /** Valid Firestore API key from config */
  apiKey: 'test-api-key'
};

// ============================================================================
// CHROME EXTENSION TEST DATA
// ============================================================================

export const TEST_EXTENSION = {
  /** Valid extension ID for Chrome extension tests */
  extensionId: 'ldobcfgjehkmddppfmmkbemehoppoeio',
  
  /** Valid website URL for content script tests */
  testWebsiteUrl: 'https://example.com/login',
  
  /** Valid form field selectors for autofill tests */
  usernameFieldSelector: 'input[name="username"]',
  passwordFieldSelector: 'input[name="password"]'
};

// ============================================================================
// MOBILE APP TEST DATA
// ============================================================================

export const TEST_MOBILE = {
  /** Valid biometric authentication data - NEEDS REAL VALUE */
  biometricData: 'mock-biometric-data-for-testing',
  
  /** Valid device ID for mobile tests - NEEDS REAL VALUE */
  deviceId: 'mock-device-id-for-testing',
  
  /** Valid app version for mobile tests */
  appVersion: '1.0.0'
};

// ============================================================================
// TEST SCENARIOS DATA
// ============================================================================

export const TEST_SCENARIOS = {
  /** Valid data for password strength tests */
  weakPassword: 'weak',
  strongPassword: 'StrongPassword123!',
  
  /** Valid data for domain matching tests */
  exactDomain: 'example.com',
  subdomain: 'login.example.com',
  
  /** Valid data for expiration tests */
  expiredDate: '2020-01-01',
  futureDate: '2030-12-31',
  
  /** Valid data for search/filter tests */
  searchTerm: 'test',
  filterCategory: 'credentials'
};

// ============================================================================
// ERROR SCENARIOS DATA
// ============================================================================

export const TEST_ERRORS = {
  /** Invalid data for error testing */
  invalidEmail: 'invalid-email',
  invalidPassword: '',
  invalidCardNumber: '1234',
  invalidUrl: 'not-a-url',
  
  /** Network error scenarios */
  networkError: 'NETWORK_ERROR',
  timeoutError: 'TIMEOUT_ERROR',
  
  /** Authentication error scenarios */
  invalidCredentials: 'INVALID_CREDENTIALS',
  expiredToken: 'EXPIRED_TOKEN',
  mfaRequired: 'MFA_REQUIRED'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates that all required test data is provided
 * Call this function in tests to ensure data is available
 */
export function validateTestData(): void {
  const requiredFields = [
    TEST_USER.email,
    TEST_USER.password,
    TEST_USER.salt,
    TEST_CRYPTO.validKey,
    TEST_CREDENTIAL.url,
    TEST_CREDENTIAL.username,
    TEST_CREDENTIAL.password,
    TEST_BANK_CARD.cardNumber,
    TEST_BANK_CARD.cardholderName,
    TEST_SECURE_NOTE.title,
    TEST_SECURE_NOTE.content
  ];

  const missingFields = requiredFields.filter(field => 
    !field || field.includes('your-') || field.includes('test-') || field === ''
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing or invalid test data. Please update the following fields in testData.ts:\n` +
      `${missingFields.join('\n')}\n\n` +
      `Please provide real, valid data for these fields.`
    );
  }
}

/**
 * Creates a test credential with the provided data
 */
export function createTestCredential() {
  return {
    id: 'test-cred-1',
    item_type: 'credential' as const,
    content_encrypted: TEST_ENCRYPTED_ITEMS.credentialContent,
    item_key_encrypted: TEST_ENCRYPTED_ITEMS.credentialItemKey,
    created_at: new Date(),
    last_used_at: new Date()
  };
}

/**
 * Creates a test bank card with the provided data
 */
export function createTestBankCard() {
  return {
    id: 'test-card-1',
    item_type: 'bank_card' as const,
    content_encrypted: TEST_ENCRYPTED_ITEMS.bankCardContent,
    item_key_encrypted: TEST_ENCRYPTED_ITEMS.bankCardItemKey,
    created_at: new Date(),
    last_used_at: new Date()
  };
}

/**
 * Creates a test secure note with the provided data
 */
export function createTestSecureNote() {
  return {
    id: 'test-note-1',
    item_type: 'secure_note' as const,
    content_encrypted: TEST_ENCRYPTED_ITEMS.secureNoteContent,
    item_key_encrypted: TEST_ENCRYPTED_ITEMS.secureNoteItemKey,
    created_at: new Date(),
    last_used_at: new Date()
  };
}

// ============================================================================
// TEST SUITE FOR TEST DATA VALIDATION
// ============================================================================

describe('Test Data Validation', () => {
  it('should have valid test data', () => {
    expect(TEST_USER).toBeDefined();
    expect(TEST_CRYPTO).toBeDefined();
    expect(TEST_CREDENTIAL).toBeDefined();
    expect(TEST_BANK_CARD).toBeDefined();
    expect(TEST_SECURE_NOTE).toBeDefined();
  });
}); 