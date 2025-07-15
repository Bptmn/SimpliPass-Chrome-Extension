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
export async function detectPlatform(): Promise<'mobile' | 'extension' | 'unknown'> {
  // Check if we're in a browser environment (extension)
  if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
    return 'extension';
  }
  
  // Check if we're in React Native environment (mobile)
  // Only check if Platform is available (React Native environment)
  let Platform;
  try {
    Platform = (await import('react-native')).Platform;
  } catch {
    return 'unknown';
  }
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return 'mobile';
  }
  
  return 'extension';
}

/**
 * Check if the current environment is a Chrome extension
 * @returns boolean
 */
export function isExtension(): boolean {
  return getPlatform() === 'extension';
}

/**
 * Check if the current environment is a mobile app
 * @returns boolean
 */
export async function isMobile(): Promise<boolean> {
  return (await detectPlatform()) === 'mobile';
}

/**
 * Check if the current environment is iOS
 * @returns boolean
 */
export async function isIOS(): Promise<boolean> {
  let Platform;
  try {
    Platform = (await import('react-native')).Platform;
  } catch {
    return false;
  }
  return Platform.OS === 'ios';
}

/**
 * Check if the current environment is Android
 * @returns boolean
 */
export async function isAndroid(): Promise<boolean> {
  let Platform;
  try {
    Platform = (await import('react-native')).Platform;
  } catch {
    return false;
  }
  return Platform.OS === 'android';
}

// ===== Platform Capabilities =====

/**
 * Get platform-specific capabilities
 * @returns PlatformCapabilities
 */
export async function getPlatformCapabilities() {
  const platform = await detectPlatform();
  
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
export async function supportsBiometric(): Promise<boolean> {
  return (await getPlatformCapabilities()).biometric;
}

/**
 * Check if offline vault storage is supported on current platform
 * @returns boolean
 */
export async function supportsOfflineVault(): Promise<boolean> {
  return (await getPlatformCapabilities()).offlineVault;
}

/**
 * Check if secure storage is available on current platform
 * @returns boolean
 */
export async function supportsSecureStorage(): Promise<boolean> {
  return (await getPlatformCapabilities()).secureStorage;
}

/**
 * Check if clipboard operations are supported on current platform
 * @returns boolean
 */
export async function supportsClipboard(): Promise<boolean> {
  return (await getPlatformCapabilities()).clipboard;
}

/**
 * Check if network detection is available on current platform
 * @returns boolean
 */
export async function supportsNetworkDetection(): Promise<boolean> {
  return (await getPlatformCapabilities()).networkDetection;
}

// ===== Platform Configuration =====

/**
 * Get platform-specific configuration
 * @returns PlatformConfig
 */
export async function getPlatformConfig() {
  const platform = await detectPlatform();
  
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
export async function getPlatformInfo() {
  const platform = await detectPlatform();
  const capabilities = await getPlatformCapabilities();
  const config = await getPlatformConfig();
  
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

// ===== Synchronous Platform Detection =====

export function getPlatform() {
  if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
    return 'extension';
  }
  
  return 'mobile';
}

export function isWeb() {
  return getPlatform() === 'extension';
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