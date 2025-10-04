/**
 * E2E Test Configuration
 * 
 * Central configuration file for all E2E test settings, including:
 * - Test user credentials
 * - Browser behavior settings
 * - Timeouts and delays
 * - Extension URLs and paths
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (5 levels up from this file)
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

export const TEST_CONFIG = {
  // Test User Credentials
  credentials: {
    // Valid test user (must exist in Firebase for tests to pass)
    validUser: {
      email: process.env.TEST_USER_EMAIL || 'test@simplipass.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    },
    // Invalid credentials for error testing
    invalidUser: {
      email: 'invalid@test.com',
      password: 'WrongPassword123!',
    },
    // Malformed email for validation testing
    malformedEmail: {
      email: 'not-an-email',
      password: 'ValidPass123!',
    },
  },

  // Browser Behavior
  browser: {
    // Run in headed mode by default (show browser window)
    headless: process.env.HEADLESS === 'true',
    // Delay between actions in milliseconds
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 100,
    // Keep browser open after test failure for debugging
    keepOpenOnFailure: process.env.KEEP_OPEN === 'true',
  },

  // Timeouts (in milliseconds)
  timeouts: {
    // Default timeout for actions
    default: 5000,
    // Timeout for navigation
    navigation: 10000,
    // Timeout for service worker to be ready
    serviceWorker: 10000,
    // Timeout for authentication
    authentication: 15000,
    // Timeout for page load
    pageLoad: 10000,
  },

  // Waits (in milliseconds) - explicit waits for UI updates
  waits: {
    // Wait for UI to update after action
    shortWait: 500,
    // Wait for async operations
    mediumWait: 1000,
    // Wait for long operations
    longWait: 2000,
  },

  // Extension Configuration
  extension: {
    // Extension ID is dynamic, set during test
    id: '',
    // Popup dimensions
    popup: {
      width: 400,
      height: 600,
    },
  },

  // Test Data
  testData: {
    // Sample credential for testing
    sampleCredential: {
      title: 'Test Website',
      username: 'testuser@example.com',
      password: 'SamplePass123!',
      url: 'https://example.com',
      domain: 'example.com',
    },
    // Sample secure note
    sampleNote: {
      title: 'Test Note',
      content: 'This is a test secure note',
    },
  },

  // URLs for testing
  urls: {
    // Test websites for autofill testing
    loginPage: 'https://example.com/login',
    secureHttps: 'https://example.com',
    insecureHttp: 'http://example.com',
    // Firebase emulator (if using)
    firebaseEmulator: 'http://localhost:9099',
  },

  // Selectors (data-testid values)
  selectors: {
    // Login page
    login: {
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '[data-testid="error-message"]',
      errorBanner: '[data-testid="error-banner"]',
    },
    // Home page (after login)
    home: {
      page: '[data-testid="home-page"]',
      credentialsList: '[data-testid="credentials-list"]',
      addButton: '[data-testid="add-credential-button"]',
      logoutButton: '[data-testid="logout-button"]',
    },
    // Common UI elements
    common: {
      loadingSpinner: '[data-testid="loading-spinner"]',
      successMessage: '[data-testid="success-message"]',
    },
  },

  // Console monitoring
  console: {
    // Ignore these console messages in tests
    ignorePatterns: [
      'DevTools',
      'Download the React DevTools',
      'Warning: ReactDOM.render',
    ],
    // Expected error patterns for negative tests
    expectedErrors: {
      invalidCredentials: 'Invalid email or password',
      invalidEmail: 'Please enter a valid email',
    },
  },

  // Screenshot/Video settings
  media: {
    // Take screenshot on failure
    screenshotOnFailure: true,
    // Record video on failure
    videoOnFailure: true,
    // Screenshot directory
    screenshotDir: 'test-results/screenshots',
    // Video directory
    videoDir: 'test-results/videos',
  },
};

/**
 * Helper to get extension URL
 */
export function getExtensionUrl(extensionId: string, path: string = ''): string {
  return `chrome-extension://${extensionId}/${path}`;
}

/**
 * Helper to get popup URL
 */
export function getPopupUrl(extensionId: string): string {
  return getExtensionUrl(extensionId, 'popup.html');
}

/**
 * Helper to check if console message should be ignored
 */
export function shouldIgnoreConsoleMessage(message: string): boolean {
  return TEST_CONFIG.console.ignorePatterns.some(pattern => 
    message.includes(pattern)
  );
}

/**
 * Helper to wait for a specific duration
 */
export async function wait(duration: 'short' | 'medium' | 'long'): Promise<void> {
  const delay = TEST_CONFIG.waits[`${duration}Wait`];
  return new Promise(resolve => setTimeout(resolve, delay));
}

