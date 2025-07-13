/**
 * Platform Adapters Index
 * 
 * Central export point for all platform adapter interfaces,
 * types, and utilities.
 */

// ===== Core Adapter Interface =====
export type { PlatformAdapter } from './platform.adapter';

// ===== Platform Detection =====
export {
  getCurrentPlatform,
  isExtension,
  isMobile,
  isIOS,
  isAndroid,
  getPlatformCapabilities,
  supportsBiometric,
  supportsOfflineVault,
  supportsSecureStorage,
  supportsClipboard,
  supportsNetworkDetection,
  getPlatformConfig,
  getPlatformInfo,
  isDevelopment,
  isProduction,
  isTestEnvironment,
} from './platform.detection';

// ===== Types =====
export type {
  PlatformCapabilities,
  PlatformInfo,
  PlatformConfig,
} from './platform.detection';

export type {
  EncryptedVault,
  PlatformError,
  BiometricError,
  StorageError,
  NetworkError,
} from './platform.adapter';

// ===== Adapter Factory =====
export { createPlatformAdapter, getPlatformAdapter, clearPlatformAdapter } from './adapter.factory'; 