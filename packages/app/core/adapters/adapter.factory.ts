/**
 * Platform Adapter Factory
 * 
 * Creates and returns the appropriate platform adapter based on
 * the current platform detection.
 */

import { PlatformAdapter } from './platform.adapter';
import { getCurrentPlatform } from './platform.detection';

/**
 * Create the appropriate platform adapter for the current platform
 * @returns Promise<PlatformAdapter>
 */
export async function createPlatformAdapter(): Promise<PlatformAdapter> {
  const platform = getCurrentPlatform();
  
  if (platform === 'extension') {
    // Dynamic import to avoid bundling mobile code in extension
    const { ExtensionPlatformAdapter } = await import('@extension/adapters/platform.adapter');
    return new ExtensionPlatformAdapter();
  }
  
  // Mobile platform
  const { MobilePlatformAdapter } = await import('@mobile/adapters/platform.adapter');
  return new MobilePlatformAdapter();
}

/**
 * Get a singleton instance of the platform adapter
 * @returns Promise<PlatformAdapter>
 */
let adapterInstance: PlatformAdapter | null = null;

export async function getPlatformAdapter(): Promise<PlatformAdapter> {
  if (!adapterInstance) {
    adapterInstance = await createPlatformAdapter();
  }
  return adapterInstance;
}

/**
 * Clear the singleton adapter instance (useful for testing)
 */
export function clearPlatformAdapter(): void {
  adapterInstance = null;
} 