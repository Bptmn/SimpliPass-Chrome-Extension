/**
 * Platform Adapters Index
 * 
 * Central export point for all platform adapter interfaces,
 * types, and utilities.
 */

// Re-export platform adapter functions
export { platform, initializePlatform } from './platform.adapter';
export type { PlatformAdapter } from './platform.adapter';

// Storage functions
export * from './storage'; 