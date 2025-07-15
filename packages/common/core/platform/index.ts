/**
 * Platform Adapters Index
 * 
 * Central export point for all platform adapter interfaces,
 * types, and utilities.
 */

// Re-export platform adapter functions
export { getPlatformAdapter, clearPlatformAdapter } from './adapter.factory';
export type { PlatformAdapter } from './platform.adapter';

// Platform detection utilities
export {
  detectPlatform,
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

// Storage functions
export * from './storage'; 