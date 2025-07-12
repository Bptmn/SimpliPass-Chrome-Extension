/**
 * Platform-agnostic clipboard operations
 * Abstracts clipboard functionality for mobile and extension platforms
 */

export interface ClipboardAdapter {
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
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

// Mobile clipboard implementation (placeholder - needs React Native clipboard library)
const mobileClipboard: ClipboardAdapter = {
  async writeText(_text: string): Promise<void> {
    // TODO: Implement with React Native clipboard library
    // import Clipboard from '@react-native-clipboard/clipboard';
    // Clipboard.setString(text);
    throw new Error('Mobile clipboard not implemented yet');
  },
  
  async readText(): Promise<string> {
    // TODO: Implement with React Native clipboard library
    // import Clipboard from '@react-native-clipboard/clipboard';
    // return Clipboard.getString();
    throw new Error('Mobile clipboard not implemented yet');
  }
};

// Extension clipboard implementation
const extensionClipboard: ClipboardAdapter = {
  async writeText(text: string): Promise<void> {
    // For Chrome extension, we can use the web clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API not available');
    }
  },
  
  async readText(): Promise<string> {
    // For Chrome extension, we can use the web clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      return await navigator.clipboard.readText();
    } else {
      throw new Error('Clipboard API not available');
    }
  }
};

// Get the appropriate clipboard implementation
export function getClipboardAdapter(): ClipboardAdapter {
  if (isMobile()) {
    return mobileClipboard;
  } else if (isExtension()) {
    return extensionClipboard;
  } else {
    throw new Error('Unsupported platform - only mobile and extension are supported');
  }
}

// Convenience function for writing text
export async function writeToClipboard(text: string): Promise<void> {
  const clipboard = getClipboardAdapter();
  await clipboard.writeText(text);
}

// Convenience function for reading text
export async function readFromClipboard(): Promise<string> {
  const clipboard = getClipboardAdapter();
  return await clipboard.readText();
} 