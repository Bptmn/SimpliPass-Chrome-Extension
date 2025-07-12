/**
 * fingerprint.ts
 * 
 * Generates a stable device fingerprint key for encrypting the user secret key
 * Uses device-specific data that remains consistent across sessions
 */

import { deriveKey } from '@app/utils/crypto';

/**
 * Generate a stable device fingerprint based on device characteristics
 * This should remain consistent across browser sessions and app restarts
 */
export function generateStableFingerprint(): string {
  const fingerprintData = {
    // Browser/device characteristics
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages?.join(','),
    
    // Screen characteristics
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    
    // Timezone and locale
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Hardware concurrency (CPU cores)
    hardwareConcurrency: navigator.hardwareConcurrency,
    
    // Available memory (if available)
    deviceMemory: (navigator as any).deviceMemory,
    
    // Connection type
    connectionType: (navigator as any).connection?.effectiveType,
    
    // Chrome extension specific
    extensionId: chrome?.runtime?.id || 'unknown',
  };

  // Create a deterministic string from the fingerprint data
  const fingerprintString = JSON.stringify(fingerprintData, Object.keys(fingerprintData).sort());
  
  return fingerprintString;
}

/**
 * Generate a stable fingerprint key for encrypting the user secret key
 * Uses the device fingerprint as salt with a fixed master key
 */
export async function generateStableFingerprintKey(): Promise<string> {
  const fingerprint = generateStableFingerprint();
  
  // Use a fixed master key combined with the fingerprint
  // This ensures the fingerprint key is deterministic but unique per device
  const masterKey = 'SimpliPass_Device_Fingerprint_Master_Key_v1';
  const fingerprintKey = await deriveKey(masterKey, fingerprint);
  
  return fingerprintKey;
}

/**
 * Validate that the current device fingerprint matches the stored one
 * Used to detect if the device has changed significantly
 */
export function validateDeviceFingerprint(storedFingerprint: string): boolean {
  const currentFingerprint = generateStableFingerprint();
  return currentFingerprint === storedFingerprint;
} 