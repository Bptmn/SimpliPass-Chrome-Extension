import { PlatformAdapter } from '../platform.adapter';

describe('Platform Adapter Interface', () => {
  let mockPlatformAdapter: PlatformAdapter;

  beforeEach(() => {
    // Create a mock implementation of the platform adapter
    mockPlatformAdapter = {
      supportsBiometric: jest.fn(() => false),
      supportsOfflineVault: jest.fn(() => false),
      copyToClipboard: jest.fn().mockResolvedValue(undefined),
      getFromClipboard: jest.fn().mockResolvedValue('mock clipboard text'),
      isOnline: jest.fn().mockResolvedValue(true),
      getNetworkStatus: jest.fn().mockResolvedValue('online'),
    };
  });

  describe('supportsBiometric', () => {
    it('should return biometric support status', () => {
      const result = mockPlatformAdapter.supportsBiometric();
      expect(mockPlatformAdapter.supportsBiometric).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('supportsOfflineVault', () => {
    it('should return offline vault support status', () => {
      const result = mockPlatformAdapter.supportsOfflineVault();
      expect(mockPlatformAdapter.supportsOfflineVault).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const text = 'test text';
      await mockPlatformAdapter.copyToClipboard(text);
      expect(mockPlatformAdapter.copyToClipboard).toHaveBeenCalledWith(text);
    });
  });

  describe('getFromClipboard', () => {
    it('should get text from clipboard', async () => {
      const result = await mockPlatformAdapter.getFromClipboard();
      expect(mockPlatformAdapter.getFromClipboard).toHaveBeenCalled();
      expect(result).toBe('mock clipboard text');
    });
  });

  describe('isOnline', () => {
    it('should return online status', async () => {
      const result = await mockPlatformAdapter.isOnline();
      expect(mockPlatformAdapter.isOnline).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getNetworkStatus', () => {
    it('should return network status', async () => {
      const result = await mockPlatformAdapter.getNetworkStatus();
      expect(mockPlatformAdapter.getNetworkStatus).toHaveBeenCalled();
      expect(result).toBe('online');
    });
  });

  describe('optional methods', () => {
    it('should handle optional authenticateWithBiometrics method', async () => {
      const mockAdapterWithBiometrics = {
        ...mockPlatformAdapter,
        authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
      };

      if (mockAdapterWithBiometrics.authenticateWithBiometrics) {
        const result = await mockAdapterWithBiometrics.authenticateWithBiometrics();
        expect(mockAdapterWithBiometrics.authenticateWithBiometrics).toHaveBeenCalled();
        expect(result).toBe(true);
      }
    });

    it('should handle optional isBiometricAvailable method', async () => {
      const mockAdapterWithBiometricCheck = {
        ...mockPlatformAdapter,
        isBiometricAvailable: jest.fn().mockResolvedValue(true),
      };

      if (mockAdapterWithBiometricCheck.isBiometricAvailable) {
        const result = await mockAdapterWithBiometricCheck.isBiometricAvailable();
        expect(mockAdapterWithBiometricCheck.isBiometricAvailable).toHaveBeenCalled();
        expect(result).toBe(true);
      }
    });

    it('should handle optional setRememberedEmail method', async () => {
      const mockAdapterWithEmail = {
        ...mockPlatformAdapter,
        setRememberedEmail: jest.fn().mockResolvedValue(undefined),
      };

      if (mockAdapterWithEmail.setRememberedEmail) {
        await mockAdapterWithEmail.setRememberedEmail('test@example.com');
        expect(mockAdapterWithEmail.setRememberedEmail).toHaveBeenCalledWith('test@example.com');
      }
    });

    it('should handle optional getRememberedEmail method', async () => {
      const mockAdapterWithEmail = {
        ...mockPlatformAdapter,
        getRememberedEmail: jest.fn().mockResolvedValue('test@example.com'),
      };

      if (mockAdapterWithEmail.getRememberedEmail) {
        const result = await mockAdapterWithEmail.getRememberedEmail();
        expect(mockAdapterWithEmail.getRememberedEmail).toHaveBeenCalled();
        expect(result).toBe('test@example.com');
      }
    });
  });
}); 