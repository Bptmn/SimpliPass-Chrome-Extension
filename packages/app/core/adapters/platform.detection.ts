/**
 * Platform Detection Utilities
 * 
 * Provides utilities to detect the current platform and determine
 * platform-specific capabilities and configurations.
 */

// ===== Platform Detection =====

/**
 * Get the current platform name
 * @returns 'mobile' | 'extension'
 */
export function getCurrentPlatform(): 'mobile' | 'extension' {
  // Check if we're in a browser environment (extension)
  if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
    return 'extension';
  }
  
  // Check if we're in React Native environment (mobile)
  // Only check if Platform is available (React Native environment)
  try {
    const { Platform } = require('react-native');
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return 'mobile';
    }
  } catch (error) {
    // Platform not available, not in React Native environment
  }
  
  // Default fallback - assume extension for browser environment
  return 'extension';
}

/**
 * Check if the current environment is a Chrome extension
 * @returns boolean
 */
export function isExtension(): boolean {
  return getCurrentPlatform() === 'extension';
}

/**
 * Check if the current environment is a mobile app
 * @returns boolean
 */
export function isMobile(): boolean {
  return getCurrentPlatform() === 'mobile';
}

/**
 * Check if the current environment is iOS
 * @returns boolean
 */
export function isIOS(): boolean {
  try {
    const { Platform } = require('react-native');
    return Platform.OS === 'ios';
  } catch (error) {
    return false;
  }
}

/**
 * Check if the current environment is Android
 * @returns boolean
 */
export function isAndroid(): boolean {
  try {
    const { Platform } = require('react-native');
    return Platform.OS === 'android';
  } catch (error) {
    return false;
  }
}

// ===== Platform Capabilities =====

/**
 * Get platform-specific capabilities
 * @returns PlatformCapabilities
 */
export function getPlatformCapabilities() {
  const platform = getCurrentPlatform();
  
  if (platform === 'extension') {
    return {
      biometric: false, // Chrome extensions don't support biometrics
      offlineVault: true, // Extensions can store encrypted vault locally
      secureStorage: true, // chrome.storage.local provides secure storage
      clipboard: true, // Extensions have clipboard access
      networkDetection: true, // Extensions can detect network status
    };
  }
  
  // Mobile platform
  return {
    biometric: true, // Mobile platforms support biometrics
    offlineVault: false, // Mobile always fetches from Firestore
    secureStorage: true, // Keychain/Keystore provides secure storage
    clipboard: true, // React Native has clipboard access
    networkDetection: true, // React Native can detect network status
  };
}

/**
 * Check if biometric authentication is supported on current platform
 * @returns boolean
 */
export function supportsBiometric(): boolean {
  return getPlatformCapabilities().biometric;
}

/**
 * Check if offline vault storage is supported on current platform
 * @returns boolean
 */
export function supportsOfflineVault(): boolean {
  return getPlatformCapabilities().offlineVault;
}

/**
 * Check if secure storage is available on current platform
 * @returns boolean
 */
export function supportsSecureStorage(): boolean {
  return getPlatformCapabilities().secureStorage;
}

/**
 * Check if clipboard operations are supported on current platform
 * @returns boolean
 */
export function supportsClipboard(): boolean {
  return getPlatformCapabilities().clipboard;
}

/**
 * Check if network detection is available on current platform
 * @returns boolean
 */
export function supportsNetworkDetection(): boolean {
  return getPlatformCapabilities().networkDetection;
}

// ===== Platform Configuration =====

/**
 * Get platform-specific configuration
 * @returns PlatformConfig
 */
export function getPlatformConfig() {
  const platform = getCurrentPlatform();
  
  if (platform === 'extension') {
    return {
      storageKey: 'userSecretKey',
      vaultKey: 'encryptedVault',
      deviceFingerprintKey: 'deviceFingerprint',
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxRetryAttempts: 3,
      encryptionAlgorithm: 'AES-256-GCM',
    };
  }
  
  // Mobile platform
  return {
    storageKey: 'userSecretKey',
    vaultKey: null, // Mobile doesn't use local vault
    deviceFingerprintKey: null, // Mobile doesn't use device fingerprint
    sessionTimeout: 15 * 60 * 1000, // 15 minutes (shorter for mobile)
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
  };
}

// ===== Platform Info =====

/**
 * Get comprehensive platform information
 * @returns PlatformInfo
 */
export function getPlatformInfo() {
  const platform = getCurrentPlatform();
  const capabilities = getPlatformCapabilities();
  const config = getPlatformConfig();
  
  return {
    name: platform,
    version: getPlatformVersion(),
    capabilities,
    config,
  };
}

/**
 * Get platform version information
 * @returns string
 */
function getPlatformVersion(): string {
  if (isExtension()) {
    return chrome.runtime.getManifest().version;
  }
  
  // For mobile, we could get this from app.json or similar
  return '1.0.0'; // Default version
}

// ===== Environment Detection =====

/**
 * Check if running in development mode
 * @returns boolean
 */
export function isDevelopment(): boolean {
  return __DEV__ === true;
}

/**
 * Check if running in production mode
 * @returns boolean
 */
export function isProduction(): boolean {
  return !isDevelopment();
}

/**
 * Check if running in test environment
 * @returns boolean
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

// ===== Type Definitions =====

export interface PlatformConfig {
  storageKey: string;
  vaultKey: string | null;
  deviceFingerprintKey: string | null;
  sessionTimeout: number;
  maxRetryAttempts: number;
  encryptionAlgorithm: string;
}

export interface PlatformCapabilities {
  biometric: boolean;
  offlineVault: boolean;
  secureStorage: boolean;
  clipboard: boolean;
  networkDetection: boolean;
}

export interface PlatformInfo {
  name: 'mobile' | 'extension';
  version: string;
  capabilities: PlatformCapabilities;
  config: PlatformConfig;
} 