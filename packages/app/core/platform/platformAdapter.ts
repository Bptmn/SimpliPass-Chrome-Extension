/**
 * Platform adapter for handling platform-specific operations
 * Makes the app logic truly platform-agnostic
 */

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

const isTest = () => {
  return process.env.NODE_ENV === 'test';
};

// User secret key operations
export async function storeUserSecretKeyPlatform(key: string): Promise<void> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { setTestUserSecretKey } = await import('@app/core/platform/testHelpers');
    await setTestUserSecretKey(key);
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { setLocalStorageItem } = await import('@mobile/utils/localStorage');
    await setLocalStorageItem('userSecretKey', key);
  } else if (isExtension()) {
    // Extension platform - use chrome storage
    const { setLocalStorageItem } = await import('@extension/utils/localStorage');
    await setLocalStorageItem('userSecretKey', key);
  } else {
    throw new Error('Unsupported platform');
  }
}

export async function getUserSecretKeyPlatform(): Promise<string | null> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { getTestUserSecretKey } = await import('@app/core/platform/testHelpers');
    return await getTestUserSecretKey();
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { getLocalStorageItem } = await import('@mobile/utils/localStorage');
    return await getLocalStorageItem<string>('userSecretKey');
  } else if (isExtension()) {
    // Extension platform - use chrome storage
    const { getLocalStorageItem } = await import('@extension/utils/localStorage');
    return await getLocalStorageItem<string>('userSecretKey');
  } else {
    throw new Error('Unsupported platform');
  }
}

export async function deleteUserSecretKeyPlatform(): Promise<void> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { clearTestUserSecretKey } = await import('@app/core/platform/testHelpers');
    await clearTestUserSecretKey();
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { removeLocalStorageItem } = await import('@mobile/utils/localStorage');
    await removeLocalStorageItem('userSecretKey');
  } else if (isExtension()) {
    // Extension platform - use chrome storage
    const { removeLocalStorageItem } = await import('@extension/utils/localStorage');
    await removeLocalStorageItem('userSecretKey');
  } else {
    throw new Error('Unsupported platform');
  }
}

// Persistent user secret key operations
export async function storeUserSecretKeyPersistentPlatform(key: string, expiresAt: number): Promise<void> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { setTestUserSecretKeyPersistent } = await import('@app/core/platform/testHelpers');
    await setTestUserSecretKeyPersistent(key, expiresAt);
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { setLocalStorageItem } = await import('@mobile/utils/localStorage');
    await setLocalStorageItem('userSecretKey', key);
  } else if (isExtension()) {
    // Extension platform - use persistent storage
    const { storeUserSecretKeyPersistent } = await import('@app/core/sessionPersistent/storeUserSecretKeyPersistent');
    await storeUserSecretKeyPersistent(key, expiresAt);
  } else {
    throw new Error('Unsupported platform');
  }
}

export async function deleteUserSecretKeyPersistentPlatform(): Promise<void> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { clearTestUserSecretKeyPersistent } = await import('@app/core/platform/testHelpers');
    await clearTestUserSecretKeyPersistent();
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { removeLocalStorageItem } = await import('@mobile/utils/localStorage');
    await removeLocalStorageItem('userSecretKey');
  } else if (isExtension()) {
    // Extension platform - use persistent storage
    const { deleteUserSecretKeyPersistent } = await import('@app/core/sessionPersistent/deleteUserSecretKeyPersistent');
    await deleteUserSecretKeyPersistent();
  } else {
    throw new Error('Unsupported platform');
  }
}

// Local storage operations
export async function clearAllPlatform(): Promise<void> {
  if (isTest()) {
    // In test environment, clear in-memory storage
    const { clearTestStorage } = await import('@app/core/platform/testHelpers');
    await clearTestStorage();
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { clearLocalStorage } = await import('@mobile/utils/localStorage');
    await clearLocalStorage();
  } else if (isExtension()) {
    // Extension platform - use chrome storage
    const { clearLocalStorage } = await import('@extension/utils/localStorage');
    await clearLocalStorage();
  } else {
    throw new Error('Unsupported platform');
  }
}

// Memory operations
export async function loadVaultIntoMemoryPlatform(
  userId: string, 
  userSecretKey: string,
  allItems: any[]
): Promise<void> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { setTestVaultData } = await import('@app/core/platform/testHelpers');
    await setTestVaultData(allItems);
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - no memory management needed
    console.log('[Mobile] Memory management not needed - using states directly');
  } else if (isExtension()) {
    // Extension platform - use memory management
    const { 
      setCredentialsInMemory, 
      setBankCardsInMemory, 
      setSecureNotesInMemory 
    } = await import('@extension/session/memory');
    
    // Separate items by type
    const credentials = allItems.filter(item => 'username' in item) as any[];
    const bankCards = allItems.filter(item => 'cardNumber' in item) as any[];
    const secureNotes = allItems.filter(item => !('username' in item) && !('cardNumber' in item)) as any[];
    
    // Store in memory
    setCredentialsInMemory(credentials);
    setBankCardsInMemory(bankCards);
    setSecureNotesInMemory(secureNotes);
  } else {
    throw new Error('Unsupported platform');
  }
}

// Browser operations
export async function setRememberedEmailPlatform(email: string | null): Promise<void> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { setTestRememberedEmail } = await import('@app/core/platform/testHelpers');
    await setTestRememberedEmail(email);
    return;
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { setLocalStorageItem, removeLocalStorageItem } = await import('@mobile/utils/localStorage');
    if (email) {
      await setLocalStorageItem('simplipass_remembered_email', email);
    } else {
      await removeLocalStorageItem('simplipass_remembered_email');
    }
  } else if (isExtension()) {
    // Extension platform - use chrome storage
    const { setLocalStorageItem, removeLocalStorageItem } = await import('@extension/utils/localStorage');
    if (email) {
      await setLocalStorageItem('simplipass_remembered_email', email);
    } else {
      await removeLocalStorageItem('simplipass_remembered_email');
    }
  } else {
    throw new Error('Unsupported platform');
  }
}

export async function getRememberedEmailPlatform(): Promise<string | null> {
  if (isTest()) {
    // In test environment, use in-memory storage
    const { getTestRememberedEmail } = await import('@app/core/platform/testHelpers');
    return await getTestRememberedEmail();
  }
  
  if (isMobile()) {
    // Mobile platform - use secure storage
    const { getLocalStorageItem } = await import('@mobile/utils/localStorage');
    return await getLocalStorageItem<string>('simplipass_remembered_email');
  } else if (isExtension()) {
    // Extension platform - use chrome storage
    const { getLocalStorageItem } = await import('@extension/utils/localStorage');
    return await getLocalStorageItem<string>('simplipass_remembered_email');
  } else {
    throw new Error('Unsupported platform');
  }
} 