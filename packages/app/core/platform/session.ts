/**
 * Platform-agnostic session management
 * Abstracts session functionality for mobile and extension platforms
 */

export interface SessionAdapter {
  clearMemory(): Promise<void>;
  getSessionDuration(): Promise<number>;
  setSessionDuration(duration: number): Promise<void>;
}

// Platform detection
const isMobile = () => {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return true;
  }
  return false;
};

const isExtension = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return true;
  }
  return false;
};

// Mobile session implementation (placeholder)
const mobileSession: SessionAdapter = {
  async clearMemory(): Promise<void> {
    // TODO: Implement mobile memory management
    console.log('[Mobile] Memory clear not implemented yet');
  },
  
  async getSessionDuration(): Promise<number> {
    // TODO: Implement mobile session duration
    return 30 * 60 * 1000; // 30 minutes default
  },
  
  async setSessionDuration(_duration: number): Promise<void> {
    // TODO: Implement mobile session duration storage
    console.log('[Mobile] Session duration not implemented yet');
  }
};

// Extension session implementation
const extensionSession: SessionAdapter = {
  async clearMemory(): Promise<void> {
    // Dynamic import to avoid circular dependencies
    const { clearMemory } = await import('@extension/session/memory');
    await clearMemory();
  },
  
  async getSessionDuration(): Promise<number> {
    // Default session duration for extension
    return 30 * 60 * 1000; // 30 minutes
  },
  
  async setSessionDuration(duration: number): Promise<void> {
    // Store in chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ session_duration: duration });
    }
  }
};

// Get the appropriate session implementation
export function getSessionAdapter(): SessionAdapter {
  if (isMobile()) {
    return mobileSession;
  } else if (isExtension()) {
    return extensionSession;
  } else {
    throw new Error('Unsupported platform - only mobile and extension are supported');
  }
}

// Convenience functions
export async function clearSessionMemory(): Promise<void> {
  const session = getSessionAdapter();
  await session.clearMemory();
}

export async function getSessionDuration(): Promise<number> {
  const session = getSessionAdapter();
  return await session.getSessionDuration();
}

export async function setSessionDuration(duration: number): Promise<void> {
  const session = getSessionAdapter();
  await session.setSessionDuration(duration);
} 