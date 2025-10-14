/**
 * Browser API Abstraction Layer
 * 
 * Provides unified API that works in both web and extension contexts:
 * - Web mode: Uses sessionStorage, localStorage, window.location
 * - Extension mode: Uses chrome.storage, chrome.tabs, chrome.runtime
 * 
 * This allows developing the UI in web mode with real data persistence,
 * then seamlessly switching to extension mode for final testing.
 */

// Detect if running in web mode
const isWebMode = (): boolean => {
  return (
    typeof chrome === 'undefined' ||
    typeof chrome.storage === 'undefined' ||
    process.env.WEB_MODE === 'true'
  );
};

// ===== Storage API Abstraction =====

/**
 * Session Storage (RAM only)
 * - Extension: chrome.storage.session
 * - Web: sessionStorage
 */
export const sessionStorage = {
  async get(keys: string | string[]): Promise<Record<string, any>> {
    if (isWebMode()) {
      const result: Record<string, any> = {};
      const keyArray = typeof keys === 'string' ? [keys] : keys;
      
      for (const key of keyArray) {
        const value = window.sessionStorage.getItem(key);
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      }
      return result;
    } else {
      return chrome.storage.session.get(keys);
    }
  },

  async set(items: Record<string, any>): Promise<void> {
    if (isWebMode()) {
      for (const [key, value] of Object.entries(items)) {
        window.sessionStorage.setItem(
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      }
    } else {
      await chrome.storage.session.set(items);
    }
  },

  async remove(keys: string | string[]): Promise<void> {
    if (isWebMode()) {
      const keyArray = typeof keys === 'string' ? [keys] : keys;
      for (const key of keyArray) {
        window.sessionStorage.removeItem(key);
      }
    } else {
      await chrome.storage.session.remove(keys);
    }
  },

  async clear(): Promise<void> {
    if (isWebMode()) {
      window.sessionStorage.clear();
    } else {
      await chrome.storage.session.clear();
    }
  },
};

/**
 * Local Storage (Persistent)
 * - Extension: chrome.storage.local
 * - Web: localStorage
 */
export const localStorage = {
  async get(keys: string | string[]): Promise<Record<string, any>> {
    if (isWebMode()) {
      const result: Record<string, any> = {};
      const keyArray = typeof keys === 'string' ? [keys] : keys;
      
      for (const key of keyArray) {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      }
      return result;
    } else {
      return chrome.storage.local.get(keys);
    }
  },

  async set(items: Record<string, any>): Promise<void> {
    if (isWebMode()) {
      for (const [key, value] of Object.entries(items)) {
        window.localStorage.setItem(
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      }
    } else {
      await chrome.storage.local.set(items);
    }
  },

  async remove(keys: string | string[]): Promise<void> {
    if (isWebMode()) {
      const keyArray = typeof keys === 'string' ? [keys] : keys;
      for (const key of keyArray) {
        window.localStorage.removeItem(key);
      }
    } else {
      await chrome.storage.local.remove(keys);
    }
  },

  async clear(): Promise<void> {
    if (isWebMode()) {
      window.localStorage.clear();
    } else {
      await chrome.storage.local.clear();
    }
  },
};

// ===== Runtime API Abstraction =====

export const runtime = {
  getManifest(): { version: string; name: string } {
    if (isWebMode()) {
      return {
        version: '1.0.0-web',
        name: 'SimpliPass (Web Dev Mode)',
      };
    } else {
      return chrome.runtime.getManifest();
    }
  },

  get id(): string {
    if (isWebMode()) {
      return 'web-dev-mode';
    } else {
      return chrome.runtime.id;
    }
  },

  sendMessage(message: any): Promise<any> {
    if (isWebMode()) {
      console.warn('[Web Mode] chrome.runtime.sendMessage called:', message);
      return Promise.resolve({ success: false, reason: 'Web mode - no background script' });
    } else {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, resolve);
      });
    }
  },
};

// ===== Tabs API Abstraction =====

export const tabs = {
  async query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<Array<{ id?: number; url?: string; title?: string }>> {
    if (isWebMode()) {
      // In web mode, return current page info
      return [{
        id: 1,
        url: window.location.href,
        title: document.title,
      }];
    } else {
      return chrome.tabs.query(queryInfo);
    }
  },

  async sendMessage(tabId: number, message: any): Promise<any> {
    if (isWebMode()) {
      console.warn('[Web Mode] chrome.tabs.sendMessage called:', { tabId, message });
      return Promise.resolve({ success: false, reason: 'Web mode - no tabs API' });
    } else {
      return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, resolve);
      });
    }
  },

  async get(tabId: number): Promise<any> {
    if (isWebMode()) {
      return {
        id: tabId,
        url: window.location.href,
        title: document.title,
      };
    } else {
      return chrome.tabs.get(tabId);
    }
  },
};

// ===== Export unified browser API =====

export const browser = {
  storage: {
    session: sessionStorage,
    local: localStorage,
  },
  runtime,
  tabs,
  isWebMode,
};

export default browser;
