/**
 * Test Data for Playwright E2E Tests
 * 
 * Centralized test data for consistent testing across all E2E tests
 */

export const TEST_CREDENTIALS = {
  google: { 
    title: 'Google Account', 
    username: 'test@gmail.com', 
    password: 'GooglePass123!',
    domain: 'google.com'
  },
  facebook: { 
    title: 'Facebook', 
    username: 'test@facebook.com', 
    password: 'FbPass123!',
    domain: 'facebook.com'
  },
  github: { 
    title: 'GitHub', 
    username: 'testuser', 
    password: 'GitHubPass123!',
    domain: 'github.com'
  },
  amazon: { 
    title: 'Amazon', 
    username: 'test@amazon.com', 
    password: 'AmazonPass123!',
    domain: 'amazon.com'
  },
  netflix: { 
    title: 'Netflix', 
    username: 'test@netflix.com', 
    password: 'NetflixPass123!',
    domain: 'netflix.com'
  },
};

export const TEST_BANK_CARDS = {
  visa: { 
    title: 'Visa Card', 
    number: '4111111111111111', 
    expiry: '12/25', 
    cvv: '123',
    cardholder: 'Test User'
  },
  mastercard: { 
    title: 'Mastercard', 
    number: '5555555555554444', 
    expiry: '06/26', 
    cvv: '456',
    cardholder: 'Test User'
  },
  amex: { 
    title: 'American Express', 
    number: '378282246310005', 
    expiry: '03/27', 
    cvv: '789',
    cardholder: 'Test User'
  },
};

export const TEST_SECURE_NOTES = {
  personal: { 
    title: 'Personal Information', 
    content: 'My personal information including SSN, address, and other sensitive data...' 
  },
  work: { 
    title: 'Work Notes', 
    content: 'Important work details, project information, and confidential notes...' 
  },
  medical: { 
    title: 'Medical Records', 
    content: 'Medical history, insurance information, and health records...' 
  },
  financial: { 
    title: 'Financial Info', 
    content: 'Bank account details, investment information, and financial planning notes...' 
  },
};

export const TEST_WEBSITES = {
  loginForm: 'https://example.com/login',
  signupForm: 'https://example.com/signup',
  contactForm: 'https://example.com/contact',
  checkoutForm: 'https://example.com/checkout',
  profileForm: 'https://example.com/profile',
};

export const TEST_PASSWORDS = {
  weak: '123456',
  medium: 'Password123',
  strong: 'Str0ng!P@ssw0rd#2024',
  veryStrong: 'V3ry$tr0ng!P@ssw0rd#2024$ecur3',
};

export const TEST_USER_ACCOUNTS = {
  standard: {
    email: process.env.TEST_USER_EMAIL || 'test@simplipass.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    hasMFA: false,
  },
  mfa: {
    email: process.env.TEST_MFA_USER_EMAIL || 'mfa@simplipass.com',
    password: process.env.TEST_MFA_USER_PASSWORD || 'MfaPass123!',
    hasMFA: true,
    mfaCode: process.env.TEST_MFA_CODE || '123456',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@simplipass.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!',
    hasMFA: false,
  },
};

export const TEST_FORM_SELECTORS = {
  email: [
    'input[type="email"]',
    'input[name="email"]',
    'input[name="username"]',
    'input[name="user"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="username" i]',
  ],
  password: [
    'input[type="password"]',
    'input[name="password"]',
    'input[name="pass"]',
    'input[placeholder*="password" i]',
  ],
  submit: [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'button:has-text("Log In")',
  ],
};

export const TEST_TIMEOUTS = {
  short: 5000,      // 5 seconds
  medium: 10000,    // 10 seconds
  long: 30000,      // 30 seconds
  veryLong: 60000,  // 60 seconds
};

export const TEST_CONFIG = {
  browser: {
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOWMO || '0', 10),
    viewport: { width: 1280, height: 720 },
  },
  extension: {
    loadTimeout: 30000,
    popupTimeout: 10000,
    autofillTimeout: 15000,
  },
  network: {
    timeout: 30000,
    retries: 3,
  },
};

/**
 * Get random test data for dynamic testing
 */
export function getRandomCredential() {
  const credentials = Object.values(TEST_CREDENTIALS);
  return credentials[Math.floor(Math.random() * credentials.length)];
}

export function getRandomBankCard() {
  const cards = Object.values(TEST_BANK_CARDS);
  return cards[Math.floor(Math.random() * cards.length)];
}

export function getRandomSecureNote() {
  const notes = Object.values(TEST_SECURE_NOTES);
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Generate test data with unique identifiers
 */
export function generateUniqueTestData() {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  return {
    credential: {
      title: `Test Credential ${timestamp}`,
      username: `test${randomId}@example.com`,
      password: `TestPass${timestamp}!`,
    },
    bankCard: {
      title: `Test Card ${timestamp}`,
      number: `411111111111${randomId}`,
      expiry: '12/25',
      cvv: '123',
    },
    secureNote: {
      title: `Test Note ${timestamp}`,
      content: `Test content ${timestamp} - ${randomId}`,
    },
  };
}
