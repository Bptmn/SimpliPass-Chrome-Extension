/**
 * Tests for device fingerprint generation and validation
 */

import { generateStableFingerprintKey, generateStableFingerprint, validateDeviceFingerprint } from '../fingerprint';
import { deriveKey } from '@app/utils/crypto';

// Mock dependencies
jest.mock('@app/utils/crypto');

// Mock navigator and screen objects
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    platform: 'MacIntel',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    connection: {
      effectiveType: '4g',
    },
  },
  writable: true,
});

Object.defineProperty(global, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelDepth: 24,
  },
  writable: true,
});

Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: jest.fn(() => ({
      resolvedOptions: () => ({
        timeZone: 'America/New_York',
      }),
    })),
  },
  writable: true,
});

Object.defineProperty(global, 'chrome', {
  value: {
    runtime: {
      id: 'test-extension-id',
    },
  },
  writable: true,
});

describe('Device Fingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (deriveKey as jest.Mock).mockResolvedValue('derived-fingerprint-key');
  });

  describe('generateStableFingerprint', () => {
    it('should generate a stable fingerprint string', () => {
      const fingerprint = generateStableFingerprint();

      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
      expect(fingerprint).toContain('Mozilla/5.0');
      expect(fingerprint).toContain('MacIntel');
      expect(fingerprint).toContain('en-US');
      expect(fingerprint).toContain('1920');
      expect(fingerprint).toContain('1080');
      expect(fingerprint).toContain('America/New_York');
      expect(fingerprint).toContain('8');
      expect(fingerprint).toContain('4g');
      expect(fingerprint).toContain('test-extension-id');
    });

    it('should generate consistent fingerprint for same device', () => {
      const fingerprint1 = generateStableFingerprint();
      const fingerprint2 = generateStableFingerprint();

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should handle missing optional properties gracefully', () => {
      // Mock missing optional properties
      Object.defineProperty(global.navigator, 'deviceMemory', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(global.navigator, 'connection', {
        value: undefined,
        writable: true,
      });

      const fingerprint = generateStableFingerprint();

      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });
  });

  describe('generateStableFingerprintKey', () => {
    it('should generate a fingerprint key using deriveKey', async () => {
      const key = await generateStableFingerprintKey();

      expect(key).toBe('derived-fingerprint-key');
      expect(deriveKey).toHaveBeenCalled();
    });

    it('should use the stable fingerprint as input to deriveKey', async () => {
      await generateStableFingerprintKey();

      expect(deriveKey).toHaveBeenCalledWith(
        expect.any(String), // fingerprint
        expect.any(String)  // salt
      );
    });

    it('should handle deriveKey errors gracefully', async () => {
      (deriveKey as jest.Mock).mockRejectedValue(new Error('Derivation failed'));

      await expect(generateStableFingerprintKey()).rejects.toThrow('Derivation failed');
    });
  });

  describe('validateDeviceFingerprint', () => {
    it('should return true when fingerprints match', () => {
      const storedFingerprint = generateStableFingerprint();
      const result = validateDeviceFingerprint(storedFingerprint);

      expect(result).toBe(true);
    });

    it('should return false when fingerprints do not match', () => {
      const storedFingerprint = 'different-fingerprint';
      const result = validateDeviceFingerprint(storedFingerprint);

      expect(result).toBe(false);
    });

    it('should return false for empty or null fingerprints', () => {
      expect(validateDeviceFingerprint('')).toBe(false);
      expect(validateDeviceFingerprint(null as any)).toBe(false);
      expect(validateDeviceFingerprint(undefined as any)).toBe(false);
    });
  });

  describe('Fingerprint Stability', () => {
    it('should generate same fingerprint across multiple calls', () => {
      const fingerprints = [];
      for (let i = 0; i < 5; i++) {
        fingerprints.push(generateStableFingerprint());
      }

      // All fingerprints should be identical
      const firstFingerprint = fingerprints[0];
      fingerprints.forEach(fingerprint => {
        expect(fingerprint).toBe(firstFingerprint);
      });
    });

    it('should include all relevant device characteristics', () => {
      const fingerprint = generateStableFingerprint();

      // Check for browser characteristics
      expect(fingerprint).toContain('userAgent');
      expect(fingerprint).toContain('platform');
      expect(fingerprint).toContain('language');
      expect(fingerprint).toContain('languages');

      // Check for screen characteristics
      expect(fingerprint).toContain('screenWidth');
      expect(fingerprint).toContain('screenHeight');
      expect(fingerprint).toContain('colorDepth');
      expect(fingerprint).toContain('pixelDepth');

      // Check for timezone
      expect(fingerprint).toContain('timezone');

      // Check for hardware characteristics
      expect(fingerprint).toContain('hardwareConcurrency');

      // Check for extension ID
      expect(fingerprint).toContain('extensionId');
    });
  });
}); 