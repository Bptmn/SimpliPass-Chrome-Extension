/**
 * Test Configuration for Playwright E2E Tests
 * 
 * Centralized configuration for all E2E tests
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const TEST_CONFIG = {
  credentials: {
    validUser: {
      email: process.env.TEST_USER_EMAIL || 'test@simplipass.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    },
    mfaUser: {
      email: process.env.TEST_MFA_USER_EMAIL || 'mfa@simplipass.com',
      password: process.env.TEST_MFA_USER_PASSWORD || 'MfaPass123!',
      mfaCode: process.env.TEST_MFA_CODE || '123456',
    },
    invalidUser: {
      email: 'invalid@simplipass.com',
      password: 'InvalidPassword123!',
    },
  },
  browser: {
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOWMO || '0', 10),
    viewport: { width: 1280, height: 720 },
  },
  timeouts: {
    default: 10000,
    navigation: 20000,
    authentication: 30000,
    autofill: 15000,
    elementVisibility: 5000,
  },
  selectors: {
    login: {
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '[data-testid="error-message"]',
      passwordToggle: '[data-testid="password-toggle"]',
    },
    home: {
      page: '[data-testid="home-page"]',
      logoutButton: '[data-testid="logout-button"]',
      credentialsList: '[data-testid="credentials-list"]',
      categoryCredentials: '[data-testid="category-credentials"]',
      categoryBankCards: '[data-testid="category-bank-cards"]',
      categorySecureNotes: '[data-testid="category-secure-notes"]',
    },
    common: {
      loadingSpinner: '[data-testid="loading-spinner"]',
      errorBanner: '[data-testid="error-banner"]',
      backButton: '[data-testid="back-button"]',
      nextButton: '[data-testid="next-button"]',
      saveButton: '[data-testid="save-button"]',
      deleteButton: '[data-testid="delete-button"]',
      confirmDeleteButton: '[data-testid="confirm-delete-button"]',
    },
    autofill: {
      popover: '[data-testid="autofill-popover"]',
      credentialOption: '[data-testid="credential-option-{title}"]',
      fillButton: '[data-testid="fill-button"]',
    },
  },
  urls: {
    loginPage: 'chrome-extension://<extensionId>/popup.html#/login',
    homePage: 'chrome-extension://<extensionId>/popup.html#/home',
  },
  testSites: {
    loginForm: 'https://example.com/login',
    signupForm: 'https://example.com/signup',
    contactForm: 'https://example.com/contact',
    checkoutForm: 'https://example.com/checkout',
  },
};

export function getPopupUrl(extensionId: string): string {
  return `chrome-extension://${extensionId}/popup.html`;
}

export function getTestSiteUrl(site: keyof typeof TEST_CONFIG.testSites): string {
  return TEST_CONFIG.testSites[site];
}

export function getSelector(selectorPath: string): string {
  const parts = selectorPath.split('.');
  let current: any = TEST_CONFIG.selectors;
  
  for (const part of parts) {
    current = current[part];
    if (current === undefined) {
      throw new Error(`Selector not found: ${selectorPath}`);
    }
  }
  
  return current;
}

export function getTimeout(timeoutType: keyof typeof TEST_CONFIG.timeouts): number {
  return TEST_CONFIG.timeouts[timeoutType];
}

export function isHeadless(): boolean {
  return TEST_CONFIG.browser.headless;
}

export function getSlowMo(): number {
  return TEST_CONFIG.browser.slowMo;
}
