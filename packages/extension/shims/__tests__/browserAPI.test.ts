/**
 * Tests for browserAPI.ts
 * 
 * Tests that browserAPI works correctly in both web mode (sessionStorage/localStorage)
 * and extension mode (chrome.storage)
 */

import { sessionStorage, localStorage, runtime, tabs, browser } from '../browserAPI';

// Mock chrome API
const mockChrome = {
  storage: {
    session: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  runtime: {
    getManifest: jest.fn(() => ({ version: '1.0.0', name: 'SimpliPass' })),
    id: 'test-extension-id',
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
    }),
  },
  tabs: {
    query: jest.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com', title: 'Example' }])),
    sendMessage: jest.fn((tabId, message, callback) => {
      if (callback) callback({ success: true });
    }),
    get: jest.fn(() => Promise.resolve({ id: 1, url: 'https://example.com', title: 'Example' })),
  },
};

describe('browserAPI - Web Mode', () => {
  beforeEach(() => {
    // Clear all storage
    window.sessionStorage.clear();
    window.localStorage.clear();
    
    // Remove chrome from global scope to simulate web mode
    (global as any).chrome = undefined;
    
    // Set WEB_MODE environment variable
    process.env.WEB_MODE = 'true';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
    delete process.env.WEB_MODE;
  });

  describe('sessionStorage', () => {
    it('should store and retrieve data in web mode', async () => {
      await sessionStorage.set({ key1: 'value1', key2: { nested: 'data' } });
      
      const result = await sessionStorage.get(['key1', 'key2']);
      expect(result.key1).toBe('value1');
      expect(result.key2).toEqual({ nested: 'data' });
    });

    it('should remove data in web mode', async () => {
      await sessionStorage.set({ key1: 'value1' });
      await sessionStorage.remove('key1');
      
      const result = await sessionStorage.get('key1');
      expect(result.key1).toBeUndefined();
    });

    it('should clear all data in web mode', async () => {
      await sessionStorage.set({ key1: 'value1', key2: 'value2' });
      await sessionStorage.clear();
      
      const result = await sessionStorage.get(['key1', 'key2']);
      expect(result.key1).toBeUndefined();
      expect(result.key2).toBeUndefined();
    });

    it('should handle string keys', async () => {
      await sessionStorage.set({ key1: 'value1' });
      const result = await sessionStorage.get('key1');
      expect(result.key1).toBe('value1');
    });
  });

  describe('localStorage', () => {
    it('should store and retrieve data in web mode', async () => {
      await localStorage.set({ key1: 'value1', key2: { nested: 'data' } });
      
      const result = await localStorage.get(['key1', 'key2']);
      expect(result.key1).toBe('value1');
      expect(result.key2).toEqual({ nested: 'data' });
    });

    it('should remove data in web mode', async () => {
      await localStorage.set({ key1: 'value1' });
      await localStorage.remove('key1');
      
      const result = await localStorage.get('key1');
      expect(result.key1).toBeUndefined();
    });

    it('should clear all data in web mode', async () => {
      await localStorage.set({ key1: 'value1', key2: 'value2' });
      await localStorage.clear();
      
      const result = await localStorage.get(['key1', 'key2']);
      expect(result.key1).toBeUndefined();
      expect(result.key2).toBeUndefined();
    });
  });

  describe('runtime', () => {
    it('should return web mode manifest', () => {
      const manifest = runtime.getManifest();
      expect(manifest.version).toBe('1.0.0-web');
      expect(manifest.name).toBe('SimpliPass (Web Dev Mode)');
    });

    it('should return web mode ID', () => {
      expect(runtime.id).toBe('web-dev-mode');
    });

    it('should warn and return failure in web mode for sendMessage', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await runtime.sendMessage({ type: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Web Mode]'),
        expect.anything()
      );
      expect(result.success).toBe(false);
      expect(result.reason).toContain('Web mode');
      
      consoleSpy.mockRestore();
    });
  });

  describe('tabs', () => {
    it('should return current page info in web mode', async () => {
      const result = await tabs.query({ active: true, currentWindow: true });
      expect(result).toHaveLength(1);
      expect(result[0].url).toBe(window.location.href);
      expect(result[0].title).toBe(document.title);
    });

    it('should warn and return failure in web mode for sendMessage', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await tabs.sendMessage(1, { type: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Web Mode]'),
        expect.anything()
      );
      expect(result.success).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should return current page info in web mode for get', async () => {
      const result = await tabs.get(1);
      expect(result.url).toBe(window.location.href);
      expect(result.title).toBe(document.title);
    });
  });
});

describe('browserAPI - Extension Mode', () => {
  beforeEach(() => {
    // Mock chrome API
    (global as any).chrome = mockChrome;
    
    // Ensure WEB_MODE is not set
    delete process.env.WEB_MODE;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('sessionStorage', () => {
    it('should use chrome.storage.session in extension mode', async () => {
      mockChrome.storage.session.get.mockResolvedValue({ key1: 'value1' });
      
      const result = await sessionStorage.get('key1');
      expect(mockChrome.storage.session.get).toHaveBeenCalledWith('key1');
      expect(result.key1).toBe('value1');
    });

    it('should set data via chrome.storage.session', async () => {
      await sessionStorage.set({ key1: 'value1' });
      expect(mockChrome.storage.session.set).toHaveBeenCalledWith({ key1: 'value1' });
    });

    it('should remove data via chrome.storage.session', async () => {
      await sessionStorage.remove('key1');
      expect(mockChrome.storage.session.remove).toHaveBeenCalledWith('key1');
    });

    it('should clear data via chrome.storage.session', async () => {
      await sessionStorage.clear();
      expect(mockChrome.storage.session.clear).toHaveBeenCalled();
    });
  });

  describe('localStorage', () => {
    it('should use chrome.storage.local in extension mode', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ key1: 'value1' });
      
      const result = await localStorage.get('key1');
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith('key1');
      expect(result.key1).toBe('value1');
    });

    it('should set data via chrome.storage.local', async () => {
      await localStorage.set({ key1: 'value1' });
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ key1: 'value1' });
    });

    it('should remove data via chrome.storage.local', async () => {
      await localStorage.remove('key1');
      expect(mockChrome.storage.local.remove).toHaveBeenCalledWith('key1');
    });

    it('should clear data via chrome.storage.local', async () => {
      await localStorage.clear();
      expect(mockChrome.storage.local.clear).toHaveBeenCalled();
    });
  });

  describe('runtime', () => {
    it('should use chrome.runtime.getManifest in extension mode', () => {
      const manifest = runtime.getManifest();
      expect(mockChrome.runtime.getManifest).toHaveBeenCalled();
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.name).toBe('SimpliPass');
    });

    it('should return chrome.runtime.id in extension mode', () => {
      expect(runtime.id).toBe('test-extension-id');
    });

    it('should use chrome.runtime.sendMessage in extension mode', async () => {
      const result = await runtime.sendMessage({ type: 'test' });
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('tabs', () => {
    it('should use chrome.tabs.query in extension mode', async () => {
      const result = await tabs.query({ active: true, currentWindow: true });
      expect(mockChrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
      expect(result).toHaveLength(1);
    });

    it('should use chrome.tabs.sendMessage in extension mode', async () => {
      const result = await tabs.sendMessage(1, { type: 'test' });
      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(1, { type: 'test' }, expect.any(Function));
      expect(result.success).toBe(true);
    });

    it('should use chrome.tabs.get in extension mode', async () => {
      const result = await tabs.get(1);
      expect(mockChrome.tabs.get).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });
});

describe('browser API unified export', () => {
  it('should export all APIs under browser object', () => {
    expect(browser.storage.session).toBe(sessionStorage);
    expect(browser.storage.local).toBe(localStorage);
    expect(browser.runtime).toBe(runtime);
    expect(browser.tabs).toBe(tabs);
    expect(typeof browser.isWebMode).toBe('function');
  });
});
