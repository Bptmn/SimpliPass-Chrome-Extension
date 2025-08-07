/**
 * Content Script - Chrome Extension
 * 
 * This content script is injected into every page. It acts as an organizer that:
 * - Detects login fields using fieldDetection utility
 * - Manages popover display using popoverManager utility
 * - Handles credential injection using credentialInjection utility
 * - Coordinates communication between background script and page
 */

// Simple stubs to avoid React Native dependencies in content script
interface LoginField {
  element: HTMLElement;
  type: 'username' | 'email';
  form?: HTMLFormElement;
}

interface PageInfo {
  url: string;
  domain: string;
  hasLoginForm: boolean;
}

// Real field detection implementation
const detectLoginFields = (): LoginField[] => {
  console.log('[Content Script] detectLoginFields called');
  
  const loginFields: LoginField[] = [];
  
  // Find all input fields that could be login fields
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
  
  inputs.forEach((input) => {
    const element = input as HTMLInputElement;
    
    // Skip if not visible
    if (element.style.display === 'none' || element.style.visibility === 'hidden') {
      return;
    }
    
    // Skip if autocomplete is explicitly disabled
    if (element.autocomplete === 'off') {
      return;
    }
    
    // Check if this looks like a login field
    const name = element.name?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    const placeholder = element.placeholder?.toLowerCase() || '';
    const type = element.type?.toLowerCase() || '';
    
    // Common patterns for login fields
    const isLoginField = 
      name.includes('email') || name.includes('username') || name.includes('login') ||
      id.includes('email') || id.includes('username') || id.includes('login') ||
      placeholder.includes('email') || placeholder.includes('phone') || placeholder.includes('username') ||
      type === 'email' ||
      element.autocomplete === 'username' ||
      element.autocomplete === 'email';
    
    if (isLoginField) {
      const form = element.closest('form') || undefined;
      const fieldType: 'username' | 'email' = type === 'email' ? 'email' : 'username';
      
      loginFields.push({
        element,
        type: fieldType,
        form
      });
      
      console.log('[Content Script] Found login field:', {
        name: element.name,
        id: element.id,
        placeholder: element.placeholder,
        type: element.type,
        autocomplete: element.autocomplete
      });
    }
  });
  
  console.log('[Content Script] Total login fields detected:', loginFields.length);
  return loginFields;
};

const getPageInfo = (): PageInfo => {
  return {
    url: window.location.href,
    domain: window.location.hostname,
    hasLoginForm: false
  };
};

// Real popover management implementation
let currentPopover: HTMLElement | null = null;
let clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

const createPopover = (content: string, field: HTMLElement): HTMLElement => {
  // Remove existing popover
  if (currentPopover) {
    document.body.removeChild(currentPopover);
    // Remove existing click outside handler
    if (clickOutsideHandler) {
      document.removeEventListener('click', clickOutsideHandler);
      clickOutsideHandler = null;
    }
  }
  
  // Create popover element
  const popover = document.createElement('div');
  popover.style.cssText = `
    position: fixed;
    z-index: 999999;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    min-width: 200px;
  `;
  
  // Create content without inline event handlers
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = content;
  
  // Position popover below the field
  const fieldRect = field.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Calculate position to be below the field
  const popoverLeft = fieldRect.left + scrollLeft;
  const popoverTop = fieldRect.bottom + scrollTop + 5;
  
  popover.style.left = `${popoverLeft}px`;
  popover.style.top = `${popoverTop}px`;
  
  // Add content to popover
  popover.appendChild(contentDiv);
  
  // Add to page
  document.body.appendChild(popover);
  currentPopover = popover;
  
  // Add click outside handler
  clickOutsideHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (popover && !popover.contains(target) && target !== field) {
      console.log('[Content Script] Click outside popover detected, closing popover');
      removePopover();
    }
  };
  
  // Add event listener with a small delay to prevent immediate closure
  setTimeout(() => {
    document.addEventListener('click', clickOutsideHandler);
  }, 100);
  
  console.log('[Content Script] Popover created and positioned at:', { left: popoverLeft, top: popoverTop });
  return popover;
};

const removePopover = () => {
  if (currentPopover) {
    document.body.removeChild(currentPopover);
    currentPopover = null;
  }
  
  // Remove click outside handler
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
    clickOutsideHandler = null;
  }
};

const showPopoverCredentialPicker = (field: HTMLElement, credentials: any[], _loginFields: LoginField[]) => {
  console.log('[Content Script] showPopoverCredentialPicker called');
  
  const content = `
    <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Select Credential</div>
    ${credentials.map((cred, index) => `
      <div class="credential-option" data-index="${index}" style="padding: 8px; border-bottom: 1px solid #eee; cursor: pointer;">
        <div style="font-weight: 500;">${cred.title}</div>
        <div style="font-size: 12px; color: #666;">${cred.username}</div>
      </div>
    `).join('')}
    <div class="open-manager" style="padding: 8px; color: #007bff; cursor: pointer; text-align: center; margin-top: 8px;">
      Open SimpliPass Manager
    </div>
  `;
  
  const popover = createPopover(content, field);
  
  // Add event listeners
  popover.querySelectorAll('.credential-option').forEach((option, index) => {
    option.addEventListener('click', () => {
      console.log('Credential selected:', credentials[index].title);
      removePopover();
    });
  });
  
  popover.querySelector('.open-manager')?.addEventListener('click', () => {
    console.log('Open manager clicked');
    window.open(`chrome-extension://${chrome.runtime.id}/popup.html`, '_blank');
    removePopover();
  });
};

const showLoginPromptPopover = (field: HTMLElement, _loginFields: LoginField[]) => {
  console.log('[Content Script] showLoginPromptPopover called');
  
  const content = `
    <div style="margin-bottom: 8px; font-weight: 600; color: #333;">SimpliPass</div>
    <div style="margin-bottom: 12px; color: #666; font-size: 13px;">
      Please log in to SimpliPass to use autofill features.
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="login-btn" style="flex: 1; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Log In
      </button>
      <button class="dismiss-btn" style="flex: 1; padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Dismiss
      </button>
    </div>
  `;
  
  const popover = createPopover(content, field);
  
  // Add event listeners
  popover.querySelector('.login-btn')?.addEventListener('click', () => {
    console.log('Login clicked');
    // Open the extension popup using Chrome API
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    removePopover();
  });
  
  popover.querySelector('.dismiss-btn')?.addEventListener('click', () => {
    console.log('Dismiss clicked');
    removePopover();
  });
};

const showPasswordGeneratorPopover = (field: HTMLInputElement, _options?: any) => {
  console.log('[Content Script] showPasswordGeneratorPopover called');
  
  const content = `
    <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Generate Password</div>
    <div style="margin-bottom: 12px; color: #666; font-size: 13px;">
      Generate a strong password for this field.
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="generate-btn" style="flex: 1; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Generate
      </button>
      <button class="dismiss-btn" style="flex: 1; padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Dismiss
      </button>
    </div>
  `;
  
  const popover = createPopover(content, field);
  
  // Add event listeners
  popover.querySelector('.generate-btn')?.addEventListener('click', () => {
    console.log('Generate password clicked');
    removePopover();
  });
  
  popover.querySelector('.dismiss-btn')?.addEventListener('click', () => {
    console.log('Dismiss clicked');
    removePopover();
  });
};

const showSaveCredentialPopover = async (_data: any) => {
  console.log('[Content Script] showSaveCredentialPopover called');
  
  // Check if save credential is available (requires user secret key)
  const saveResponse = await new Promise<{ isAvailable: boolean }>((resolve) => {
    chrome.runtime.sendMessage({ 
      type: 'GET_SAVE_CREDENTIAL_STATUS'
    }, resolve);
  });
  
  if (!saveResponse || !saveResponse.isAvailable) {
    console.log('[Content Script] Save credential not available (no valid session or no user secret key)');
    // Show a message that user needs to log in with master password
    const content = `
      <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Save Credential</div>
      <div style="margin-bottom: 12px; color: #666; font-size: 13px;">
        Please log in to SimpliPass with your master password to save credentials.
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="login-btn" style="flex: 1; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
          Log In
        </button>
        <button class="dismiss-btn" style="flex: 1; padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
          Dismiss
        </button>
      </div>
    `;
    
    const popover = document.createElement('div');
    popover.style.cssText = `
      position: fixed;
      z-index: 999999;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      min-width: 200px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = content;
    popover.appendChild(contentDiv);
    document.body.appendChild(popover);
    currentPopover = popover;
    
    // Add event listeners
    popover.querySelector('.login-btn')?.addEventListener('click', () => {
      console.log('Login clicked for save credential');
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
      removePopover();
    });
    
    popover.querySelector('.dismiss-btn')?.addEventListener('click', () => {
      console.log('Dismiss clicked');
      removePopover();
    });
    return;
  }
  
  // Save credential is available, show the save form
  const content = `
    <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Save Credential</div>
    <div style="margin-bottom: 12px; color: #666; font-size: 13px;">
      Save this login information to SimpliPass?
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="save-btn" style="flex: 1; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Save
      </button>
      <button class="dismiss-btn" style="flex: 1; padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Dismiss
      </button>
    </div>
  `;
  
  const popover = document.createElement('div');
  popover.style.cssText = `
    position: fixed;
    z-index: 999999;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    min-width: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;
  
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = content;
  popover.appendChild(contentDiv);
  document.body.appendChild(popover);
  currentPopover = popover;
  
  // Add event listeners
  popover.querySelector('.save-btn')?.addEventListener('click', () => {
    console.log('Save credential clicked');
    removePopover();
  });
  
  popover.querySelector('.dismiss-btn')?.addEventListener('click', () => {
    console.log('Dismiss clicked');
    removePopover();
  });
};

const showUpdateCredentialPopover = (_data: any) => {
  console.log('[Content Script] showUpdateCredentialPopover called');
  
  const content = `
    <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Update Credential</div>
    <div style="margin-bottom: 12px; color: #666; font-size: 13px;">
      Update existing credential with new information?
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="update-btn" style="flex: 1; padding: 8px 12px; background: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Update
      </button>
      <button class="dismiss-btn" style="flex: 1; padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
        Dismiss
      </button>
    </div>
  `;
  
  // Create popover without specific field (for form submission)
  const popover = document.createElement('div');
  popover.style.cssText = `
    position: fixed;
    z-index: 999999;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    min-width: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;
  
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = content;
  popover.appendChild(contentDiv);
  document.body.appendChild(popover);
  currentPopover = popover;
  
  // Add event listeners
  popover.querySelector('.update-btn')?.addEventListener('click', () => {
    console.log('Update credential clicked');
    removePopover();
  });
  
  popover.querySelector('.dismiss-btn')?.addEventListener('click', () => {
    console.log('Dismiss clicked');
    removePopover();
  });
};

const removeInPagePicker = () => {
  console.log('[Content Script] removeInPagePicker called');
  removePopover();
};

const removeLoginPrompt = () => {
  console.log('[Content Script] removeLoginPrompt called');
  removePopover();
};

const updatePickerSize = () => {
  console.log('[Content Script] updatePickerSize called');
  // Could implement dynamic sizing if needed
};

// Simple stubs for credential injection
const injectCredential = (_field: HTMLElement, _credential: any) => {
  console.log('[Content Script] injectCredential called');
};

// Simple stubs for services
const passwordGenerationService = {
  detectPasswordFields: () => {
    console.log('[Content Script] passwordGenerationService.detectPasswordFields called');
    
    const passwordFields: Array<{ element: HTMLInputElement; form?: HTMLFormElement; fieldType: 'new-password' | 'password' }> = [];
    
    // Find all password input fields
    const inputs = document.querySelectorAll('input[type="password"]');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      // Skip if not visible
      if (element.style.display === 'none' || element.style.visibility === 'hidden') {
        return;
      }
      
      // Skip if autocomplete is explicitly disabled
      if (element.autocomplete === 'off') {
        return;
      }
      
      // Determine field type
      let fieldType: 'new-password' | 'password' = 'password';
      if (element.autocomplete === 'new-password' || 
          element.name?.toLowerCase().includes('new') ||
          element.name?.toLowerCase().includes('confirm')) {
        fieldType = 'new-password';
      }
      
      const form = element.closest('form') || undefined;
      
      passwordFields.push({
        element,
        form,
        fieldType,
      });
      
      console.log('[Content Script] Found password field:', {
        name: element.name,
        id: element.id,
        type: element.type,
        autocomplete: element.autocomplete,
        fieldType
      });
    });
    
    console.log('[Content Script] Total password fields detected:', passwordFields.length);
    return passwordFields;
  },
  isFieldEligibleForGeneration: (field: HTMLInputElement) => {
    console.log('[Content Script] passwordGenerationService.isFieldEligibleForGeneration called');
    
    // Check if this is a signup/register form
    const form = field.closest('form');
    if (!form) return false;
    
    // Check for signup indicators
    const formAction = form.action?.toLowerCase() || '';
    const formId = form.id?.toLowerCase() || '';
    const formClass = form.className?.toLowerCase() || '';
    
    const isSignupForm = 
      formAction.includes('signup') || formAction.includes('register') || formAction.includes('sign-up') ||
      formId.includes('signup') || formId.includes('register') || formId.includes('sign-up') ||
      formClass.includes('signup') || formClass.includes('register') || formClass.includes('sign-up') ||
      field.autocomplete === 'new-password' ||
      field.name?.toLowerCase().includes('new') ||
      field.name?.toLowerCase().includes('confirm');
    
    console.log('[Content Script] Field eligible for generation:', isSignupForm);
    return isSignupForm;
  },
  getSuggestedOptions: (field: HTMLInputElement) => {
    console.log('[Content Script] passwordGenerationService.getSuggestedOptions called');
    return {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    };
  },
  generatePassword: () => {
    console.log('[Content Script] passwordGenerationService.generatePassword called');
    return 'generated-password';
  }
};

const formCaptureUtility = {
  startCapture: () => {
    console.log('[Content Script] formCaptureUtility.startCapture called');
  },
  stopCapture: () => {
    console.log('[Content Script] formCaptureUtility.stopCapture called');
  },
  initializeFormCapture: () => {
    console.log('[Content Script] formCaptureUtility.initializeFormCapture called');
  }
};

const credentialCaptureService = {
  processCapturedCredentials: () => {
    console.log('[Content Script] credentialCaptureService.processCapturedCredentials called');
  }
};

const securityService = {
  isAutofillSafe: () => {
    console.log('[Content Script] securityService.isAutofillSafe called');
    return { isValid: true, reason: 'stub' };
  }
};

// Debounce function to avoid excessive scanning
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Global state
let loginFields: LoginField[] = [];
let passwordFields: HTMLInputElement[] = [];
let isProcessingField = false; // Flag to prevent duplicate processing

// ✅ NEW: Page capabilities (pre-checked on page load)
let pageCapabilities: {
  canAutofill: boolean;
  canSaveCredential: boolean;
  canGeneratePassword: boolean;
  hasCredentials: boolean;
  isAuthenticated: boolean;
} | null = null;

// ✅ NEW: Check page capabilities on load
async function _checkPageCapabilities(): Promise<void> {
  try {
    console.log('[Content Script] Checking page capabilities on load');
    const response = await new Promise<{ capabilities: any }>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: 'GET_PAGE_CAPABILITIES'
      }, resolve);
    });
    
    if (response && response.capabilities) {
      pageCapabilities = response.capabilities;
      console.log('[Content Script] Page capabilities loaded:', pageCapabilities);
    }
  } catch (error) {
    console.error('[Content Script] Error checking page capabilities:', error);
    pageCapabilities = {
      canAutofill: false,
      canSaveCredential: false,
      canGeneratePassword: true,
      hasCredentials: false,
      isAuthenticated: false
    };
  }
}

/**
 * Handle field click events
 */
async function handleFieldClick(e: Event): Promise<void> {
  const field = e.target as HTMLElement;
  
  // Prevent duplicate processing
  if (isProcessingField) {
    return;
  }
  
  // Security validation
  const securityCheck = securityService.isAutofillSafe();
  if (!securityCheck.isValid) {
    console.warn('[Content Script] Security check failed:', securityCheck.reason);
    return;
  }
  
  // Check if this is a detected login field
  const loginField = loginFields.find(f => f.element === field);
  if (!loginField) return;
  
  isProcessingField = true;
  
  try {
    // Check autofill availability (requires login + credentials)
    const autofillResponse = await new Promise<{ isValid: boolean }>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: 'GET_SESSION_STATUS'
      }, resolve);
    });
    
    if (!autofillResponse || !autofillResponse.isValid) {
      console.log('[Content Script] Autofill not available (no valid session or no credentials), showing login prompt');
      showLoginPromptPopover(field, loginFields);
      return;
    }

    // Get matching credentials for current domain
    const response = await new Promise<{ credentials: Array<{ id: string; title: string; username: string; url?: string }> }>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: 'GET_MATCHING_CREDENTIALS', 
        domain: getPageInfo().domain 
      }, resolve);
    });
    
    if (response && response.credentials && response.credentials.length > 0) {
      showPopoverCredentialPicker(field, response.credentials, loginFields);
    } else {
      console.log('[Content Script] No matching credentials found for autofill');
      removeInPagePicker();
    }
  } catch (error) {
    console.error('Error getting credentials:', error);
    removeInPagePicker();
  } finally {
    // Reset flag after a short delay to allow for natural user interactions
    setTimeout(() => {
      isProcessingField = false;
    }, 100);
  }
}

/**
 * Handle password field click events
 */
async function handlePasswordFieldClick(e: Event): Promise<void> {
  const field = e.target as HTMLInputElement;
  
  // Prevent duplicate processing
  if (isProcessingField) {
    return;
  }
  
  // Security validation
  const securityCheck = securityService.isAutofillSafe();
  if (!securityCheck.isValid) {
    console.warn('[Content Script] Security check failed for password field:', securityCheck.reason);
    return;
  }
  
  // Check if this is a detected password field
  if (!passwordFields.includes(field)) return;
  
  isProcessingField = true;
  
  try {
    // Check if this is a signup form (eligible for password generation)
    if (passwordGenerationService.isFieldEligibleForGeneration(field)) {
      console.log('[Content Script] Password field eligible for generation (signup form)');
      
      // Get suggested options based on field context
      const suggestedOptions = passwordGenerationService.getSuggestedOptions(field);
      
      // Show password generator popover
      showPasswordGeneratorPopover(field, suggestedOptions);
    } else {
      console.log('[Content Script] Password field not eligible for generation (login form)');
      
      // For login forms, check autofill availability (requires login + credentials)
      const autofillResponse = await new Promise<{ isValid: boolean }>((resolve) => {
        chrome.runtime.sendMessage({ type: 'GET_SESSION_STATUS' }, resolve);
      });
      
      if (autofillResponse && autofillResponse.isValid) {
        console.log('[Content Script] Autofill available for password field');
        
        // Get matching credentials for current domain
        const credentialsResponse = await new Promise<{ credentials: Array<{ id: string; title: string; username: string; url?: string }> }>((resolve) => {
          chrome.runtime.sendMessage({ 
            type: 'GET_MATCHING_CREDENTIALS', 
            domain: getPageInfo().domain 
          }, resolve);
        });
        
        if (credentialsResponse && credentialsResponse.credentials && credentialsResponse.credentials.length > 0) {
          showPopoverCredentialPicker(field, credentialsResponse.credentials, loginFields);
        } else {
          console.log('[Content Script] No matching credentials found for password field');
          removeInPagePicker();
        }
      } else {
        console.log('[Content Script] Autofill not available for password field, showing login prompt');
        showLoginPromptPopover(field, loginFields);
      }
    }
    
  } catch (error) {
    console.error('Error handling password field click:', error);
  } finally {
    // Reset flag after a short delay
    setTimeout(() => {
      isProcessingField = false;
    }, 100);
  }
}

/**
 * Setup event listeners for detected login fields
 */
function setupLoginFieldListeners(): void {
  // Remove existing listeners
  loginFields.forEach(field => {
    field.element.removeEventListener('click', handleFieldClick);
  });
  
  // Add listeners to detected fields
  loginFields.forEach(field => {
    field.element.addEventListener('click', handleFieldClick);
  });
}

/**
 * Setup event listeners for detected password fields
 */
function setupPasswordFieldListeners(): void {
  // Remove existing listeners
  passwordFields.forEach(field => {
    field.removeEventListener('click', handlePasswordFieldClick);
  });
  
  // Add listeners to detected fields
  passwordFields.forEach(field => {
    field.addEventListener('click', handlePasswordFieldClick);
  });
}

/**
 * Update field detection and listeners
 */
function updateFieldDetection(): void {
  loginFields = detectLoginFields();
  console.log('[Content Script] Detected login fields:', loginFields.length);
  setupLoginFieldListeners();
  
  // Detect password fields for generation
  const detectedPasswordFields = passwordGenerationService.detectPasswordFields();
  passwordFields = detectedPasswordFields.map(field => field.element);
  console.log('[Content Script] Detected password fields for generation:', passwordFields.length);
  setupPasswordFieldListeners();
}

// Debounced field detection
const debouncedDetectFields = debounce(updateFieldDetection, 300);

// Initialize page
const pageInfo = getPageInfo();

// Register content script with background for log forwarding
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });

// Send page info to background script
chrome.runtime.sendMessage({ type: 'PAGE_INFO', ...pageInfo });

// Detect fields on page load
debouncedDetectFields();

// Initialize form capture
formCaptureUtility.initializeFormCapture();

// Listen for DOM changes to detect dynamically added fields
const observer = new MutationObserver(debouncedDetectFields);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

// Listen for messages from the iframe for actions
window.addEventListener('message', (event) => {
  const { type, credential, height, width } = event.data || {};
  
  if (type === 'POPOVER_RESIZE') {
    updatePickerSize(height, width);
  } else if (type === 'PICK_CREDENTIAL' && credential) {
    if (credential.id) {
      // Request full credential data from background
      chrome.runtime.sendMessage({
        type: 'INJECT_CREDENTIAL',
        credentialId: credential.id
      });
    }
    removeInPagePicker();
  } else if (type === 'CLOSE_POPOVER') {
    removeInPagePicker();
  } else if (type === 'LOGIN_PROMPT_CANCEL') {
    removeLoginPrompt();
  } else if (type === 'LOGIN_PROMPT_LOGIN') {
    removeLoginPrompt();
    // Open the extension popup
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  }
});

// Listen for credential injection messages from background script
chrome.runtime.onMessage.addListener(async (msg: { type: string; username?: string; password?: string; level?: string; message?: string; data?: any }) => {
  if (msg && msg.type === 'INJECT_CREDENTIAL' && msg.username && msg.password) {
    injectCredential(msg.username, msg.password);
    removeInPagePicker();
      } else if (msg && msg.type === 'CAPTURE_CREDENTIALS' && msg.data) {
      // Handle captured credentials
      try {
        await credentialCaptureService.processCapturedCredentials(msg.data);
        
        // Check if this is an update to an existing credential
        const updateCheck = await credentialCaptureService.isCredentialUpdate(msg.data);
        
        if (updateCheck.isUpdate && updateCheck.existingCredential) {
          // Show update credential popover
          showUpdateCredentialPopover(msg.data, updateCheck.existingCredential);
        } else {
          // Check if we should show save prompt for new credential
          const shouldShowPrompt = await credentialCaptureService.shouldShowSavePrompt(msg.data);
          
          if (shouldShowPrompt) {
            const suggestedTitle = credentialCaptureService.getSuggestedTitle(msg.data);
            showSaveCredentialPopover(msg.data, suggestedTitle);
          }
        }
      } catch (error) {
        console.error('[Content Script] Error processing captured credentials:', error);
      }
    } else if (msg && msg.type === 'SHOW_CONTEXT_MENU_CREDENTIAL_PICKER') {
      // Handle context menu credential picker
      try {
        const domain = window.location.hostname;
        const credentials = await getMatchingCredentials(domain);
        
        if (credentials.length > 0) {
          // Find the current focused field
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            showPopoverCredentialPicker(activeElement, credentials, []);
          }
        }
      } catch (error) {
        console.error('[Content Script] Error showing context menu credential picker:', error);
      }
    } else if (msg && msg.type === 'SHOW_CONTEXT_MENU_PASSWORD_GENERATOR') {
      // Handle context menu password generator
      try {
        const activeElement = document.activeElement as HTMLInputElement;
        if (activeElement && activeElement.type === 'password') {
          showPasswordGeneratorPopover(activeElement);
        }
      } catch (error) {
        console.error('[Content Script] Error showing context menu password generator:', error);
      }
    } else if (msg && msg.type === 'SHOW_CONTEXT_MENU_SAVE_FORM') {
      // Handle context menu save form
      try {
        // Security validation
        const securityCheck = securityService.isAutofillSafe();
        if (!securityCheck.isValid) {
          console.warn('[Content Script] Security check failed for save form:', securityCheck.reason);
          return;
        }
        
        // Trigger form capture and save
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          const form = forms[0] as HTMLFormElement;
          const capturedData = formCaptureUtility.extractCredentialsFromForm(form);
          
          if (capturedData) {
            const fullCapturedData = {
              username: capturedData.username,
              password: capturedData.password,
              url: window.location.href,
              domain: window.location.hostname,
              timestamp: Date.now(),
              formId: form.id || undefined,
              fieldNames: {
                username: capturedData.usernameField?.name,
                password: capturedData.passwordField?.name
              }
            };
            
            // Security validation for form data
            const formDataValidation = securityService.validateFormData(fullCapturedData);
            if (!formDataValidation.isValid) {
              console.warn('[Content Script] Form data validation failed:', formDataValidation.reason);
              return;
            }
            
            // Check if this is an update or new credential
            const updateCheck = await credentialCaptureService.isCredentialUpdate(fullCapturedData);
            
            if (updateCheck.isUpdate && updateCheck.existingCredential) {
              showUpdateCredentialPopover(fullCapturedData, updateCheck.existingCredential);
            } else {
              const suggestedTitle = credentialCaptureService.getSuggestedTitle(fullCapturedData);
              showSaveCredentialPopover(fullCapturedData, suggestedTitle);
            }
          }
        }
      } catch (error) {
        console.error('[Content Script] Error saving form from context menu:', error);
      }
  } else if (msg && msg.type === 'BACKGROUND_LOG') {
    // Display background logs in content script console
    const prefix = '[Background → Content]';
    switch (msg.level) {
      case 'error':
        console.error(prefix, msg.message);
        break;
      case 'warn':
        console.warn(prefix, msg.message);
        break;
      default:
        console.log(prefix, msg.message);
    }
  }
});
